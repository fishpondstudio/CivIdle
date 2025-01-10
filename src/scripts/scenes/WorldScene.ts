import { SmoothGraphics } from "@pixi/graphics-smooth";
import {
   Container,
   LINE_CAP,
   LINE_JOIN,
   ParticleContainer,
   Rectangle,
   TilingSprite,
   type ColorSource,
   type FederatedPointerEvent,
   type IPointData,
   type Sprite,
} from "pixi.js";
import {
   applyBuildingDefaults,
   checkBuildingMax,
   findSpecialBuilding,
   getGreatWallRange,
   getYellowCraneTowerRange,
} from "../../../shared/logic/BuildingLogic";
import { MANAGED_IMPORT_RANGE } from "../../../shared/logic/Constants";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import type { GameOptions, GameState } from "../../../shared/logic/GameState";
import {
   TILE_SIZE,
   getGameOptions,
   getGameState,
   notifyGameStateUpdate,
} from "../../../shared/logic/GameStateLogic";
import { getGrid } from "../../../shared/logic/IntraTickCache";
import {
   ResourceImportOptions,
   makeBuilding,
   type IResourceImportBuildingData,
} from "../../../shared/logic/Tile";
import {
   clamp,
   hasFlag,
   isNullOrUndefined,
   lerp,
   lookAt,
   pointToTile,
   tileToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { Vector2, v2 } from "../../../shared/utilities/Vector2";
import { getTexture } from "../logic/VisualLogic";
import { TilePage } from "../ui/TilePage";
import { getColorCached } from "../utilities/CachedColor";
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

const MARGIN = 200;

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
   private _hijackSelectGridResolve: ((grid: IPointData) => void) | null = null;

   constructor(context: ISceneContext) {
      super(context);
      const { app, textures } = context;
      const maxPosition = getGrid(getGameState()).maxPosition();
      this._width = maxPosition.x;
      this._height = maxPosition.y;

      this.viewport.setWorldSize(this._width, this._height, MARGIN);
      this.viewport.setZoomRange(
         Math.max(
            app.screen.width / (this._width + MARGIN * 2),
            app.screen.height / (this._height + MARGIN * 2),
         ),
         2,
      );
      this._bg = this.viewport.addChild(
         new TilingSprite(
            getTexture("Misc_Paper", textures),
            this._width + MARGIN * 2,
            this._height + MARGIN * 2,
         ),
      );
      this._bg.tint = getColorCached(getGameOptions().themeColors.WorldBackground);
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

      const hq = findSpecialBuilding("Headquarter", getGameState());
      if (hq) {
         this.selectGrid(tileToPoint(hq.tile));
      }
      super.onEnable();
   }

   override onMoved(point: IPointData): void {
      viewportCenter = this.viewport.center;
      viewportZoom = this.viewport.zoom;
   }

   public hijackSelectGrid(): Promise<IPointData> {
      return new Promise((resolve) => {
         this._hijackSelectGridResolve = resolve;
      });
   }

   override onClicked(e: FederatedPointerEvent): void {
      const gs = getGameState();
      const grid = getGrid(gs).positionToGrid(this.viewport.screenToWorld(e));
      if (this._hijackSelectGridResolve) {
         this._hijackSelectGridResolve(grid);
         this._hijackSelectGridResolve = null;
         return;
      }
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
         Math.max(
            app.screen.width / (this._width + MARGIN * 2),
            app.screen.height / (this._height + MARGIN * 2),
         ),
         2,
      );
   }

   override onGameStateChanged(gameState: GameState): void {
      gameState.tiles.forEach((tile, xy) => {
         this._tiles.get(xy)?.onTileDataChanged(tile);
      });
      this.drawTransportation(gameState);
   }

   override onGameOptionsChanged(gameOptions: GameOptions): void {
      this._bg.tint = getColorCached(gameOptions.themeColors.WorldBackground);
      this._graphics.tint = getColorCached(gameOptions.themeColors.GridColor);
      this._graphics.alpha = gameOptions.themeColors.GridAlpha;
      this._selectedGraphics.tint = getColorCached(gameOptions.themeColors.SelectedGridColor);
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

   drawSelection(selected: IPointData | null, highlights: Tile[]) {
      if (!this._selectedGraphics || isNullOrUndefined(this._selectedXy)) {
         return;
      }
      this._selectedGraphics.clear();
      selected ??= tileToPoint(this._selectedXy);
      this._selectedGraphics.lineStyle({
         color: 0xffffff,
         width: 2,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
         alignment: 0.5,
      });
      const grid = getGrid(getGameState());
      drawSelected(grid, selected, this._selectedGraphics);

      // this._tiles.get(this._selectedXy)?.debugDraw(this._selectedGraphics);

      if (highlights.length > 0) {
         highlights.forEach((tile) => {
            this._selectedGraphics.lineStyle({ width: 0 });
            this._selectedGraphics.beginFill(0xffffff, 0.2, true);
            drawSelected(grid, tileToPoint(tile), this._selectedGraphics);
            this._selectedGraphics.endFill();
         });
      } else {
         this.drawBuildingDecors(getGameState());
      }
   }

   selectGrid(grid: IPointData): void {
      const gs = getGameState();
      if (!getGrid(gs).isValid(grid)) {
         return;
      }
      const xy = pointToTile(grid);
      this._selectedXy = xy;
      Singleton().routeTo(TilePage, { xy: xy });
      this.drawSelection(grid, []);
      this.drawTransportation(gs);
   }

   private drawBuildingDecors(gs: GameState) {
      const xy = this._selectedXy;
      if (!xy) {
         return;
      }
      const tile = gs.tiles.get(xy);
      if (!tile?.explored) return;
      const building = tile?.building;
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
            case "Caravansary": {
               const ri = building as IResourceImportBuildingData;
               if (hasFlag(ri.resourceImportOptions, ResourceImportOptions.ManagedImport)) {
                  this.highlightRange(grid, MANAGED_IMPORT_RANGE);
               }
               break;
            }
            case "Warehouse": {
               const ri = building as IResourceImportBuildingData;
               if (hasFlag(ri.resourceImportOptions, ResourceImportOptions.ManagedImport)) {
                  this.highlightRange(grid, 2);
                  break;
               }
               if (hasFeature(GameFeature.WarehouseUpgrade, gs)) {
                  this.highlightRange(grid, 1);
               }
               break;
            }
            case "ColossusOfRhodes":
            case "LighthouseOfAlexandria":
            case "GrandBazaar":
            case "HangingGarden":
            case "ChichenItza":
            case "AngkorWat":
            case "StatueOfZeus":
            case "Poseidon":
            case "EiffelTower":
            case "SummerPalace":
            case "MogaoCaves":
            case "SaintBasilsCathedral":
            case "NileRiver":
            case "ZagrosMountains":
            case "TowerOfBabel":
            case "StatueOfLiberty": {
               this.highlightRange(grid, 1);
               break;
            }
            case "GreatSphinx":
            case "Hollywood":
            case "SagradaFamilia":
            case "Pantheon":
            case "CristoRedentor":
            case "Atomium":
            case "TheMet":
            case "WallStreet":
            case "OsakaCastle":
            case "RhineGorge":
            case "Lapland":
            case "YearOfTheSnake":
            case "GoldenGateBridge": {
               this.highlightRange(grid, 2);
               break;
            }
            case "Elbphilharmonie":
            case "GoldenPavilion": {
               this.highlightRange(grid, 3);
               break;
            }
            case "YellowCraneTower": {
               this.highlightRange(grid, getYellowCraneTowerRange(xy, gs));
               break;
            }
            case "GreatWall": {
               this.highlightRange(grid, getGreatWallRange(xy, gs));
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
      gs.transportationV2.forEach((t) => {
         if (t.fromXy !== xy && t.toXy !== xy) {
            return;
         }
         const fromGrid = tileToPoint(t.fromXy);
         const toGrid = tileToPoint(t.toXy);
         const key = [t.resource, (fromGrid.y - toGrid.y) / (fromGrid.x - toGrid.x)].join(",");
         if (lines[key]) {
            return;
         }
         lines[key] = true;
         this._transportLines.lineStyle({
            color: getColorCached(getGameOptions().resourceColors[t.resource] ?? "#ffffff"),
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

   updateTile(xy: Tile, dt: number): void {
      this._tiles.get(xy)?.update(dt);
   }

   resetTile(xy: Tile): void {
      this._tiles.get(xy)?.destroy({ children: true });
      this._tiles.set(xy, this.viewport.addChild(new TileVisual(this, tileToPoint(xy))));
   }

   revealTile(xy: Tile): void {
      this._tiles.get(xy)?.reveal();
   }

   showFloater(xy: Tile, value: number): void {
      this._tiles.get(xy)?.addFloater(value);
   }

   flushFloater(speed: number): void {
      for (const tile of this._tiles.values()) {
         tile.flushFloater(speed);
      }
   }

   private _ticked: Set<number> = new Set();
   private _rect = new Rectangle(0, 0, 9.75, 9.75);
   private _pos: IPointData = { x: 0, y: 0 };

   updateTransportVisual(gs: GameState, timeSinceLastTick: number) {
      const options = getGameOptions();
      if (!options.showTransportArrow) {
         for (const [id, sprite] of this._transport) {
            this._transportPool.release(sprite);
            this._transport.delete(id);
         }
         return;
      }
      const worldRect = this.viewport.visibleWorldRect();
      this._ticked.clear();
      gs.transportationV2.forEach((t) => {
         Vector2.lerp(
            t.fromPosition,
            t.toPosition,
            (t.ticksSpent + timeSinceLastTick) / t.ticksRequired,
            this._pos,
         );

         this._rect.x = this._pos.x;
         this._rect.y = this._pos.y;
         if (!worldRect.intersects(this._rect)) {
            return;
         }

         let visual = this._transport.get(t.id);
         if (!visual) {
            visual = this._transportPool.allocate();
            visual.position = t.fromPosition;
            visual.tint = getColorCached(options.resourceColors[t.resource] ?? "#ffffff");
            lookAt(visual, t.toPosition);
            this._transport.set(t.id, visual);
         }

         if (t.hasEnoughFuel) {
            const visual = this._transport.get(t.id);
            visual!.position = this._pos;
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
