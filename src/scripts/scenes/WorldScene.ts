import { SmoothGraphics } from "@pixi/graphics-smooth";
import { Viewport } from "pixi-viewport";
import { IPointData, LINE_CAP, LINE_JOIN, Sprite, Texture, TilingSprite, utils } from "pixi.js";
import { Singleton } from "../Global";
import { GameState } from "../logic/GameState";
import { TilePage } from "../ui/TilePage";
import { forEach, lookAt, pointToXy, xyToPoint } from "../utilities/Helper";
import { ObjectPool } from "../utilities/ObjectPool";
import { Scene } from "../utilities/SceneManager";
import { TileVisual } from "./TileVisual";

class TransportPool extends ObjectPool<Sprite> {
   _texture: Texture;

   constructor(texture: Texture) {
      super();
      console.assert(texture instanceof Texture, "Texture is not valid");
      this._texture = texture;
   }

   protected override create(): Sprite {
      const visual = new Sprite(this._texture);
      visual.scale = { x: 0.15, y: 0.15 };
      visual.alpha = 0.5;
      return visual;
   }

   protected onAllocate(obj: Sprite): void {
      obj.visible = true;
   }

   protected onRelease(obj: Sprite): void {
      obj.visible = false;
   }
}

export class WorldScene extends Scene {
   private _width!: number;
   private _height!: number;
   private _viewport!: Viewport;
   private _selectedGraphics!: SmoothGraphics;
   private _transportPool!: TransportPool;

   public get viewport() {
      return this._viewport;
   }

   private readonly _tiles: utils.Dict<TileVisual> = {};
   private readonly _transport: Record<number, Sprite> = {};

   override onLoad(): void {
      const { app, textures } = this.context;

      this._transportPool = new TransportPool(textures.Transport);

      const maxPosition = Singleton().grid.maxPosition();
      this._width = maxPosition.x;
      this._height = maxPosition.y;

      this._viewport = new Viewport({
         interaction: app.renderer.plugins.interaction,
         disableOnContextMenu: true,
         worldWidth: this._width,
         worldHeight: this._height,
         screenWidth: app.screen.width,
         screenHeight: app.screen.height,
      });

      this._viewport
         .drag()
         .wheel({ smooth: 10 })
         .clamp({
            direction: "all",
         })
         .clampZoom({
            maxScale: 2,
            minScale: Math.max(app.screen.width / this._width, app.screen.height / this._height),
         });

      app.stage.addChild(this._viewport);
      const bg = new TilingSprite(textures.Paper, this._width, this._height);
      bg.tint = 0x4b6584;
      bg.position.set((this._width - bg.width) / 2, (this._height - bg.height) / 2);
      this._viewport.addChild(bg);

      const graphics = this._viewport.addChild(new SmoothGraphics()).lineStyle({
         color: 0xffffff,
         width: 2,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
         alignment: 0.5,
      });
      graphics.alpha = 0.05;
      Singleton().grid.drawGrid(graphics);

      Singleton().grid.forEach((grid) => {
         const xy = pointToXy(grid);
         this._tiles[xy] = this._viewport.addChild(new TileVisual(this, grid));
      });

      this._selectedGraphics = this._viewport.addChild(new SmoothGraphics());

      this._viewport.moveCenter(this._width / 2, this._height / 2);

      this._viewport.on("clicked", (e) => {
         const grid = Singleton().grid.positionToGrid(e.world);
         if (e.event.data.button === 2) {
            return;
         }
         this.selectGrid(grid);
      });

      this.selectGrid(xyToPoint(Singleton().buildings.Headquarter.xy));
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
      this._tiles[xy] = this._viewport.addChild(new TileVisual(this, xyToPoint(xy)));
   }

   updateTransportVisual(gs: GameState) {
      const ticked: Record<number, true> = {};
      forEach(gs.transportation, (xy, transports) => {
         transports.forEach((t) => {
            if (!this._transport[t.id]) {
               const visual = this._transportPool.allocate();
               visual.position = t.position;
               lookAt(visual, t.toPosition);
               this._transport[t.id] = visual;
               this._viewport.addChild(visual);
            } else {
               this._transport[t.id].position = t.position;
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
