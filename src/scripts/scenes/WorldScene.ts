import { SmoothGraphics } from "@pixi/graphics-smooth";
import {
   Color,
   Container,
   FederatedPointerEvent,
   IPointData,
   LINE_CAP,
   LINE_JOIN,
   ParticleContainer,
   Sprite,
   TilingSprite,
   utils,
} from "pixi.js";
import { getGameOptions, getGameState, TILE_SIZE } from "../Global";
import { GameOptions, GameState } from "../logic/GameState";
import { TilePage } from "../ui/TilePage";
import { clamp, forEach, lerp, lookAt, pointToXy, xyToPoint } from "../utilities/Helper";
import Action from "../utilities/pixi-actions/actions/Action";
import { CustomAction } from "../utilities/pixi-actions/actions/CustomAction";
import { Easing } from "../utilities/pixi-actions/Easing";
import { ViewportScene } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";
import { v2, Vector2 } from "../utilities/Vector2";
import { TileVisual } from "./TileVisual";
import { TooltipPool } from "./TooltipPool";
import { TransportPool } from "./TransportPool";

let viewportCenter: IPointData | null = null;
let viewportZoom: number | null = null;

export class WorldScene extends ViewportScene {
   private _width!: number;
   private _height!: number;
   private _selectedGraphics!: SmoothGraphics;
   private _transportLines!: SmoothGraphics;
   private _transportPool!: TransportPool;
   public tooltipPool!: TooltipPool;
   private cameraMovement: Action | null = null;
   private readonly _tiles: utils.Dict<TileVisual> = {};
   private readonly _transport: Record<number, Sprite> = {};
   private _bg!: TilingSprite;
   private _graphics!: SmoothGraphics;

   override onLoad(): void {
      const { app, textures } = this.context;
      const maxPosition = Singleton().grid.maxPosition();
      this._width = maxPosition.x;
      this._height = maxPosition.y;

      this.viewport.worldWidth = this._width;
      this.viewport.worldHeight = this._height;

      this.viewport
         .drag()
         .wheel({ smooth: 10 })
         .clamp({
            direction: "all",
         })
         .clampZoom({
            maxScale: 2,
            minScale: Math.max(app.screen.width / this._width, app.screen.height / this._height),
         });

      this._bg = this.viewport.addChild(new TilingSprite(textures.Paper, this._width, this._height));
      this._bg.tint = Color.shared.setValue(getGameOptions().themeColors.WorldBackground);
      this._bg.position.set((this._width - this._bg.width) / 2, (this._height - this._bg.height) / 2);

      this._graphics = this.viewport.addChild(new SmoothGraphics()).lineStyle({
         color: 0xffffff,
         width: 2,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
         alignment: 0.5,
      });
      this._graphics.alpha = 0.1;
      Singleton().grid.drawGrid(this._graphics);

      Singleton().grid.forEach((grid) => {
         const xy = pointToXy(grid);
         this._tiles[xy] = this.viewport.addChild(new TileVisual(this, grid));
      });

      this.tooltipPool = new TooltipPool(this.viewport.addChild(new Container()));
      this._transportPool = new TransportPool(
         textures.Transport,
         this.viewport.addChild(
            new ParticleContainer(1500, {
               position: true,
               rotation: true,
               alpha: true,
            })
         )
      );
      this._selectedGraphics = this.viewport.addChild(new SmoothGraphics());
      this._transportLines = this.viewport.addChild(new SmoothGraphics());

      if (!viewportCenter) {
         viewportCenter = { x: this._width / 2, y: this._height / 2 };
      }
      this.viewport.moveCenter(viewportCenter);
      if (viewportZoom) {
         this.viewport.setZoom(viewportZoom, true);
      }

      this.viewport.on("moved", () => {
         viewportCenter = this.viewport.center;
         viewportZoom = this.viewport.scaled;
      });

      this.viewport.on("clicked", (e) => {
         const grid = Singleton().grid.positionToGrid(e.world);
         if ((e.event as FederatedPointerEvent).button === 2) {
            return;
         }
         this.selectGrid(grid);
      });

      this.selectGrid(xyToPoint(Singleton().buildings.Headquarter.xy));
   }

   override onGameStateChanged(gameState: GameState): void {
      forEach(this._tiles, (xy, visual) => visual.onTileDataChanged(gameState.tiles[xy]));
   }

   override onGameOptionsChanged(gameOptions: GameOptions): void {
      this._bg.tint = Color.shared.setValue(gameOptions.themeColors.WorldBackground);
      this._graphics.tint = Color.shared.setValue(gameOptions.themeColors.GridColor);
      this._graphics.alpha = gameOptions.themeColors.GridAlpha;
      this._selectedGraphics.tint = Color.shared.setValue(gameOptions.themeColors.SelectedGridColor);
      forEach(this._tiles, (xy, visual) => visual.updateDepositColor(gameOptions));
   }

