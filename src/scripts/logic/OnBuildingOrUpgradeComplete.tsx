import { isSpecialBuilding } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGameState } from "../../../shared/logic/GameStateLogic";
import { rollGreatPeopleThisRun } from "../../../shared/logic/RebirthLogic";
import { getCurrentAge } from "../../../shared/logic/TechLogic";
import type { IChateauFrontenacBuildingData } from "../../../shared/logic/Tile";
import { entriesOf, keysOf, shuffle, type Tile } from "../../../shared/utilities/Helper";
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
         break;
      }
      case "QutbMinar": {
         const ages = new Set(keysOf(Config.TechAge));
         ages.delete(getCurrentAge(gs));
         const candidates1 = rollGreatPeopleThisRun(ages, gs.city, 2);
         if (candidates1) {
            gs.greatPeopleChoicesV2.push(candidates1);
         }
         if (gs.greatPeopleChoicesV2.length > 0) {
            playAgeUp();
            showModal(<ChooseGreatPersonModal permanent={false} />);
         }
         break;
      }
      case "ChateauFrontenac": {
         const chateauFrontenac = building as IChateauFrontenacBuildingData;
         if (!chateauFrontenac.buildings) {
            chateauFrontenac.buildings = {};
         }
         const techAge = getCurrentAge(gs);
         const candidates = entriesOf(Config.BuildingTechAge)
            .filter(([building, age]) => {
               return age === techAge && !isSpecialBuilding(building) && !Config.BuildingCity[building];
            })
            .map(([building]) => building);
         for (let i = 1; i <= building.level; i++) {
            if (!chateauFrontenac.buildings[i]) {
               chateauFrontenac.buildings[i] = {
                  selected: undefined,
                  options: shuffle(candidates).slice(0, 3),
               };
            }
         }
         break;
      }
   }
}
