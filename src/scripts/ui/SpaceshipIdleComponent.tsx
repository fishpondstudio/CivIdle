import type React from "react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import SpaceshipIdle from "../../images/SpaceshipIdle.png";
import { openUrl } from "../utilities/Platform";

export function SpaceshipIdleComponent({ type }: { type: Building }): React.ReactNode {
   if (type === "InternationalSpaceStation" || type === "DysonSphere" || type === "AldersonDisk") {
      return (
         <img
            src={SpaceshipIdle}
            className="w100 pointer"
            onClick={() => openUrl("https://store.steampowered.com/app/3454630/Spaceship_Idle/")}
         />
      );
   }
   return null;
}
