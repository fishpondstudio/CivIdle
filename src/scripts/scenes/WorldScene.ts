import { SmoothGraphics } from "@pixi/graphics-smooth";
import type { ColorSource, FederatedPointerEvent, IPointData, Sprite } from "pixi.js";
import { Color, Container, LINE_CAP, LINE_JOIN, ParticleContainer, TilingSprite } from "pixi.js";
import { applyBuildingDefaults, checkBuildingMax } from "../../../shared/logic/BuildingLogic";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import type { GameOptions, GameState } from "../../../shared/logic/GameState";
import {
   TILE_SIZE,
   getGameOptions,
   getGameState,
   notifyGameStateUpdate,
} from "../../../shared/logic/GameStateLogic";
import { getGrid, getSpecialBuildings } from "../../../shared/logic/IntraTickCache";
import { makeBuilding } from "../../../shared/logic/Tile";
import { clamp, lerp, lookAt, pointToTile, tileToPoint, type Tile } from "../../../shared/utilities/Helper";
import { Vector2, v2 } from "../../../shared/utilities/Vector2";
import { getTexture } from "../logic/VisualLogic";
import { TilePage } from "../ui/TilePage";
import { Scene, type ISceneContext } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";
import { Actions } from "../utilities/pixi-actions/Actions";
import { Easing } from "../utilities/pixi-actions/Easing";
import type { Action } from "../utilities/pixi-actions/actions/Action";
import { CustomAction } from "../utilities/pixi-actions/actions/CustomAction";
import { drawGrid, drawSelected } from "../visuals/DrawGrid";
import { playError } from "../visuals/Sound";
import { TileVisual } from "./TileVisual";
import { TooltipPool } from "./TooltipPool";
import { TransportPool } from "./TransportPool";

let viewportCenter: IPointData | null = null;
let viewportZoom: number | null = null;

export class WorldScene extends Scene {
   private _width!: number;
   private _height!: number;
   private _selectedGraphics!: SmoothGraphics;
   private _transportLines!: SmoothGraphics;
   private _transportPool!: TransportPool;
   public tooltipPool!: TooltipPool;
   private cameraMovement: Action | null = null;
   private readonly _tiles: Map<number, TileVisual> = new Map();
   private readonly _transport: Map<number, Sprite> = new Map();
   private _bg!: TilingSprite;
   private _graphics!: SmoothGraphics;
   private _selectedXy: Tile | null = null;

   constructor(context: ISceneContext) {
      super(context);
      const { app, textures } = context;
      const maxPosition = getGrid(getGameState()).maxPosition();
      this._width = maxPosition.x;
      this._height = maxPosition.y;

      this.viewport.setWorldSize(this._width, this._height);
      this.viewport.setZoomRange(
         Math.max(app.screen.width / this._width, app.screen.height / this._height),
         2,
      );
      this._bg = this.viewport.addChild(
         new TilingSprite(getTexture("Misc_Paper", textures), this._width, this._height),
      );
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
      drawGrid(getGrid(getGameState()), this._graphics);
      getGrid(getGameState()).forEach((grid) => {
         const xy = pointToTile(grid);
         this._tiles.set(xy, this.viewport.addChild(new TileVisual(this, grid)));
      });
      this.tooltipPool = new TooltipPool(this.viewport.addChild(new Container()));
      this._transportPool = new TransportPool(
         getTexture("Misc_Transport", textures),
         this.viewport.addChild(
            new ParticleContainer(100_000, {
               position: true,
               rotation: true,
               alpha: true,
            }),
         ),
      );
      this._selectedGraphics = this.viewport.addChild(new SmoothGraphics());
      this._transportLines = this.viewport.addChild(new SmoothGraphics());
   }

   override backgroundColor(): ColorSource {
      return getGameOptions().themeColors.WorldBackground;
   }

   override onEnable(): void {
      if (viewportZoom) {
         this.viewport.zoom = viewportZoom;
      }
      if (!viewportCenter) {
         viewportCenter = { x: this._width / 2, y: this._height / 2 };
      }
      this.viewport.center = viewportCenter;

      this.selectGrid(tileToPoint(getSpecialBuildings(getGameState()).Headquarter.tile));
      super.onEnable();
   }

   override onMoved(point: IPointData): void {
      viewportCenter = this.viewport.center;
      viewportZoom = this.viewport.zoom;
   }

