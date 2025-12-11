import { SmoothGraphics } from "@pixi/graphics-smooth";
import {
   BitmapText,
   Container,
   LINE_CAP,
   LINE_JOIN,
   ParticleContainer,
   Rectangle,
   Sprite,
   type ColorSource,
   type FederatedPointerEvent,
   type IPointData,
} from "pixi.js";
import {
   applyBuildingDefaults,
   checkBuildingMax,
   findSpecialBuilding,
   getGreatWallRange,
   getYellowCraneTowerRange,
   isFestival,
} from "../../../shared/logic/BuildingLogic";
import { MANAGED_IMPORT_RANGE } from "../../../shared/logic/Constants";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import {
   DarkTileTextures,
   getTextColor,
   type GameOptions,
   type GameState,
} from "../../../shared/logic/GameState";
import { getGameOptions, getGameState, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getGrid } from "../../../shared/logic/IntraTickCache";
import {
   ResourceImportOptions,
   makeBuilding,
   type IResourceImportBuildingData,
} from "../../../shared/logic/Tile";
import { Transports } from "../../../shared/logic/Transports";
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
import { ObjectPool } from "../../../shared/utilities/ObjectPool";
import { lerpVector2, v2 } from "../../../shared/utilities/Vector2";
import { getTexture } from "../logic/VisualLogic";
import { TilePage } from "../ui/TilePage";
import { getColorCached } from "../utilities/CachedColor";
import { Scene, destroyAllChildren, type ISceneContext } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";
import type { Action } from "../utilities/pixi-actions/Action";
import { Actions } from "../utilities/pixi-actions/Actions";
import { Easing } from "../utilities/pixi-actions/Easing";
import { CustomAction } from "../utilities/pixi-actions/actions/CustomAction";
import { Fonts } from "../visuals/Fonts";
import { playError } from "../visuals/Sound";
import { TileVisual } from "./TileVisual";

let viewportCenter: IPointData | null = null;
let viewportZoom: number | null = null;

const MARGIN = 200;
const SELECTOR_ALPHA = 0.4;
const HIGHLIGHT_ALPHA = 0.2;
const ANIMATION_TIME = 0.2;

export class WorldScene extends Scene {
   private _width!: number;
   private _height!: number;

   private _tileVisualContainer: Container;
   private _selectorContainer!: Container;

   private _transportContainer!: Container;
   private _transportPool!: ObjectPool<Sprite>;

   private _tooltipContainer!: Container;
   public tooltipPool!: ObjectPool<BitmapText>;

   private _transportLines!: SmoothGraphics;

   private cameraMovement: Action | null = null;
   private readonly _tiles: Map<number, TileVisual> = new Map();
   private readonly _transport: Map<number, Sprite> = new Map();
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

      this._tileVisualContainer = this.viewport.addChild(new Container());
      this._tileVisualContainer.name = "TileVisualContainer";

      getGrid(getGameState()).forEach((grid) => {
         const xy = pointToTile(grid);
         this._tiles.set(xy, this._tileVisualContainer.addChild(new TileVisual(this, grid)));
      });

      this._tooltipContainer = this.viewport.addChild(new Container());
      this._tooltipContainer.name = "TooltipContainer";
      this.tooltipPool = new ObjectPool<BitmapText>({
         create: () => {
            const visual = this._tooltipContainer.addChild(
               new BitmapText("", {
                  fontName: Fonts.Cabin,
                  fontSize: 14,
                  tint: getTextColor(),
               }),
            );
            visual.anchor.set(0.5, 0.5);
            return visual;
         },
         onAllocate: (t) => {
            t.visible = true;
         },
         onRelease: (t) => {
            t.visible = false;
         },
      });

      this._transportContainer = this.viewport.addChild(
         new ParticleContainer(100_000, {
            position: true,
            rotation: true,
            alpha: true,
         }),
      );
      this._transportContainer.name = "TransportContainer";
      this._transportPool = new ObjectPool<Sprite>({
         create: () => {
            const visual = this._transportContainer.addChild(
               new Sprite(getTexture("Misc_Transport", textures)),
            );
            visual.scale = { x: 0.15, y: 0.15 };
            visual.anchor.x = 1;
            visual.anchor.y = 0.5;
            return visual;
         },
         onAllocate: (t) => {
            t.alpha = getGameOptions().themeColors.TransportIndicatorAlpha;
         },
         onRelease: (t) => {
            t.alpha = 0;
         },
      });

