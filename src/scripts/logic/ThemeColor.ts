import randomColor from "randomcolor";
import { isSpecialBuilding } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { GameOptions } from "../../../shared/logic/GameState";
import { getBuildingsThatProduce } from "../../../shared/logic/ResourceLogic";
import { forEach, reduceOf, sizeOf } from "../../../shared/utilities/Helper";

export function randomizeBuildingAndResourceColor(gameOptions: GameOptions) {
   const colors = randomColor({
      luminosity: "light",
      count:
         reduceOf(Config.Building, (prev, k) => prev + (isSpecialBuilding(k) ? 0 : 1), 0) +
         sizeOf(Config.Material),
   });
   forEach(Config.Building, (k, v) => {
      if (!isSpecialBuilding(k)) {
         gameOptions.buildingColors[k] = colors.pop();
      } else {
         delete gameOptions.buildingColors[k];
      }
   });
   forEach(Config.Material, (k, v) => {
      gameOptions.resourceColors[k] = colors.pop();
   });
}
export function copyBuildingColorToResource(gameOptions: GameOptions) {
   forEach(Config.Material, (res) => {
      const buildings = getBuildingsThatProduce(res);
      for (const building of buildings) {
         if (gameOptions.buildingColors[building]) {
            gameOptions.resourceColors[res] = gameOptions.buildingColors[building];
            return;
         }
      }
   });
}
