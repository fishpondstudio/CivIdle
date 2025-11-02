import React from "react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import type { Deposit } from "../../../shared/definitions/MaterialDefinitions";
import type { TileTexture } from "../../../shared/logic/GameState";
import { AccountLevel } from "../../../shared/utilities/Database";
import building from "../../images/textures_building.png";
import flags from "../../images/textures_flag.png";
import misc from "../../images/textures_misc.png";
import tile from "../../images/textures_tile.png";
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
   [AccountLevel.Caesar]: "AccountLevel6",
   [AccountLevel.Augustus]: "AccountLevel7",
};

export const AccountLevelComponent = React.forwardRef<
   HTMLDivElement,
   { level: AccountLevel; scale?: number; width?: number; height?: number; style?: React.CSSProperties }
>((props, ref) => {
   return <TextureSprite {...props} url={misc} name={`Misc_${AccountLevelImages[props.level]}`} ref={ref} />;
});

export const BuildingSpriteComponent = React.forwardRef<
   HTMLDivElement,
   {
      building: Building;
      override?: string;
      scale?: number;
      width?: number;
      height?: number;
      style?: React.CSSProperties;
   }
>((props, ref) => {
   return (
      <TextureSprite
         {...props}
         url={building}
         name={props.override ?? `Building_${props.building}`}
         ref={ref}
      />
   );
});

export const DepositTextureComponent = React.forwardRef<
   HTMLDivElement,
   { deposit: Deposit; scale?: number; width?: number; height?: number; style?: React.CSSProperties }
>((props, ref) => {
   return <TextureSprite {...props} url={tile} name={`Tile_${props.deposit}`} ref={ref} />;
});

export const TileTextureComponent = React.forwardRef<
   HTMLDivElement,
   { tileTexture: TileTexture; scale?: number; width?: number; height?: number; style?: React.CSSProperties }
>((props, ref) => {
   return <TextureSprite {...props} url={misc} name={`Misc_${props.tileTexture}`} ref={ref} />;
});

export const MiscTextureComponent = React.forwardRef<
   HTMLDivElement,
   { name: string; scale?: number; width?: number; height?: number; style?: React.CSSProperties }
>((props, ref) => {
   return <TextureSprite {...props} url={misc} name={`Misc_${props.name}`} ref={ref} />;
});

const TextureSprite = React.forwardRef<
   HTMLDivElement,
   { name: string; url: string; scale?: number; width?: number; height?: number; style?: React.CSSProperties }
>((props, ref) => {
   const { name, style, url } = props;
   let scale = props.scale ?? 1;
   const texture = Singleton().textures[name];
   if (!texture) {
      return null;
   }
   if (props.width) {
      scale = props.width / texture.frame.width;
   }
   if (props.height) {
      scale = props.height / texture.frame.height;
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
