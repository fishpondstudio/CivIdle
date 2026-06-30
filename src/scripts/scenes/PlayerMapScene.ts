import { SmoothGraphics } from "@pixi/graphics-smooth";
import {
   BitmapText,
   Container,
   LINE_CAP,
   LINE_JOIN,
   ParticleContainer,
   Rectangle,
   Sprite,
   Texture,
   type ColorSource,
   type DisplayObject,
   type FederatedPointerEvent,
   type IPointData,
   type RenderTexture,
} from "pixi.js";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import type { City } from "../../../shared/definitions/CityDefinitions";
import WorldMap from "../../../shared/definitions/WorldMap.json";
import { Config } from "../../../shared/logic/Config";
import { isTileReserved } from "../../../shared/logic/PlayerTradeLogic";
import {
   MAP_MAX_X,
   MAP_MAX_Y,
   UserColorsMapping,
   type IClientMapEntry,
   type IClientTrade,
} from "../../../shared/utilities/Database";
import { forEach, formatPercent, mapSafeAdd, sizeOf, xyToPoint } from "../../../shared/utilities/Helper";
import type { Disposable } from "../../../shared/utilities/TypedEvent";
import { UnicodeText } from "../../../shared/utilities/UnicodeText";
import { getTexture } from "../logic/VisualLogic";
import {
   OnPlayerMapMessage,
   OnTileBuildingsChanged,
   OnTradeChanged,
   TileBuildings,
   getPlayerMap,
   getTrades,
   getUser,
} from "../rpc/RPCClient";
import { PlayerMapPage } from "../ui/PlayerMapPage";
import { AccountLevelImages } from "../ui/TextureSprites";
import { getColorCached } from "../utilities/CachedColor";
import { Scene, destroyAllChildren, type ISceneContext } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";
import { Easing } from "../utilities/pixi-actions/Easing";
import { CustomAction } from "../utilities/pixi-actions/actions/CustomAction";
import { Fonts } from "../visuals/Fonts";
import { findPathAsync, getOwnedTradeTile } from "./PathFinder";

let viewportCenter: IPointData | null = null;
let viewportZoom: number | null = null;

export const GridSize = 100;
const _cityCache = new Map<City, RenderTexture>();

export class PlayerMapScene extends Scene {
   private _width: number;
   private _height: number;
   private _selectedGraphics: SmoothGraphics;
   private _listeners: Disposable[] = [];
   private _path: Container;
   private _idToTradeCount = new Map<string, number>();
   private _idToTile = new Map<string, string>();
   private _dirtyTiles = new Set<string>();

   private _landTiles: ParticleContainer;
   private _landTilesMap = new Map<string, Sprite>();

   private _flags: ParticleContainer;
   private _flagsMap = new Map<string, Sprite>();

   private _playerLevels: ParticleContainer;
   private _playerLevelsMap = new Map<string, Sprite>();

   private _playerHandles: Container;
   private _playerHandlesMap = new Map<string, DisplayObject>();

   private _playerTariffs: Container;
   private _playerTariffsMap = new Map<string, DisplayObject>();

   private _playerCity: Container;
   private _playerCityMap = new Map<string, DisplayObject>();

   private _tradeCircles: ParticleContainer;
   private _tradeCirclesMap = new Map<string, DisplayObject>();

   private _tradeCounts: Container;
   private _tradeCountsMap = new Map<string, DisplayObject>();

   private _buildings: ParticleContainer;
   private _buildingsMap = new Map<string, DisplayObject>();

