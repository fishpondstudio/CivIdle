import { getGameState } from "../../../shared/logic/GameStateLogic";
import { rollGreatPeopleThisRun } from "../../../shared/logic/RebirthLogic";
import { getCurrentAge } from "../../../shared/logic/TechLogic";
import type { Tile } from "../../../shared/utilities/Helper";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { showModal } from "../ui/GlobalModal";
import { playAgeUp } from "../visuals/Sound";

export function onBuildingOrUpgradeComplete(xy: Tile): void {
   const gs = getGameState();
   const building = gs.tiles.get(xy)?.building;
   if (!building) {
      return;
   }

   switch (building.type) {
      case "SantaClausVillage": {
         const candidates1 = rollGreatPeopleThisRun(new Set([getCurrentAge(gs)]), gs.city, 4);
         if (candidates1) {
            gs.greatPeopleChoicesV2.push(candidates1);
         }
         if (gs.greatPeopleChoicesV2.length > 0) {
            playAgeUp();
            showModal(<ChooseGreatPersonModal permanent={false} />);
         }
      }
   }
}
