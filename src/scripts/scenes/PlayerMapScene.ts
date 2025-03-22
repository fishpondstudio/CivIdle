import { SmoothGraphics } from "@pixi/graphics-smooth";
import type { ColorSource, FederatedPointerEvent, IPointData, Texture } from "pixi.js";
import { BitmapText, Container, LINE_CAP, LINE_JOIN, ParticleContainer, Sprite } from "pixi.js";
import WorldMap from "../../../shared/definitions/WorldMap.json";
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
import { Fonts } from "../visuals/Fonts";
import { findPath, getMyMapXy } from "./PathFinder";

let viewportCenter: IPointData | null = null;
let viewportZoom: number | null = null;

const GridSize = 100;

export class PlayerMapScene extends Scene {
   private _width: number;
   private _height: number;
   private _selectedGraphics: SmoothGraphics;
   private _tiles = new Map<string, Container>();
   private _listeners: Disposable[] = [];
   private _path: Container;
   private _idToTradeCount = new Map<string, number>();
   private _idToTile = new Map<string, string>();
   private _dirtyTiles = new Set<string>();
   private _landTiles: Container;
   private _buildings: Container;
   private _playerTiles: Container;

   constructor(context: ISceneContext) {
      super(context);
      const { app, textures } = context;
      this._width = MAP_MAX_X * GridSize;
      this._height = MAP_MAX_Y * GridSize;

      const minZoom = Math.max(app.screen.width / this._width, app.screen.height / this._height);
      this.viewport.setWorldSize(this._width, this._height);
      this.viewport.setZoomRange(minZoom, 1);

      this._landTiles = this.viewport.addChild(new Container());
      this._buildings = this.viewport.addChild(new ParticleContainer(sizeOf(WorldMap)));
      this._playerTiles = this.viewport.addChild(new Container());

      forEach(WorldMap, (xy) => {
         const point = xyToPoint(xy);
         const sprite = this._landTiles.addChild(new Sprite(this.context.textures.Misc_100x100));
         sprite.tint = 0x3498db;
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

      this.onTileBuildingsChanged();
      this._listeners.push(OnTileBuildingsChanged.on(this.onTileBuildingsChanged.bind(this)));
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

      if (!viewportZoom) {
         const range = this.viewport.getZoomRange();
         viewportZoom = (range[0] + range[1]) * 0.5;
      }

      const xy = getMyMapXy();
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

      super.onEnable();
   }

   onTileBuildingsChanged(): void {
      destroyAllChildren(this._buildings);
      forEach(WorldMap, (xy) => {
         const point = xyToPoint(xy);
         const b = TileBuildings.get(xy);
         if (b) {
            const building = this._buildings.addChild(
               new Sprite(getTexture(`Building_${b}`, this.context.textures)),
            );
            building.anchor.set(0.5, 0.5);
            building.position.set(point.x * GridSize + GridSize / 2, point.y * GridSize + GridSize / 2);
            building.scale.set(0.75);
            building.tint = 0xffffff;
            building.alpha = 0.2;
         }
      });
      getPlayerMap().forEach((entry, xy) => {
         this.addOrReplaceTile(xy, entry);
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
      const posX = GridSize * point.x;
      const posY = GridSize * point.y;
      this.viewport.center = { x: posX + GridSize / 2, y: posY + GridSize / 2 };
      this.selectTile(point.x, point.y);
   }

   override onMoved(point: IPointData): void {
      viewportCenter = this.viewport.center;
      viewportZoom = this.viewport.zoom;
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

   private selectTile(tileX: number, tileY: number) {
      const x = tileX * GridSize;
      const y = tileY * GridSize;

      this._selectedGraphics.clear();
      this._selectedGraphics
         .lineStyle({
            alpha: 0.75,
            color: 0xffff99,
            width: 2,
            cap: LINE_CAP.ROUND,
            join: LINE_JOIN.ROUND,
            alignment: 0.5,
         })
         .moveTo(x, y)
         .lineTo(x + GridSize, y)
         .lineTo(x + GridSize, y + GridSize)
         .lineTo(x, y + GridSize)
         .lineTo(x, y);

      const myXy = getMyMapXy();
      const map = getPlayerMap();
      const selectedXy = `${tileX},${tileY}`;

      if (myXy && map.has(selectedXy) && selectedXy !== myXy) {
         const path = findPath(xyToPoint(myXy), { x: tileX, y: tileY });
         this.drawPath(path);
      } else {
         this.clearPath();
      }

      Singleton().routeTo(PlayerMapPage, { xy: selectedXy });
   }

   private addOrReplaceTile(xy: string, entry: IClientMapEntry) {
      this._tiles.get(xy)?.destroy({ children: true });
      const count = this._idToTradeCount.get(entry.userId);
      const b = TileBuildings.get(xy);
      const container = this._playerTiles.addChild(
         new PlayerTile(
            xyToPoint(xy),
            entry,
            count ?? 0,
            b ? getTexture(`Building_${b}`, this.context.textures) : null,
            this.context,
         ),
      );
      this._tiles.set(xy, container);
      this._idToTile.set(entry.userId, xy);
   }

   private removeTile(xy: string) {
      const id = getPlayerMap().get(xy)?.userId;
      if (id) {
         this._idToTile.delete(id);
      }
      this._tiles.get(xy)?.destroy({ children: true });
      this._tiles.delete(xy);
   }
}

class PlayerTile extends Container {
   constructor(
      tile: IPointData,
      data: IClientMapEntry,
      trade: number,
      building: Texture | null,
      context: ISceneContext,
   ) {
      super();
      const { textures } = context;
      const { x, y } = tile;

      const isMyself = data.userId === getUser()?.userId;
      const isReserved = isTileReserved(data);

      const color = UserColorsMapping.get(data.color);
      if (color) {
         const sprite = this.addChild(new Sprite(context.textures.Misc_100x100));
         sprite.position.set(x * GridSize, y * GridSize);
         sprite.tint = getColorCached(color);
         if (building) {
            const buildingSprite = this.addChild(new Sprite(building));
            buildingSprite.anchor.set(0.5, 0.5);
            buildingSprite.scale.set(0.75);
            buildingSprite.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize);
            buildingSprite.alpha = 0.25;
         }
      }

      const flag = this.addChild(new Sprite(textures[`Flag_${data.flag.toUpperCase()}`]));
      flag.anchor.set(0.5, 0.5);
      flag.position.set(x * GridSize + 0.5 * GridSize - 15, y * GridSize + 0.5 * GridSize - 24);
      flag.alpha = isReserved ? 1 : 0.5;

      const level = this.addChild(new Sprite(textures[`Misc_${AccountLevelImages[data.level]}`]));
      level.anchor.set(0.5, 0.5);
      level.scale.set(0.25);
      level.position.set(x * GridSize + 0.5 * GridSize + 15, y * GridSize + 0.5 * GridSize - 24);
      level.alpha = isReserved ? 1 : 0.5;

      if (trade > 0) {
         const bg = this.addChild(new Sprite(getTexture("Misc_Circle_25", textures)));
         bg.anchor.set(0.5, 0.5);
         bg.tint = 0xe74c3c;
         bg.position.set(x * GridSize + 0.9 * GridSize, y * GridSize + 0.12 * GridSize);

         const tradeCount = this.addChild(
            new BitmapText(String(trade), {
               fontName: Fonts.Cabin,
               fontSize: 20,
               tint: 0xffffff,
            }),
         );
         tradeCount.anchor.set(0.5, 0.5);
         tradeCount.position.set(x * GridSize + 0.9 * GridSize, y * GridSize + 0.1 * GridSize);
      }

      const handle = this.addChild(
         new BitmapText(data.handle, {
            fontName: Fonts.Cabin,
            fontSize: 16,
            tint: isMyself ? 0xffeaa7 : 0xffffff,
         }),
      );

      while (handle.width > GridSize - 10) {
         handle.fontSize--;
      }

      handle.anchor.set(0.5, 0.5);
      handle.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize);
      handle.alpha = isReserved ? 1 : 0.5;

      const tariff = this.addChild(
         new BitmapText(formatPercent(data.tariffRate), {
            fontName: Fonts.Cabin,
            fontSize: 20,
            tint: isMyself ? 0xffeaa7 : 0xffffff,
         }),
      );
      tariff.anchor.set(0.5, 0.5);
      tariff.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize + 20);
      tariff.alpha = isReserved ? 1 : 0.5;
   }
}