   override onClicked(e: FederatedPointerEvent): void {
      const gs = getGameState();
      const grid = getGrid(gs).positionToGrid(this.viewport.screenToWorld(e));
      switch (e.button) {
         case 0: {
            this.selectGrid(grid);
            break;
         }
         case 1: {
            this.copyBuilding(grid, gs);
            break;
         }
         case 2: {
            break;
         }
      }
   }

   copyBuilding(grid: IPointData, gs: GameState): void {
      if (this._selectedXy === null) {
         return;
      }
      const selectBuilding = gs.tiles.get(this._selectedXy)?.building;
      if (!selectBuilding) {
         return;
      }
      const xy = pointToTile(grid);
      const currentTile = gs.tiles.get(xy);
      if (!currentTile) {
         return;
      }
      if (!currentTile?.explored) {
         playError();
         return;
      }
      if (currentTile?.building) {
         playError();
         return;
      }
      if (!checkBuildingMax(selectBuilding.type, gs)) {
         playError();
         return;
      }
      currentTile.building = applyBuildingDefaults(
         makeBuilding({ type: selectBuilding.type }),
         getGameOptions(),
      );
      notifyGameStateUpdate();
   }

   override onResize(width: number, height: number): void {
      super.onResize(width, height);
      const { app } = this.context;
      this.viewport.setZoomRange(
         Math.max(app.screen.width / this._width, app.screen.height / this._height),
         2,
      );
   }

   override onGameStateChanged(gameState: GameState): void {
      this._tiles.forEach((visual, xy) => visual.onTileDataChanged(gameState.tiles.get(xy)!));
      this.drawTransportation(gameState);
   }

   override onGameOptionsChanged(gameOptions: GameOptions): void {
      this._bg.tint = Color.shared.setValue(gameOptions.themeColors.WorldBackground);
      this._graphics.tint = Color.shared.setValue(gameOptions.themeColors.GridColor);
      this._graphics.alpha = gameOptions.themeColors.GridAlpha;
      this._selectedGraphics.tint = Color.shared.setValue(gameOptions.themeColors.SelectedGridColor);
      this._tiles.forEach((visual, xy) => visual.updateDepositColor(gameOptions));
   }

   lookAtTile(xy: Tile, lookAtMode: LookAtMode) {
      this.cameraMovement?.stop();
      const target = this.viewport.clampCenter(getGrid(getGameState()).xyToPosition(xy));
      this.cameraMovement = new CustomAction(
         () => viewportCenter,
         (v) => {
            viewportCenter = v;
            this.viewport.center = viewportCenter!;
         },
         (a, b, f) => {
            if (a && b) {
               return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
            }
            throw new Error(`Cannot interpolate from a = ${a} to b = ${b}`);
         },
         target,
         v2(target).subtractSelf(viewportCenter!).length() / 2000,
         Easing.InOutSine,
      ).start();
      if (lookAtMode === LookAtMode.Highlight) {
         this.drawSelection(null, [xy]);
      } else {
         this.selectGrid(tileToPoint(xy));
      }
   }

   drawSelection(selected: IPointData | null, highlights: Tile[] = []) {
      if (!this._selectedGraphics || !this._selectedXy) {
         return;
      }
      this._selectedGraphics.clear();
      const grid = getGrid(getGameState());
      selected ??= tileToPoint(this._selectedXy);
      if (grid.isEdge(selected)) {
         return;
      }
      this._selectedGraphics.lineStyle({
         color: 0xffffff,
         width: 2,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
         alignment: 0.5,
      });
      drawSelected(grid, selected, this._selectedGraphics);
      highlights.forEach((tile) => {
         this._selectedGraphics.lineStyle({ width: 0 });
         this._selectedGraphics.beginFill(0xffffff, 0.2, true);
         drawSelected(grid, tileToPoint(tile), this._selectedGraphics);
         this._selectedGraphics.endFill();
      });
   }

   selectGrid(grid: IPointData) {
      this.drawSelection(grid);
      const xy = pointToTile(grid);
      this._selectedXy = xy;
      Singleton().routeTo(TilePage, { xy: xy });
      const gs = getGameState();
      this.drawTransportation(gs);
      this.drawBuildingDecors(gs);
   }

