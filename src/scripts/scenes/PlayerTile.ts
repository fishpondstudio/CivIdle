import {
   BitmapText,
   Container,
   Rectangle,
   Sprite,
   Texture,
   type IPointData,
   type RenderTexture,
} from "pixi.js";
import type { City } from "../../../shared/definitions/CityDefinitions";
import { Config } from "../../../shared/logic/Config";
import { isTileReserved } from "../../../shared/logic/PlayerTradeLogic";
import { UserColorsMapping, type IClientMapEntry } from "../../../shared/utilities/Database";
import { formatPercent } from "../../../shared/utilities/Helper";
import { UnicodeText } from "../../../shared/utilities/UnicodeText";
import { getTexture } from "../logic/VisualLogic";
import { getUser } from "../rpc/RPCClient";
import { AccountLevelImages } from "../ui/TextureSprites";
import { getColorCached } from "../utilities/CachedColor";
import type { ISceneContext } from "../utilities/SceneManager";
import { Fonts } from "../visuals/Fonts";
import { GridSize } from "./PlayerMapScene";

const _cityCache = new Map<City, RenderTexture>();

export class PlayerTile extends Container {
   private _buildingSprite: Sprite;
   public cullingRect: Rectangle;

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

      this.cullingRect = new Rectangle(
         x * GridSize - GridSize / 2,
         y * GridSize - GridSize / 2,
         2 * GridSize,
         2 * GridSize,
      );

      const color = UserColorsMapping[data.color] ?? 3447003;
      const sprite = this.addChild(new Sprite(context.textures.Misc_100x100));
      sprite.position.set(x * GridSize, y * GridSize);
      sprite.tint = getColorCached(color);

      this._buildingSprite = this.addChild(new Sprite(building ?? Texture.EMPTY));
      if (building) {
         this._buildingSprite.anchor.set(0.5, 0.5);
         this._buildingSprite.scale.set(0.75);
         this._buildingSprite.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize);
         this._buildingSprite.alpha = 0.25;
      }

      const flag = this.addChild(new Sprite(textures[`Flag_${data.flag.toUpperCase()}`]));
      flag.anchor.set(0.5, 0.5);
      flag.position.set(x * GridSize + 0.5 * GridSize - 20, y * GridSize + 0.5 * GridSize - 30);
      flag.alpha = isReserved ? 1 : 0.5;

      const level = this.addChild(new Sprite(textures[`Misc_${AccountLevelImages[data.level]}`]));
      level.anchor.set(0.5, 0.5);
      level.scale.set(0.25);
      level.position.set(x * GridSize + 0.5 * GridSize + 15, y * GridSize + 0.5 * GridSize - 30);
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
            tint: isMyself ? 0xffb86f : 0xffffff,
         }),
      );

      while (handle.width > GridSize - 10) {
         handle.fontSize--;
      }

      handle.anchor.set(0.5, 0.5);
      handle.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize - 5);
      handle.alpha = isReserved ? 1 : 0.5;

      const tariff = this.addChild(
         new BitmapText(formatPercent(data.tariffRate), {
            fontName: Fonts.Cabin,
            fontSize: 20,
            tint: isMyself ? 0xffb86f : 0xffffff,
         }),
      );
      tariff.anchor.set(0.5, 0.5);
      tariff.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize + 15);
      tariff.alpha = isReserved ? 1 : 0.5;

      if (data.city && data.city in Config.City) {
         let texture = _cityCache.get(data.city);
         if (!texture) {
            texture = context.app.renderer.generateTexture(
               new UnicodeText(
                  Config.City[data.city].name(),
                  {
                     fontName: Fonts.Cabin,
                     fontSize: 14,
                     tint: 0xffffff,
                  },
                  {
                     dropShadow: true,
                     dropShadowAlpha: 0.75,
                     dropShadowColor: "#000000",
                     dropShadowAngle: Math.PI / 6,
                     dropShadowBlur: 0,
                     dropShadowDistance: 1,
                  },
               ),
               { resolution: 2 },
            );
            _cityCache.set(data.city, texture);
         }

         const city = this.addChild(new Sprite(texture));
         city.anchor.set(0.5, 0.5);
         city.position.set(x * GridSize + 0.5 * GridSize, y * GridSize + 0.5 * GridSize + 35);
         city.alpha = isReserved ? 1 : 0.5;
      }
   }

   public setBuildingTexture(texture: Texture): void {
      this._buildingSprite.texture = texture;
   }
}
