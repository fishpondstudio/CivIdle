import {
   BitmapText,
   Container,
   Text,
   type IBitmapTextStyle,
   type ITextStyle,
   type ObservablePoint,
   type TextStyle,
} from "pixi.js";
import { containsNonASCII } from "./Helper";

export class UnicodeText extends Container {
   private _text?: Text;
   private _bitmapText?: BitmapText;

   constructor(text: string, style: Partial<IBitmapTextStyle>, fallbackStyle: Partial<TextStyle>) {
      super();
      if (containsNonASCII(text)) {
         const textStyle: Partial<ITextStyle> = { ...fallbackStyle, ...style };
         if (style.tint) {
            if (typeof style.tint === "number") {
               textStyle.fill = style.tint;
            } else {
               console.warn("UnicodeText: `style.tint` should be a number, but got", style.tint);
            }
         }
         this._text = new Text(text, textStyle);
         this.addChild(this._text);
      } else {
         this._bitmapText = new BitmapText(text, style);
         this.addChild(this._bitmapText);
      }
   }

   public get size(): number {
      if (this._text) {
         return this._text.style.fontSize as number;
      }
      if (this._bitmapText) {
         return this._bitmapText.fontSize;
      }
      throw new Error("UnicodeText: No Text or BitmapText!");
   }

   public set size(size: number) {
      if (this._text) {
         this._text.style.fontSize = size;
      }
      if (this._bitmapText) {
         this._bitmapText.fontSize = size;
      }
   }

   public get anchor(): ObservablePoint {
      if (this._text) {
         return this._text.anchor;
      }
      if (this._bitmapText) {
         return this._bitmapText.anchor;
      }
      throw new Error("UnicodeText: No Text or BitmapText!");
   }

   public set text(text: string) {
      if (this._text) {
         this._text.text = text;
      }
      if (this._bitmapText) {
         this._bitmapText.text = text;
      }
   }

   public set tint(tint: number) {
      if (this._text) {
         this._text.style.fill = tint;
      }
      if (this._bitmapText) {
         this._bitmapText.tint = tint;
      }
   }
}
