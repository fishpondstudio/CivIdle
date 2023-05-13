import { SmoothGraphics } from "@pixi/graphics-smooth";
import {
   Container,
   IPointData,
   LINE_CAP,
   LINE_JOIN,
   MSAA_QUALITY,
   ParticleContainer,
   Sprite,
   TilingSprite,
   utils,
} from "pixi.js";
import { Singleton } from "../Global";
import { GameState } from "../logic/GameState";
import { TilePage } from "../ui/TilePage";
import { clamp, forEach, lerp, lookAt, pointToXy, xyToPoint } from "../utilities/Helper";
import { ViewportScene } from "../utilities/SceneManager";
import { Vector2 } from "../utilities/Vector2";
import { TileVisual } from "./TileVisual";
import { TooltipPool } from "./TooltipPool";
import { TransportPool } from "./TransportPool";

export class WorldScene extends ViewportScene {
   private _width!: number;
   private _height!: number;
   private _selectedGraphics!: SmoothGraphics;
   private _transportPool!: TransportPool;
   public tooltipPool!: TooltipPool;

   private readonly _tiles: utils.Dict<TileVisual> = {};
   private readonly _transport: Record<number, Sprite> = {};

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

      const bg = this.viewport.addChild(new TilingSprite(textures.Paper, this._width, this._height));
      bg.tint = 0x4b6584;
      bg.position.set((this._width - bg.width) / 2, (this._height - bg.height) / 2);

      const graphics = this.viewport.addChild(new SmoothGraphics()).lineStyle({
         color: 0xffffff,
         width: 2,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
         alignment: 0.5,
      });
      graphics.alpha = 0.1;
      Singleton().grid.drawGrid(graphics);
      graphics.cacheAsBitmap = true;
      graphics.cacheAsBitmapMultisample = MSAA_QUALITY.HIGH;

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

      this.viewport.moveCenter(this._width / 2, this._height / 2);

      this.viewport.on("clicked", (e) => {
         const grid = Singleton().grid.positionToGrid(e.world);
         if (e.event.data.button === 2) {
            return;
         }
         this.selectGrid(grid);
      });

      this.selectGrid(xyToPoint(Singleton().buildings.Headquarter.xy));
   }

   override onGameStateChanged(gameState: GameState): void {
      forEach(this._tiles, (xy, visual) => visual.onTileDataChanged(gameState.tiles[xy]));
   }

   selectGrid(grid: IPointData) {
      if (!this._selectedGraphics) {
         return;
      }
      this._selectedGraphics.clear();
      if (Singleton().grid.isEdge(grid)) {
         return;
      }
      const key = pointToXy(grid);
      this._selectedGraphics.lineStyle({
         alpha: 0.75,
         color: 0xffff99,
         width: 2,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
         alignment: 0.5,
      });
      Singleton().grid.drawSelected(grid, this._selectedGraphics);
      Singleton().routeTo(TilePage, { xy: key });
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
      forEach(gs.transportation, (xy, transports) => {
         transports.forEach((t) => {
            if (!this._transport[t.id]) {
               const visual = this._transportPool.allocate();
               visual.position = t.fromPosition;
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
                  visual.alpha = lerp(TransportPool.DefaultAlpha, 0, clamp(timeSinceLastTick - 0.5, 0, 0.5) * 2);
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