      this._selectorContainer = this.viewport.addChild(new Container());
      this._selectorContainer.name = "SelectorContainer";
      this._transportLines = this.viewport.addChild(new SmoothGraphics());
   }

   override backgroundColor(): ColorSource {
      return DarkTileTextures[getGameOptions().tileTexture] ? 0x333333 : 0xffffff;
   }

   override onEnable(): void {
      this.restoreViewport();
      const hq = findSpecialBuilding("Headquarter", getGameState());
      if (hq) {
         this.selectGrid(tileToPoint(hq.tile));
      }
      super.onEnable();
   }

   private restoreViewport(): void {
      if (viewportZoom) {
         this.viewport.zoom = viewportZoom;
      }
      if (!viewportCenter) {
         viewportCenter = { x: this._width / 2, y: this._height / 2 };
      }
      this.viewport.center = viewportCenter;
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
            if (!getGameOptions().useRightClickCopy) {
               this.copyBuilding(grid, gs);
            }
            break;
         }
         case 2: {
            if (getGameOptions().useRightClickCopy) {
               this.copyBuilding(grid, gs);
            }
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
      this._tiles.forEach((visual, xy) => visual.onGameOptionChanged(gameOptions));
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

   private createSelector(): Sprite {
      const visual = this._selectorContainer.addChild(
         new Sprite(
            getTexture(
               DarkTileTextures[getGameOptions().tileTexture] ? "Misc_DarkSelector" : "Misc_LightSelector",
               this.context.textures,
            ),
         ),
      );
      visual.anchor.set(0.5);
      visual.scale.set(0.5);
      return visual;
   }

   drawSelection(selected: IPointData | null, highlights: Tile[]) {
      if (isNullOrUndefined(this._selectedXy)) {
         return;
      }
      const grid = getGrid(getGameState());
      selected ??= tileToPoint(this._selectedXy);

      destroyAllChildren(this._selectorContainer);

      const selector = this.createSelector();
      selector.position = grid.gridToPosition(selected);
      selector.alpha = 0;
      Actions.to(selector, { alpha: SELECTOR_ALPHA }, ANIMATION_TIME, Easing.InQuad).start();

      if (highlights.length > 0) {
         highlights.forEach((tile) => {
            const selector = this.createSelector();
            selector.alpha = 0;
            Actions.to(selector, { alpha: HIGHLIGHT_ALPHA }, ANIMATION_TIME, Easing.InQuad).start();
            selector.position = grid.gridToPosition(tileToPoint(tile));
         });
      } else {
         this.drawBuildingDecors(getGameState());
      }
   }

   private highlightRange(grid: IPointData, range: number) {
      const g = getGrid(getGameState());
      g.getRange(grid, range).forEach((neighbor) => {
         const selector = this.createSelector();
         selector.alpha = 0;
         Actions.to(selector, { alpha: HIGHLIGHT_ALPHA }, ANIMATION_TIME, Easing.InQuad).start();
         selector.position = g.gridToPosition(neighbor);
      });
   }

   selectGrid(grid: IPointData, params: Record<string, unknown> = {}): void {
      const gs = getGameState();
      if (!getGrid(gs).isValid(grid)) {
         return;
      }
      const xy = pointToTile(grid);
      this._selectedXy = xy;
      Singleton().routeTo(TilePage, { ...params, xy: xy });
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
            case "MontSaintMichel":
            case "MountArarat":
            case "TopkapiPalace":
            case "MausoleumAtHalicarnassus":
            case "ItaipuDam":
            case "CathedralOfBrasilia":
            case "Hermitage":
            case "GoldenGateBridge": {
               this.highlightRange(grid, 2);
               break;
            }
            case "Elbphilharmonie":
            case "Cappadocia":
            case "BranCastle":
            case "GlassFrog":
            case "PygmyMarmoset":
            case "GoldenPavilion": {
               this.highlightRange(grid, 3);
               break;
            }
            // #region Buildings with dynamic range
            case "YellowCraneTower": {
               this.highlightRange(grid, getYellowCraneTowerRange(xy, gs));
               break;
            }
            case "GreatWall": {
               this.highlightRange(grid, getGreatWallRange(xy, gs));
               break;
            }
            case "Capybara":
            case "GiantOtter":
            case "Hoatzin":
            case "RoyalFlycatcher": {
               this.highlightRange(grid, isFestival(building.type, gs) ? 3 : 2);
               break;
            }
            case "RedFort": {
               this.highlightRange(grid, isFestival(building.type, gs) ? 5 : 3);
               break;
            }
            case "SanchiStupa": {
               this.highlightRange(grid, isFestival(building.type, gs) ? 3 : 2);
               break;
            }
            case "GangesRiver": {
               this.highlightRange(grid, isFestival(building.type, gs) ? 2 : 1);
               break;
            }
            case "Uluru": {
               this.highlightRange(grid, isFestival(building.type, gs) ? 3 : 2);
               break;
            }
            case "KizhiPogost": {
               this.highlightRange(grid, isFestival(building.type, gs) ? 4 : 2);
               break;
            }
            case "LakeBaikal": {
               this.highlightRange(grid, isFestival(building.type, gs) ? 4 : 2);
               break;
            }
            case "SaviorOnSpilledBlood": {
               this.highlightRange(grid, isFestival(building.type, gs) ? 4 : 2);
               break;
            }
            // #endregion
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
      Transports.forEach((t) => {
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
         const color = getGameOptions().resourceColors[t.resource];
         this._transportLines.lineStyle({
            color: color ? getColorCached(color) : getTextColor(),
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

   public update(dt: number, timeSinceLastTick: number): void {
      for (const visual of this._tiles.values()) {
         visual.update(dt);
      }
      this._updateTransportVisual(timeSinceLastTick);
   }

   resetTile(xy: Tile): void {
      this._tiles.get(xy)?.destroy({ children: true });
      this._tiles.set(xy, this._tileVisualContainer.addChild(new TileVisual(this, tileToPoint(xy))));
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

   private _updateTransportVisual(timeSinceLastTick: number) {
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
      Transports.forEach((t) => {
         lerpVector2(
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
            const color = options.resourceColors[t.resource];
            visual.tint = color ? getColorCached(color) : getTextColor();
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