   constructor(context: ISceneContext) {
      super(context);
      const { app, textures } = context;
      this._width = MAP_MAX_X * GridSize;
      this._height = MAP_MAX_Y * GridSize;

      const minZoom = Math.max(app.screen.width / this._width, app.screen.height / this._height);
      this.viewport.setWorldSize(this._width, this._height);
      this.viewport.setZoomRange(minZoom, 1);

      this._landTiles = this.viewport.addChild(
         new ParticleContainer(sizeOf(WorldMap), { position: true, tint: true }),
      );
      this._buildings = this.viewport.addChild(new ParticleContainer(sizeOf(WorldMap)));
      this._flags = this.viewport.addChild(new ParticleContainer(sizeOf(WorldMap)));
      this._playerLevels = this.viewport.addChild(new ParticleContainer(sizeOf(WorldMap)));
      this._playerHandles = this.viewport.addChild(new Container());
      this._playerTariffs = this.viewport.addChild(new Container());
      this._playerCity = this.viewport.addChild(new Container());
      this._tradeCircles = this.viewport.addChild(new ParticleContainer(sizeOf(WorldMap)));
      this._tradeCounts = this.viewport.addChild(new Container());

      const playerMap = getPlayerMap();

      forEach(WorldMap, (xy) => {
         const point = xyToPoint(xy);
         const sprite = this._landTiles.addChild(new Sprite(Texture.WHITE));
         this._landTilesMap.set(xy, sprite);
         sprite.width = GridSize;
         sprite.height = GridSize;
         sprite.tint = 0x3498db;
         const entry = playerMap.get(xy);
         if (entry) {
            const color = UserColorsMapping[entry.color];
            if (color) {
               sprite.tint = getColorCached(color);
            }
         }
         sprite.position.set(point.x * GridSize, point.y * GridSize);
      });

      this._path = this.viewport.addChild(new Container());

      const graphics = this.viewport.addChild(new SmoothGraphics()).lineStyle({
         color: 0xffffff,
         width: 2,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
         alignment: 0.5,
      });
      graphics.alpha = 0.25;

      for (let x = 0; x <= MAP_MAX_X; x++) {
         graphics.moveTo(x * GridSize, 0);
         graphics.lineTo(x * GridSize, MAP_MAX_Y * GridSize);
      }

      for (let y = 0; y <= MAP_MAX_Y; y++) {
         graphics.moveTo(0, y * GridSize);
         graphics.lineTo(MAP_MAX_X * GridSize, y * GridSize);
      }

      this._selectedGraphics = this.viewport.addChild(new SmoothGraphics());

      getPlayerMap().forEach((entry, xy) => {
         this.addOrReplaceTile(xy, entry);
      });

      OnPlayerMapMessage.on((message) => {
         if (message.remove) {
            message.remove.forEach((xy) => this.removeTile(xy));
         }
         if (message.upsert) {
            forEach(message.upsert, (xy, entry) => this.addOrReplaceTile(xy, entry));
         }
      });
   }

   override backgroundColor(): ColorSource {
      return 0x2980b9;
   }

   override onEnable(): void {
      this._idToTradeCount.clear();
      getTrades().forEach((t) => {
         mapSafeAdd(this._idToTradeCount, t.fromId, 1);
      });

      this.onTradeChanged(getTrades());
      this._listeners.push(OnTradeChanged.on(this.onTradeChanged.bind(this)));

      this.onTileBuildingsChanged();
      this._listeners.push(OnTileBuildingsChanged.on(this.onTileBuildingsChanged.bind(this)));

      if (!viewportZoom) {
         const range = this.viewport.getZoomRange();
         viewportZoom = (range[0] + range[1]) * 0.5;
      }

      const xy = getOwnedTradeTile();
      if (xy) {
         const point = xyToPoint(xy);
         this.selectTile(point.x, point.y);
         if (!viewportCenter) {
            viewportCenter = this.tileToPosition(point);
         }
      } else {
         this.selectTile(100, 50);
         if (!viewportCenter) {
            viewportCenter = this.tileToPosition({ x: 100, y: 50 });
         }
      }

      this.viewport.zoom = viewportZoom;
      this.viewport.center = viewportCenter;

      this._cullTiles();
      super.onEnable();
   }

   onTileBuildingsChanged(): void {
      destroyAllChildren(this._buildings);
      this._buildingsMap.clear();
      forEach(WorldMap, (xy) => {
         const point = xyToPoint(xy);
         const b = TileBuildings.get(xy);
         if (b) {
            const building = this._buildings.addChild(
               new Sprite(getTexture(`Building_${b}`, this.context.textures)),
            );
            this._buildingsMap.set(xy, building);
            building.anchor.set(0.5, 0.5);
            building.position.set(point.x * GridSize + GridSize / 2, point.y * GridSize + GridSize / 2);
            building.scale.set(0.75);
            building.tint = 0xffffff;
            building.alpha = 0.2;
         }
      });
   }

