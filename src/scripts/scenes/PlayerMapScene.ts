import { SmoothGraphics } from "@pixi/graphics-smooth";
import {
   BitmapText,
   Container,
   FederatedPointerEvent,
   IPointData,
   LINE_CAP,
   LINE_JOIN,
   MSAA_QUALITY,
   TilingSprite,
} from "pixi.js";
import { IMapEntry } from "../../../server/src/Database";
import { Singleton } from "../Global";
import { OnPlayerMapMessage, playerMap } from "../rpc/RPCClient";
import { PlayerMapPage } from "../ui/PlayerMapPage";
import { forEach, safeParseInt } from "../utilities/Helper";
import { ViewportScene } from "../utilities/SceneManager";
import { Disposable } from "../utilities/TypedEvent";
import { Fonts } from "../visuals/Fonts";

let viewportCenter: IPointData | null = null;
let viewportZoom: number | null = null;

const MaxX = 100;
const MaxY = 100;
const GridSize = 100;

export class PlayerMapScene extends ViewportScene {
   private _width!: number;
   private _height!: number;
   private _selectedGraphics!: SmoothGraphics;
   private _tiles: Record<string, Container> = {};
   private _listener!: Disposable;

   override onLoad(): void {
      const { app, textures } = this.context;
      this._width = MaxX * GridSize;
      this._height = MaxY * GridSize;

      this.viewport.worldWidth = this._width;
      this.viewport.worldHeight = this._height;

      this.viewport
         .drag()
         .wheel({ smooth: 10 })
         .clamp({
            direction: "all",
         })
         .clampZoom({
            maxScale: 1,
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

      for (let x = 0; x <= MaxX; x++) {
         graphics.moveTo(x * GridSize, 0);
         graphics.lineTo(x * GridSize, MaxY * GridSize);
      }

      for (let y = 0; y <= MaxY; y++) {
         graphics.moveTo(0, y * GridSize);
         graphics.lineTo(MaxX * GridSize, y * GridSize);
      }

      graphics.cacheAsBitmap = true;
      graphics.cacheAsBitmapMultisample = MSAA_QUALITY.HIGH;

      this.drawAllTiles();

      this._listener = OnPlayerMapMessage.on(this.drawAllTiles.bind(this));

      this._selectedGraphics = this.viewport.addChild(new SmoothGraphics());

      if (viewportCenter) {
         this.viewport.moveCenter(viewportCenter);
      } else {
         this.viewport.moveCenter(this._width / 2, this._height / 2);
      }
      if (viewportZoom) {
         this.viewport.setZoom(viewportZoom, true);
      }

      this.viewport.on("moved", () => {
         viewportCenter = this.viewport.center;
         viewportZoom = this.viewport.scaled;
      });

      this.viewport.on("clicked", (e) => {
         if ((e.event as FederatedPointerEvent).button === 2) {
            return;
         }
         const tileX = Math.floor(e.world.x / GridSize);
         const tileY = Math.floor(e.world.y / GridSize);
         const x = tileX * GridSize;
         const y = tileY * GridSize;
         if (!this._selectedGraphics) {
            return;
         }
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
         Singleton().routeTo(PlayerMapPage, { xy: tileX + "," + tileY });
      });
      Singleton().routeTo(PlayerMapPage, { xy: "0,0" });
   }

   drawAllTiles() {
      forEach(playerMap, (xy, entry) => {
         this.drawTile(xy, entry);
      });
   }

   private drawTile(xy: string, entry: IMapEntry) {
      const [x, y] = xy.split(",").map((x) => safeParseInt(x));
      const container = this.viewport.addChild(new Container());
      if (this._tiles[xy]) {
         this._tiles[xy].destroy({ children: true });
      }
      this._tiles[xy] = container;

      const handle = container.addChild(
         new BitmapText(entry.handle, {
            fontName: Fonts.Cabin,
            fontSize: 16,
            tint: 0xffffff,
         })
      );
      handle.anchor.set(0.5, 0.5);
      handle.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize - 10);

      const tariff = container.addChild(
         new BitmapText(`${entry.tariffRate}%`, {
            fontName: Fonts.Cabin,
            fontSize: 14,
            tint: 0xffffff,
         })
      );
      tariff.anchor.set(0.5, 0.5);
      tariff.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize + 15);
   }

   override onDestroy(): void {
      this._listener.dispose();
   }
}
