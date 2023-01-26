import { OutlineFilter } from "@pixi/filter-outline";
import { BitmapText, Container, InteractionEvent, IRendererPlugins, Sprite, Texture } from "pixi.js";
import { Unlockable } from "../definitions/CityDefinitions";
import { RomeProvince } from "../definitions/RomeProvinceDefinitions";
import { Fonts } from "../generated/FontBundle";
import { v2 } from "../utilities/Vector2";

export class ProvinceVisual extends Container {
   private static readonly colors = [0x00cec9, 0x0984e3, 0xfdcb6e, 0xe84393, 0xe17055];
   public static i = 0;
   private static hitmapCache: Partial<Record<RomeProvince, Uint32Array>> = {};

   private readonly _sprite: Sprite;
   public readonly province: RomeProvince;

   constructor(
      id: RomeProvince,
      texture: Texture,
      plugins: IRendererPlugins,
      hitmapResolution = 32,
      hitmapAlphaThreshold = 255
   ) {
      super();
      this.province = id;
      const sprite = this.addChild(new Sprite(texture));
      const definitions = Unlockable.RomeProvince.definitions;
      const visual = definitions[id].visual;
      sprite.tint = ProvinceVisual.colors[ProvinceVisual.i++ % ProvinceVisual.colors.length];
      sprite.anchor.set(0.5, 0.5);
      sprite.interactive = true;

      const pixels: Uint8Array = plugins.extract.pixels(sprite);

      if (!ProvinceVisual.hitmapCache[id]) {
         const hitmap = new Uint32Array(Math.ceil((sprite.width * sprite.height) / hitmapResolution));
         for (let i = 0; i < sprite.width * sprite.height; i++) {
            const ind1 = i % 32;
            const ind2 = (i / 32) | 0;
            if (pixels[i * 4 + 3] >= hitmapAlphaThreshold) {
               hitmap[ind2] = hitmap[ind2] | (1 << ind1);
            }
         }
         ProvinceVisual.hitmapCache[id] = hitmap;
      }

      const text = this.addChild(
         new BitmapText(definitions[id].name(), {
            fontName: Fonts.MarcellusRegular,
            fontSize: visual?.textSize ?? 50,
            tint: 0xffffff,
         })
      );
      text.position.set(visual?.textX ?? 0, visual?.textY ?? 0);
      text.anchor.set(0.5, 0.5);
      text.angle = visual?.textAngle ?? 0;

      this._sprite = sprite;
      this.position.set(visual.x, visual.y);
   }

   public annex() {
      this._sprite.tint = 0x6c5ce7;
   }

   public isClicked(event: InteractionEvent): boolean {
      const point = v2(event.data.getLocalPosition(this._sprite)).add({
         x: this._sprite.width / 2,
         y: this._sprite.height / 2,
      });
      if (point.x < 0 || point.y < 0 || point.x > this._sprite.width || point.y > this._sprite.height) {
         return false;
      }
      const ind = Math.round(point.x) + Math.round(point.y) * this._sprite.width;
      const ind1 = ind % 32;
      const ind2 = (ind / 32) | 0;
      return (ProvinceVisual.hitmapCache[this.province]![ind2] & (1 << ind1)) !== 0;
   }

   private _outline = false;
   public get outline(): boolean {
      return this._outline;
   }

   public set outline(value: boolean) {
      this._outline = value;
      if (this._outline) {
         this.zIndex = 1;
         this._sprite.filters = [new OutlineFilter(2, 0xffffff)];
      } else {
         this.zIndex = 0;
         this._sprite.filters = [];
      }
   }
}