   onTradeChanged(trades: IClientTrade[]): void {
      const old = Array.from(this._idToTradeCount.keys());
      this._idToTradeCount.clear();

      trades.forEach((t) => {
         mapSafeAdd(this._idToTradeCount, t.fromId, 1);
         this.markDirtyById(t.fromId);
      });

      old.forEach((id) => {
         if (!this._idToTradeCount.has(id)) {
            this.markDirtyById(id);
         }
      });
      this._dirtyTiles.forEach((tile) => {
         const entry = getPlayerMap().get(tile);
         if (entry) {
            this.addOrReplaceTile(tile, entry);
         }
      });
      this._dirtyTiles.clear();
   }

   override onClicked(e: FederatedPointerEvent): void {
      if (e.button === 2) {
         return;
      }
      const pos = this.viewport.screenToWorld(e);
      const tileX = Math.floor(pos.x / GridSize);
      const tileY = Math.floor(pos.y / GridSize);
      this.selectTile(tileX, tileY);
   }

   lookAt(xy: string): void {
      const point = xyToPoint(xy);
      const x = GridSize * point.x + GridSize / 2;
      const y = GridSize * point.y + GridSize / 2;
      new CustomAction(
         () => this.viewport.center,
         (v) => {
            this.viewport.center = v;
         },
         (a, b, f) => {
            return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
         },
         { x, y },
         0.25,
         Easing.InOutSine,
      ).start();
      this.selectTile(point.x, point.y);
   }

   override onMoved(point: IPointData): void {
      viewportCenter = this.viewport.center;
      viewportZoom = this.viewport.zoom;
      this._cullTiles();
   }

   private _cullTiles(): void {
      const rect = this.viewport.visibleWorldRect();
      const currentRect = new Rectangle(0, 0, 0, 0);
      this._landTilesMap.forEach((tile, xy) => {
         const { x, y } = xyToPoint(xy);

         const building = this._buildingsMap.get(xy);
         const flag = this._flagsMap.get(xy);
         const level = this._playerLevelsMap.get(xy);
         const handle = this._playerHandlesMap.get(xy);
         const tariff = this._playerTariffsMap.get(xy);
         const city = this._playerCityMap.get(xy);
         const tradeCircle = this._tradeCirclesMap.get(xy);
         const tradeCount = this._tradeCountsMap.get(xy);

         currentRect.x = x * GridSize;
         currentRect.y = y * GridSize;
         currentRect.width = GridSize;
         currentRect.height = GridSize;
         const shouldRender = rect.intersects(currentRect);

         tile.visible = shouldRender;

         if (building) {
            building.visible = shouldRender;
         }
         if (flag) {
            flag.visible = shouldRender;
         }
         if (level) {
            level.visible = shouldRender;
         }
         if (handle) {
            handle.visible = shouldRender;
         }
         if (tariff) {
            tariff.visible = shouldRender;
         }
         if (city) {
            city.visible = shouldRender;
         }
         if (tradeCircle) {
            tradeCircle.visible = shouldRender;
         }
         if (tradeCount) {
            tradeCount.visible = shouldRender;
         }
      });
   }

   override onDisable(): void {
      this._listeners.forEach((l) => l.dispose());
      super.onDisable();
   }

   private markDirtyById(userId: string): void {
      const tile = this._idToTile.get(userId);
      if (tile) {
         this._dirtyTiles.add(tile);
      }
   }

   private tileToPosition(tile: IPointData): IPointData {
      return { x: (tile.x + 0.5) * GridSize, y: (tile.y + 0.5) * GridSize };
   }

   public highlightBuildings(buildings: Set<Building>): void {
      this._selectedGraphics.clear();
      TileBuildings.forEach((b, xy) => {
         if (buildings.has(b)) {
            this.drawSelectedTile(xyToPoint(xy));
         }
      });
   }

   private getBuildingTiles(building: Building): string[] {
      const result: string[] = [];
      TileBuildings.forEach((b, xy) => {
         if (b === building) {
            result.push(xy);
         }
      });
      return result;
   }

   public lookAtPrevious(xy: string): void {
      const building = TileBuildings.get(xy);
      if (!building) {
         return;
      }
      const tiles = this.getBuildingTiles(building);
      const index = tiles.indexOf(xy);
      if (index === -1) {
         return;
      }
      const previous = tiles[(index + tiles.length - 1) % tiles.length];
      this.lookAt(previous);
   }

