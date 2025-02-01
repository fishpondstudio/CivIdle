import type React from "react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import type { GameState } from "../../../shared/logic/GameState";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import SpaceshipIdle from "../../images/SpaceshipIdle.png";
import { openUrl } from "../utilities/Platform";
import { playClick } from "../visuals/Sound";

export function SpaceshipIdleComponent({
   type,
   gameState,
}: { type: Building; gameState: GameState }): React.ReactNode {
   if (gameState.unlockedUpgrades.SpaceshipIdle) {
      return null;
   }
   if (type === "InternationalSpaceStation" || type === "DysonSphere" || type === "AldersonDisk") {
      return (
         <img
            src={SpaceshipIdle}
            className="w100 pointer"
            onClick={() => {
               playClick();
               gameState.unlockedUpgrades.SpaceshipIdle = true;
               notifyGameStateUpdate();
               openUrl("https://store.steampowered.com/app/3454630/Spaceship_Idle/");
            }}
         />
      );
   }
   return null;
}
