import React from "react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import type { TileTexture } from "../../../shared/logic/GameState";
import { AccountLevel } from "../../../shared/utilities/Database";
import building from "../../images/textures_building.png";
import flags from "../../images/textures_flag.png";
import misc from "../../images/textures_misc.png";
import { Singleton } from "../utilities/Singleton";

export const PlayerFlagComponent = React.forwardRef<
   HTMLDivElement,
   { name: string; scale?: number; style?: React.CSSProperties }
>((props, ref) => {
   return <TextureSprite {...props} url={flags} name={`Flag_${props.name.toUpperCase()}`} ref={ref} />;
});

export const AccountLevelImages: Record<AccountLevel, string> = {
   [AccountLevel.Tribune]: "AccountLevel1",
   [AccountLevel.Quaestor]: "AccountLevel2",
   [AccountLevel.Aedile]: "AccountLevel3",
   [AccountLevel.Praetor]: "AccountLevel4",
   [AccountLevel.Consul]: "AccountLevel5",
};

export const AccountLevelComponent = React.forwardRef<
   HTMLDivElement,
   { level: AccountLevel; scale?: number; style?: React.CSSProperties }
>((props, ref) => {
   return <TextureSprite {...props} url={misc} name={`Misc_${AccountLevelImages[props.level]}`} ref={ref} />;
});

export const BuildingSpriteComponent = React.forwardRef<
   HTMLDivElement,
   { building: Building; scale?: number; style?: React.CSSProperties }
>((props, ref) => {
   return <TextureSprite {...props} url={building} name={`Building_${props.building}`} ref={ref} />;
});

export const TileTextureComponent = React.forwardRef<
   HTMLDivElement,
   { tileTexture: TileTexture; scale?: number; style?: React.CSSProperties }
>((props, ref) => {
   return <TextureSprite {...props} url={misc} name={`Misc_${props.tileTexture}`} ref={ref} />;
});

export const SupporterComponent = React.forwardRef<
   HTMLDivElement,
   { scale?: number; style?: React.CSSProperties }
>((props, ref) => {
   return <TextureSprite {...props} url={misc} name={"Misc_Supporter"} ref={ref} />;
});

const TextureSprite = React.forwardRef<
   HTMLDivElement,
   { name: string; url: string; scale?: number; style?: React.CSSProperties }
>((props, ref) => {
   const { name, scale = 1, style, url } = props;
   const texture = Singleton().textures[name];
   if (!texture) {
      return null;
   }
   return (
      <div
         ref={ref}
         style={{
            ...style,
            backgroundImage: `url("${url}")`,
            width: texture.frame.width * scale,
            height: texture.frame.height * scale,
            backgroundPosition: `-${texture.frame.x * scale}px -${texture.frame.y * scale}px`,
            backgroundSize: `${texture.baseTexture.width * scale}px ${texture.baseTexture.height * scale}px`,
         }}
      ></div>
   );
});