   public lookAtNext(xy: string): void {
      const building = TileBuildings.get(xy);
      if (!building) {
         return;
      }
      const tiles = this.getBuildingTiles(building);
      const index = tiles.indexOf(xy);
      if (index === -1) {
         return;
      }
      const next = tiles[(index + 1) % tiles.length];
      this.lookAt(next);
   }

   public drawPath(path: IPointData[]): void {
      destroyAllChildren(this._path);
      path.forEach((point, idx) => {
         const sprite = this._path.addChild(new Sprite(this.context.textures.Misc_100x100));
         sprite.tint = 0xffffff;
         sprite.alpha = 0.25;
         sprite.scale.set(0.9, 0.9);
         sprite.position.set((point.x + 0.05) * GridSize, (point.y + 0.05) * GridSize);
      });
   }

   public clearPath() {
      destroyAllChildren(this._path);
   }

   private drawSelectedTile({ x, y }: IPointData): void {
      const posX = x * GridSize;
      const posY = y * GridSize;
      this._selectedGraphics
         .lineStyle({
            alpha: 1,
            color: 0xffeaa7,
            width: 4,
            cap: LINE_CAP.ROUND,
            join: LINE_JOIN.ROUND,
            alignment: 0.5,
         })
         .moveTo(posX, posY)
         .lineTo(posX + GridSize, posY)
         .lineTo(posX + GridSize, posY + GridSize)
         .lineTo(posX, posY + GridSize)
         .lineTo(posX, posY);
   }

   private selectTile(tileX: number, tileY: number) {
      this._selectedGraphics.clear();
      this.drawSelectedTile({ x: tileX, y: tileY });

      const myXy = getOwnedTradeTile();
      const map = getPlayerMap();
      const selectedXy = `${tileX},${tileY}`;

      const tile = map.get(selectedXy);
      const user = getUser();
      if (myXy && tile && user && tile.userId !== user.userId) {
         const freeTiles = new Set<number>();
         map.forEach((entry, xy) => {
            if (entry.userId === user.userId || entry.userId === tile.userId) {
               const point = xyToPoint(xy);
               freeTiles.add(point.y * MAP_MAX_X + point.x);
            }
         });
         findPathAsync(xyToPoint(myXy), { x: tileX, y: tileY }, freeTiles).then((path) =>
            this.drawPath(path),
         );
      } else {
         this.clearPath();
      }

      Singleton().routeTo(PlayerMapPage, { xy: selectedXy });
   }

   private addOrReplaceTile(xy: string, entry: IClientMapEntry) {
      const { x, y } = xyToPoint(xy);
      const isReserved = isTileReserved(entry);
      const isMyself = entry.userId === getUser()?.userId;
      const trade = this._idToTradeCount.get(entry.userId) ?? 0;

      this._flagsMap.get(xy)?.destroy();
      this._playerLevelsMap.get(xy)?.destroy();
      this._playerHandlesMap.get(xy)?.destroy();
      this._playerTariffsMap.get(xy)?.destroy();
      this._playerCityMap.get(xy)?.destroy();
      this._tradeCirclesMap.get(xy)?.destroy();
      this._tradeCountsMap.get(xy)?.destroy();

      const color = UserColorsMapping[entry.color];
      const landTile = this._landTilesMap.get(xy);
      if (landTile && color) {
         landTile.tint = getColorCached(color);
      }

      // Flag
      const flag = this._flags.addChild(
         new Sprite(this.context.textures[`Flag_${entry.flag.toUpperCase()}`]),
      );
      this._flagsMap.set(xy, flag);
      flag.anchor.set(0.5, 0.5);
      flag.position.set(x * GridSize + 0.5 * GridSize - 20, y * GridSize + 0.5 * GridSize - 30);
      flag.alpha = isReserved ? 1 : 0.5;

      // Level
      const level = this._playerLevels.addChild(
         new Sprite(this.context.textures[`Misc_${AccountLevelImages[entry.level]}`]),
      );
      this._playerLevelsMap.set(xy, level);
      level.anchor.set(0.5, 0.5);
      level.scale.set(0.25);
      level.position.set(x * GridSize + 0.5 * GridSize + 15, y * GridSize + 0.5 * GridSize - 30);
      level.alpha = isReserved ? 1 : 0.5;

      // Handle
      const handle = this._playerHandles.addChild(
         new BitmapText(entry.handle, {
            fontName: Fonts.Cabin,
            fontSize: 16,
            tint: isMyself ? 0xffb86f : 0xffffff,
         }),
      );
      this._playerHandlesMap.set(xy, handle);
      while (handle.width > GridSize - 10) {
         handle.fontSize--;
      }
      handle.anchor.set(0.5, 0.5);
      handle.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize - 5);
      handle.alpha = isReserved ? 1 : 0.5;

