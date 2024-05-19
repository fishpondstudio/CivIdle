import { BitmapText, Container, Sprite, Text } from "pixi.js";
import { useEffect, useRef } from "react";
import { GreatPersonType, type GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../../shared/logic/Config";
import { containsNonASCII, numberToRoman } from "../../../shared/utilities/Helper";
import { getTexture } from "../logic/VisualLogic";
import type { ISceneContext } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";
import { Fonts } from "./Fonts";

function makeText(text: string, font: string, size: number, tint: number) {
   if (containsNonASCII(text)) {
      return new Text(text, {
         fontFamily: "serif",
         fontSize: size,
         fill: tint,
      });
   }
   return new BitmapText(text, {
      fontName: font,
      fontSize: size,
      tint,
   });
}

function makeTextAutoSize(text: string, font: string, size: number, tint: number, maxWidth: number) {
   let result = makeText(text, font, size, tint);
   while (result.width > maxWidth) {
      result = makeText(text, font, --size, tint);
   }
   return result;
}

export function greatPersonSprite(greatPerson: GreatPerson, context: ISceneContext): Container {
   const { textures } = context;
   const { time, name, age, type } = Config.GreatPerson[greatPerson];

   const container = new Container();

   const bg = container.addChild(new Sprite(getTexture("Misc_GreatPersonBackground", textures)));
   bg.position.set(10, 10);

   const cardFrame = container.addChild(new Sprite(getTexture("Misc_GreatPersonFrame", textures)));
   cardFrame.position.set(0, 0);
   const primaryColor = Config.TechAge[age].color;
   cardFrame.tint = primaryColor;

   if (type !== GreatPersonType.Normal) {
      const ring = container.addChild(new Sprite(getTexture("Misc_GreatPersonRing", textures)));
      ring.tint = primaryColor;
      ring.anchor.set(1, 1);
      ring.position.set(cardFrame.width, cardFrame.height);
      ring.alpha = 0.7;

      const typeText = container.addChild(
         makeText(GreatPersonType[type].charAt(0).toUpperCase(), Fonts.Marcellus, 80, primaryColor),
      );
      typeText.anchor.set(0.5, 0.5);
      typeText.angle = -20;
      typeText.position.set(440, 530);
      typeText.alpha = 0.7;
   }

   const photoFrame = container.addChild(new Sprite(getTexture("Misc_GreatPersonPhoto", textures)));

   photoFrame.position.set(
      (container.width - photoFrame.width) / 2,
      (container.height - photoFrame.height) / 2 - 30,
   );

   const sprite = photoFrame.addChild(new Sprite(getTexture(`Person_${greatPerson}`, textures)));
   const mask = sprite.addChild(new Sprite(getTexture("Misc_GreatPersonPhotoMask", textures)));
   sprite.mask = mask;
   sprite.scale.set(350 / Math.max(sprite.width, sprite.height));
   sprite.position.set((photoFrame.width - sprite.width) / 2, (photoFrame.height - sprite.width) / 2);

   const ageText = container.addChild(
      makeTextAutoSize(Config.TechAge[age].name(), Fonts.OldTypefaces, 46, 0xffffff, 350),
   );
   ageText.position.set(30, 12);

   const ageNumber = container.addChild(
      makeText(numberToRoman(Config.TechAge[age].idx + 1) ?? "", Fonts.Marcellus, 50, primaryColor),
   );
   ageNumber.anchor.set(0.5, 0.5);
   ageNumber.position.set(439, 40);

   const nameText = container.addChild(makeTextAutoSize(name(), Fonts.OldTypefaces, 50, 0x636e72, 400));
   nameText.position.set(cardFrame.width / 2, 490);
   nameText.anchor.set(0.5, 0.5);

   const timeText = container.addChild(makeText(time, Fonts.Marcellus, 25, 0xffffff));
   timeText.position.set((container.width - timeText.width) / 2, 560);

   return container;
}

const greatPersonImageCache: Map<GreatPerson, string> = new Map();

function greatPersonImage(greatPerson: GreatPerson, context: ISceneContext): string {
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

interface GreatPersonImageProps extends React.HTMLAttributes<HTMLElement> {
   greatPerson: GreatPerson;
}

export function GreatPersonImage({ greatPerson, ...htmlProps }: GreatPersonImageProps): React.ReactNode {
   const imgRef = useRef<HTMLImageElement>(null);
   useEffect(() => {
      setTimeout(() => {
         if (imgRef.current) {
            imgRef.current.src = greatPersonImage(greatPerson, Singleton().sceneManager.getContext());
         }
      }, 0);
   }, [greatPerson]);
   return <img ref={imgRef} {...htmlProps} />;
}
