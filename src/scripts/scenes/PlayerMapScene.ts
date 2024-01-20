import { SmoothGraphics } from "@pixi/graphics-smooth";
import type { FederatedPointerEvent, IPointData } from "pixi.js";
import { BitmapText, Container, LINE_CAP, LINE_JOIN, Sprite } from "pixi.js";
import WorldMap from "../../../server/WorldMap.json";
import { MAP_MAX_X, MAP_MAX_Y, type IClientMapEntry } from "../../../shared/utilities/Database";
import {
   drawDashedLine,
   forEach,
   formatPercent,
   safeParseInt,
   xyToPoint,
} from "../../../shared/utilities/Helper";
import { getGameOptions } from "../Global";
import { OnPlayerMapMessage, getPlayerMap } from "../rpc/RPCClient";
import { PlayerMapPage } from "../ui/PlayerMapPage";
import { ViewportScene } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";
import type { Disposable } from "../utilities/TypedEvent";
import { Fonts } from "../visuals/Fonts";
import { findPath, getMyMapXy } from "./PathFinder";

let viewportCenter: IPointData | null = null;
let viewportZoom: number | null = null;

const GridSize = 100;

export class PlayerMapScene extends ViewportScene {
   private _width!: number;
   private _height!: number;
   private _selectedGraphics!: SmoothGraphics;
   private _tiles: Record<string, Container> = {};
   private _listener!: Disposable;
   private _path!: SmoothGraphics;

   override onLoad(): void {
      const { app, textures } = this.context;
      this._width = MAP_MAX_X * GridSize;
      this._height = MAP_MAX_Y * GridSize;

      const minZoom = Math.max(app.screen.width / this._width, app.screen.height / this._height);
      this.viewport.setWorldSize(this._width, this._height);
      this.viewport.setZoomRange(minZoom, 1);

      app.renderer.background.color = 0x2980b9;

      // Assets.load<Texture>("/World.png").then((texture) => {
      //    const sprite = this.viewport.addChild(new Sprite(texture));
      //    sprite.anchor.set(0.5, 0.5);
      //    sprite.position.set(this._width / 2, this._height / 2);
      //    sprite.scale.set(11);
      //    sprite.alpha = 0.5;

      //    const pixels: Uint8Array = app.renderer.plugins.extract.pixels(sprite);
      //    const map: Record<string, true> = {};
      //    for (let x = 0; x <= MaxX; x++) {
      //       for (let y = 0; y <= MaxY; y++) {
      //          const pos = new Vector2((x * GridSize + 0.5 * GridSize) / 11, (y * GridSize + 0.5 * GridSize) / 11);
      //          const ind = Math.round(pos.x) + Math.round(pos.y) * texture.width;
      //          if (pixels[ind * 4 + 3] > 0) {
      //             map[`${x},${y + 3}`] = true;
      //          }
      //       }
      //    }
      //    forEach(map, (xy) => {
      //       const point = xyToPoint(xy);
      //       const sprite = this.viewport.addChild(new Sprite(this.context.textures["100x100"]));
      //       sprite.position.set(point.x * GridSize, point.y * GridSize);
      //    });
      //    navigator.clipboard.writeText(JSON.stringify(map));
      //    sprite.visible = false;
      // });

      forEach(WorldMap, (xy) => {
         const point = xyToPoint(xy);
         const sprite = this.viewport.addChild(new Sprite(this.context.textures["100x100"]));
         sprite.tint = 0x3498db;
         sprite.position.set(point.x * GridSize, point.y * GridSize);
      });

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

      forEach(getPlayerMap(), (xy, entry) => {
         this.drawTile(xy, entry);
      });

      this._listener = OnPlayerMapMessage.on((message) => {
         if (message.remove) {
            message.remove.forEach((xy) => {
               this._tiles[xy]?.destroy({ children: true });
               delete this._tiles[xy];
            });
         }
         if (message.upsert) {
            forEach(message.upsert, (xy, entry) => {
               this.drawTile(xy, entry);
            });
         }
      });

      this._selectedGraphics = this.viewport.addChild(new SmoothGraphics());
      this._path = this.viewport.addChild(new SmoothGraphics());

      this.viewport.on("clicked", (e: FederatedPointerEvent) => {
         if (e.button === 2) {
            return;
         }
         const pos = this.viewport.screenToWorld(e);
         const tileX = Math.floor(pos.x / GridSize);
         const tileY = Math.floor(pos.y / GridSize);
         this.selectTile(tileX, tileY);
      });

      if (!viewportZoom) {
         viewportZoom = (minZoom + 1) / 2;
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

      this.viewport.on("moved", () => {
         viewportCenter = this.viewport.center;
         viewportZoom = this.viewport.zoom;
      });
   }

   private tileToPosition(tile: IPointData): IPointData {
      return { x: (tile.x + 0.5) * GridSize, y: (tile.y + 0.5) * GridSize };
   }

   public drawPath(path: IPointData[]): void {
      this._path.clear().lineStyle({
         color: 0xffff99,
         width: 4,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
         alignment: 0.5,
      });
      this._path.alpha = 0.5;
      let count = 0;
      path.forEach((point, idx) => {
         const pos = this.tileToPosition(point);
         if (idx === 0) {
            this._path.moveTo(pos.x, pos.y);
         } else {
            count = drawDashedLine(this._path, this.tileToPosition(path[idx - 1]), pos, count, 5, 10);
         }
      });
   }

   public clearPath() {
      this._path.clear();
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

      if (myXy && map[`${tileX},${tileY}`]) {
         const path = findPath(xyToPoint(myXy), { x: tileX, y: tileY });
         this.drawPath(path);
      } else {
         this.clearPath();
      }

      Singleton().routeTo(PlayerMapPage, { xy: `${tileX},${tileY}` });
   }

   private drawTile(xy: string, entry: IClientMapEntry) {
      const [x, y] = xy.split(",").map((x) => safeParseInt(x));
      const container = this.viewport.addChild(new Container());
      if (this._tiles[xy]) {
         this._tiles[xy].destroy({ children: true });
      }
      this._tiles[xy] = container;
      const isMyself = entry.userId === getGameOptions().id;
      const handle = container.addChild(
         new BitmapText(entry.handle, {
            fontName: Fonts.Cabin,
            fontSize: 16,
            tint: isMyself ? 0xffeaa7 : 0xffffff,
         }),
      );
      handle.anchor.set(0.5, 0.5);
      handle.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize - 10);

      const tariff = container.addChild(
         new BitmapText(formatPercent(entry.tariffRate), {
            fontName: Fonts.Cabin,
            fontSize: 14,
            tint: isMyself ? 0xffeaa7 : 0xffffff,
         }),
      );
      tariff.anchor.set(0.5, 0.5);
      tariff.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize + 15);
   }

   override onDestroy(): void {
      this._listener.dispose();
   }
}
