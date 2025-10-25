import { SmoothGraphics } from "@pixi/graphics-smooth";
import {
   Container,
   LINE_CAP,
   LINE_JOIN,
   ParticleContainer,
   Sprite,
   Texture,
   type ColorSource,
   type FederatedPointerEvent,
   type IPointData,
} from "pixi.js";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import WorldMap from "../../../shared/definitions/WorldMap.json";
import {
   MAP_MAX_X,
   MAP_MAX_Y,
   type IClientMapEntry,
   type IClientTrade,
} from "../../../shared/utilities/Database";
import { forEach, mapSafeAdd, sizeOf, xyToPoint } from "../../../shared/utilities/Helper";
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
import { Scene, destroyAllChildren, type ISceneContext } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";
import { Easing } from "../utilities/pixi-actions/Easing";
import { CustomAction } from "../utilities/pixi-actions/actions/CustomAction";
import { findPathAsync, getOwnedTradeTile } from "./PathFinder";
import { PlayerTile } from "./PlayerTile";

let viewportCenter: IPointData | null = null;
let viewportZoom: number | null = null;

export const GridSize = 100;

export class PlayerMapScene extends Scene {
   private _width: number;
   private _height: number;
   private _selectedGraphics: SmoothGraphics;
   private _tiles = new Map<string, PlayerTile>();
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
      this._tiles.forEach((tile, xy) => {
         const b = TileBuildings.get(xy);
         tile.setBuildingTexture(b ? getTexture(`Building_${b}`, this.context.textures) : Texture.EMPTY);
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
