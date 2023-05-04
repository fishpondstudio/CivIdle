import { BitmapText, Container } from "pixi.js";
import { ObjectPool } from "../utilities/ObjectPool";
import { Fonts } from "../visuals/Fonts";

export class TooltipPool extends ObjectPool<BitmapText> {
   _parent: Container;

   public static readonly DefaultAlpha = 0.5;

   constructor(parent: Container) {
      super();
      this._parent = parent;
   }

   protected override create(): BitmapText {
      const visual = this._parent.addChild(
         new BitmapText("", {
            fontName: Fonts.Cabin,
            fontSize: 14,
            tint: 0xffffff,
         })
      );
      visual.anchor.set(0.5, 0.5);
      return visual;
   }

   protected onAllocate(obj: BitmapText): void {
      obj.visible = true;
   }

   protected onRelease(obj: BitmapText): void {
      obj.visible = false;
   }
}
