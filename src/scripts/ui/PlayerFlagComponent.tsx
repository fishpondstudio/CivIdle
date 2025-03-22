import React from "react";
import flags from "../../images/textures_flag.png";
import { Singleton } from "../utilities/Singleton";

export const PlayerFlagComponent = React.forwardRef<
   HTMLDivElement,
   { name: string; scale?: number; style?: React.CSSProperties }
>((props, ref) => {
   const { name, scale = 1, style } = props;
   const texture = Singleton().textures[`Flag_${name.toUpperCase()}`];
   if (!texture) {
      return null;
   }
   return (
      <div
         ref={ref}
         style={{
            ...style,
            backgroundImage: `url(${flags})`,
            width: texture.frame.width * scale,
            height: texture.frame.height * scale,
            backgroundPosition: `-${texture.frame.x * scale}px -${texture.frame.y * scale}px`,
            backgroundSize: `${texture.baseTexture.width * scale}px ${texture.baseTexture.height * scale}px`,
         }}
      ></div>
   );
});