   lookAtXy(xy: string) {
      this.cameraMovement?.stop();
      const clampedCenter = this.clampCenter(Singleton().grid.xyToPosition(xy));
      this.cameraMovement = new CustomAction(
         () => viewportCenter,
         (v) => {
            viewportCenter = v;
            this.viewport.moveCenter(viewportCenter!);
         },
         (a, b, f) => {
            if (a && b) {
               return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
            }
            throw new Error(`Cannot interpolate from a = ${a} to b = ${b}`);
         },
         clampedCenter,
         v2(clampedCenter).subtractSelf(viewportCenter!).length() / 2000,
         Easing.InOutSine
      ).start();
      this.drawSelection(xyToPoint(xy));
   }

   drawSelection(grid: IPointData) {
      if (!this._selectedGraphics) {
         return;
      }
      this._selectedGraphics.clear();
      if (Singleton().grid.isEdge(grid)) {
         return;
      }
      this._selectedGraphics.lineStyle({
         color: 0xffffff,
         width: 2,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
         alignment: 0.5,
      });

      Singleton().grid.drawSelected(grid, this._selectedGraphics);
   }

   selectGrid(grid: IPointData) {
      this.drawSelection(grid);
      const xy = pointToXy(grid);
      Singleton().routeTo(TilePage, { xy: xy });
      const gs = getGameState();
      const building = gs.tiles[xy].building;
      this._transportLines.clear();
      if (building) {
         const lines: Record<string, true> = {};
         gs.transportation[xy]?.forEach((t) => {
            const fromGrid = xyToPoint(t.fromXy);
            const toGrid = xyToPoint(t.toXy);
            const key = [t.resource, (fromGrid.y - toGrid.y) / (fromGrid.x - toGrid.x)].join(",");
            if (lines[key]) {
               return;
            }
            lines[key] = true;
            this._transportLines.lineStyle({
               color: Color.shared.setValue(getGameOptions().resourceColors[t.resource] ?? "#ffffff"),
               width: 2,
               cap: LINE_CAP.ROUND,
               join: LINE_JOIN.ROUND,
               alignment: 0.5,
               alpha: 0.25,
            });
            this._transportLines.moveTo(t.fromPosition.x, t.fromPosition.y);
            this._transportLines.lineTo(t.toPosition.x, t.toPosition.y);
         });

         switch (building.type) {
            case "MausoleumAtHalicarnassus": {
               const pos = Singleton().grid.gridToPosition(grid);

               this._selectedGraphics.lineStyle({ width: 0 });
               this._selectedGraphics.beginFill(0xffffff, 0.2, true);
               this._selectedGraphics.drawCircle(pos.x, pos.y, TILE_SIZE * 4);
               this._selectedGraphics.endFill();

               break;
            }
            case "ColossusOfRhodes":
            case "Colosseum":
            case "LighthouseOfAlexandria":
            case "ChichenItza":
               Singleton()
                  .grid.getNeighbors(grid)
                  .forEach((neighbor) => {
                     this._selectedGraphics.lineStyle({ width: 0 });
                     this._selectedGraphics.beginFill(0xffffff, 0.2, true);
                     Singleton().grid.drawSelected(neighbor, this._selectedGraphics);
                     this._selectedGraphics.endFill();
                  });
               break;
         }
      }
   }

   getTile(xy: string): TileVisual | undefined {
      return this._tiles[xy];
   }

   resetTile(xy: string): void {
      this._tiles[xy]?.destroy({ children: true });
      this._tiles[xy] = this.viewport.addChild(new TileVisual(this, xyToPoint(xy)));
   }

   updateTransportVisual(gs: GameState, timeSinceLastTick: number) {
      const ticked: Record<number, true> = {};
      const options = getGameOptions();
      forEach(gs.transportation, (xy, transports) => {
         transports.forEach((t) => {
            if (!this._transport[t.id]) {
               const visual = this._transportPool.allocate();
               visual.position = t.fromPosition;
               visual.tint = Color.shared.setValue(options.resourceColors[t.resource] ?? "#ffffff");
               lookAt(visual, t.toPosition);
               this._transport[t.id] = visual;
            } else if (t.hasEnoughFuel) {
               const visual = this._transport[t.id];
               visual.position = Vector2.lerp(
                  t.fromPosition,
                  t.toPosition,
                  (t.ticksSpent + timeSinceLastTick) / t.ticksRequired
               );
               // This is the last tick
               if (t.ticksSpent >= t.ticksRequired - 1) {
                  visual.alpha = lerp(
                     options.themeColors.TransportIndicatorAlpha,
                     0,
                     clamp(timeSinceLastTick - 0.5, 0, 0.5) * 2
                  );
               }
            }
            ticked[t.id] = true;
         });
      });
      forEach(this._transport, (id, sprite) => {
         if (!ticked[id]) {
            this._transportPool.release(sprite);
            delete this._transport[id];
         }
      });
   }
}