   private drawBuildingDecors(gs: GameState) {
      const xy = this._selectedXy;
      if (!xy) {
         return;
      }
      const building = gs.tiles.get(xy)?.building;
      const grid = tileToPoint(xy);
      if (building) {
         switch (building.type) {
            case "MausoleumAtHalicarnassus": {
               const pos = getGrid(gs).gridToPosition(grid);

               this._selectedGraphics.lineStyle({ width: 0 });
               this._selectedGraphics.beginFill(0xffffff, 0.2, true);
               this._selectedGraphics.drawCircle(pos.x, pos.y, TILE_SIZE * 4);
               this._selectedGraphics.endFill();

               break;
            }
            case "Warehouse": {
               if (hasFeature(GameFeature.WarehouseUpgrade, gs)) {
                  this.highlightRange(grid, 1);
               }
               break;
            }
            case "ColossusOfRhodes":
            case "LighthouseOfAlexandria":
            // case "GrandBazaar":
            case "HangingGarden":
            case "ChichenItza":
            case "AngkorWat":
            case "StatueOfZeus":
            case "Poseidon":
            case "EiffelTower":
            case "BrandenburgGate":
            case "SummerPalace":
            case "MogaoCaves":
            case "SaintBasilsCathedral":
            case "NileRiver":
            case "StatueOfLiberty": {
               this.highlightRange(grid, 1);
               break;
            }
            case "GreatSphinx":
            case "Hollywood":
            case "SagradaFamilia":
            case "CristoRedentor":
            case "GoldenGateBridge": {
               this.highlightRange(grid, 2);
               break;
            }
         }
      }
   }

   private drawTransportation(gs: GameState) {
      const xy = this._selectedXy;
      if (!xy) {
         return;
      }
      this._transportLines.clear();
      const lines: Record<string, true> = {};
      gs.transportation.get(xy)?.forEach((t) => {
         const fromGrid = tileToPoint(t.fromXy);
         const toGrid = tileToPoint(t.toXy);
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
   }

   private highlightRange(grid: IPointData, range: number) {
      const g = getGrid(getGameState());
      g.getRange(grid, range).forEach((neighbor) => {
         this._selectedGraphics.lineStyle({ width: 0 });
         this._selectedGraphics.beginFill(0xffffff, 0.2, true);
         drawSelected(g, neighbor, this._selectedGraphics);
         this._selectedGraphics.endFill();
      });
   }

   updateTile(xy: Tile, gs: GameState, dt: number): void {
      this._tiles.get(xy)?.update(gs, dt);
   }

   resetTile(xy: Tile): void {
      this._tiles.get(xy)?.destroy({ children: true });
      this._tiles.set(xy, this.viewport.addChild(new TileVisual(this, tileToPoint(xy))));
   }

   revealTile(xy: Tile): void {
      this._tiles.get(xy)?.reveal();
   }

   showFloater(xy: Tile, value: number): void {
      this._tiles.get(xy)?.showFloater(value);
   }

   private _ticked: Set<number> = new Set();

   updateTransportVisual(gs: GameState, timeSinceLastTick: number) {
      this._ticked.clear();
      const options = getGameOptions();
      gs.transportation.forEach((transports) => {
         transports.forEach((t) => {
            if (!this._transport.get(t.id)) {
               const visual = this._transportPool.allocate();
               visual.position = t.fromPosition;
               visual.tint = Color.shared.setValue(options.resourceColors[t.resource] ?? "#ffffff");
               lookAt(visual, t.toPosition);
               this._transport.set(t.id, visual);
            } else if (t.hasEnoughFuel) {
               const visual = this._transport.get(t.id);
               visual!.position = Vector2.lerp(
                  t.fromPosition,
                  t.toPosition,
                  (t.ticksSpent + timeSinceLastTick) / t.ticksRequired,
               );
               // This is the last tick
               if (t.ticksSpent >= t.ticksRequired - 1) {
                  visual!.alpha = lerp(
                     options.themeColors.TransportIndicatorAlpha,
                     0,
                     clamp(timeSinceLastTick - 0.5, 0, 0.5) * 2,
                  );
               }
            }
            this._ticked.add(t.id);
         });
      });

      for (const [id, sprite] of this._transport) {
         if (!this._ticked.has(id)) {
            this._transportPool.release(sprite);
            this._transport.delete(id);
         }
      }
   }

   public cameraPan(target_: number, time: number): void {
      const { app } = this.context;
      if (this._selectedXy) {
         this.viewport.center = getGrid(getGameState()).xyToPosition(this._selectedXy);
      }
      const target = clamp(
         target_,
         Math.max(app.screen.width / this._width, app.screen.height / this._height),
         2,
      );
      Actions.to(this.viewport, { zoom: target }, time).start();
   }
}

export enum LookAtMode {
   Highlight = 0,
   Select = 1,
}
