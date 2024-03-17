import { SmoothGraphics } from "@pixi/graphics-smooth";
import { BitmapText, Sprite, Text } from "pixi.js";
import type { GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../../shared/logic/Config";
import { containsNonASCII } from "../../../shared/utilities/Helper";
import { getTexture } from "../logic/VisualLogic";
import type { ISceneContext } from "../utilities/SceneManager";
import { Fonts } from "./Fonts";

function makeText(text: string, size: number, tint: number) {
   if (containsNonASCII(text)) {
      return new Text(text, {
         fontFamily: "serif",
         fontSize: size,
         fill: tint,
      });
   }
   return new BitmapText(text, {
      fontName: Fonts.Marcellus,
      fontSize: size,
      tint,
   });
}

function makeTextAutoSize(text: string, size: number, tint: number, maxWidth: number) {
   let result = makeText(text, size, tint);
   while (result.width > maxWidth) {
      result = makeText(text, --size, tint);
   }
   return result;
}

export function greatPersonSprite(greatPerson: GreatPerson, context: ISceneContext): Sprite {
   const { textures } = context;
   const { time, name, age } = Config.GreatPerson[greatPerson];

   const bg = new Sprite(getTexture("Misc_GreatPersonBackground", textures));

   const frame = bg.addChild(new Sprite(getTexture("Misc_GreatPersonFrame", textures)));
   frame.anchor.set(0.5, 0.5);
   frame.position.set(bg.width / 2, 260);
   frame.scale.set(400 / frame.width);

   const sprite = frame.addChild(new Sprite(getTexture(`Person_${greatPerson}`, textures)));
   const graphics = sprite.addChild(new SmoothGraphics());
   graphics.beginFill(0xffffff);
   graphics.drawCircle(0, 0, Math.min(sprite.width, sprite.height) / 2);
   graphics.endFill();
   sprite.anchor.set(0.5, 0.5);
   sprite.mask = graphics;
   sprite.scale.set(350 / Math.max(sprite.width, sprite.height));

   const ageText = bg.addChild(makeTextAutoSize(Config.TechAge[age].name().toUpperCase(), 30, 0x34495e, 400));

   ageText.anchor.set(0.5, 0.5);
   ageText.alpha = 0.8;
   ageText.position.set(bg.width / 2, 50);

   const nameText = bg.addChild(makeTextAutoSize(name().toUpperCase(), 50, 0x34495e, 400));

   nameText.anchor.set(0.5, 0.5);
   nameText.alpha = 0.8;
   nameText.position.set(bg.width / 2, 480);

   const timeText = bg.addChild(makeText(time, 25, 0x34495e));

   timeText.anchor.set(0.5, 0.5);
   timeText.alpha = 0.8;
   timeText.position.set(bg.width / 2, 540);

   return bg;
}

const greatPersonImageCache: Map<GreatPerson, string> = new Map();

export function greatPersonImage(greatPerson: GreatPerson, context: ISceneContext): string {
   const cache = greatPersonImageCache.get(greatPerson);
   if (cache) {
      return cache;
   }
   const canvas = context.app.renderer.extract.canvas(
      greatPersonSprite(greatPerson, context),
   ) as HTMLCanvasElement;
   const dataURL = canvas.toDataURL();
   greatPersonImageCache.set(greatPerson, dataURL);
   return dataURL;
}