      // Tariff
      const tariff = this._playerTariffs.addChild(
         new BitmapText(formatPercent(entry.tariffRate), {
            fontName: Fonts.Cabin,
            fontSize: 20,
            tint: isMyself ? 0xffb86f : 0xffffff,
         }),
      );
      this._playerTariffsMap.set(xy, tariff);
      tariff.anchor.set(0.5, 0.5);
      tariff.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize + 15);
      tariff.alpha = isReserved ? 1 : 0.5;

      if (trade > 0) {
         const bg = this._tradeCircles.addChild(
            new Sprite(getTexture("Misc_Circle_25", this.context.textures)),
         );
         this._tradeCirclesMap.set(xy, bg);
         bg.anchor.set(0.5, 0.5);
         bg.tint = 0xe74c3c;
         bg.position.set(x * GridSize + 0.9 * GridSize, y * GridSize + 0.12 * GridSize);

         const tradeCount = this._tradeCounts.addChild(
            new BitmapText(String(trade), {
               fontName: Fonts.Cabin,
               fontSize: 20,
               tint: 0xffffff,
            }),
         );
         this._tradeCountsMap.set(xy, tradeCount);
         tradeCount.anchor.set(0.5, 0.5);
         tradeCount.position.set(x * GridSize + 0.9 * GridSize, y * GridSize + 0.1 * GridSize);
      } else {
         this._tradeCirclesMap.delete(xy);
         this._tradeCountsMap.delete(xy);
      }

      // City
      if (entry.city && entry.city in Config.City) {
         let texture = _cityCache.get(entry.city);
         if (!texture) {
            texture = this.context.app.renderer.generateTexture(
               new UnicodeText(
                  Config.City[entry.city].name(),
                  {
                     fontName: Fonts.Cabin,
                     fontSize: 14,
                     tint: 0xffffff,
                  },
                  {
                     dropShadow: true,
                     dropShadowAlpha: 0.75,
                     dropShadowColor: "#000000",
                     dropShadowAngle: Math.PI / 6,
                     dropShadowBlur: 0,
                     dropShadowDistance: 1,
                  },
               ),
               { resolution: 2 },
            );
            _cityCache.set(entry.city, texture);
         }

         const city = this._playerCity.addChild(new Sprite(texture));
         this._playerCityMap.set(xy, city);
         city.anchor.set(0.5, 0.5);
         city.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize + 35);
         city.alpha = isReserved ? 1 : 0.5;
      } else {
         this._playerCityMap.delete(xy);
      }

      this._idToTile.set(entry.userId, xy);
   }

   private removeTile(xy: string) {
      const id = getPlayerMap().get(xy)?.userId;
      if (id) {
         this._idToTile.delete(id);
      }

      const landTile = this._landTilesMap.get(xy);
      if (landTile) {
         landTile.tint = 0x3498db;
      }

      this._flagsMap.get(xy)?.destroy();
      this._flagsMap.delete(xy);

      this._playerLevelsMap.get(xy)?.destroy();
      this._playerLevelsMap.delete(xy);

      this._playerHandlesMap.get(xy)?.destroy();
      this._playerHandlesMap.delete(xy);

      this._playerTariffsMap.get(xy)?.destroy();
      this._playerTariffsMap.delete(xy);

      this._playerCityMap.get(xy)?.destroy();
      this._playerCityMap.delete(xy);

      this._tradeCirclesMap.get(xy)?.destroy();
      this._tradeCirclesMap.delete(xy);

      this._tradeCountsMap.get(xy)?.destroy();
      this._tradeCountsMap.delete(xy);
   }
}
