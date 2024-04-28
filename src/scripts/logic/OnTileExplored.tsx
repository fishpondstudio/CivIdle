import { isNaturalWonder, isSpecialBuilding } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGameState } from "../../../shared/logic/GameStateLogic";
import { getXyBuildings } from "../../../shared/logic/IntraTickCache";
import { getGreatPeopleChoiceCount, rollGreatPeopleThisRun } from "../../../shared/logic/RebornLogic";
import { getCurrentAge, getMostAdvancedTech, getTechUnlockCost } from "../../../shared/logic/TechLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { safeAdd, type Tile } from "../../../shared/utilities/Helper";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { showModal } from "../ui/GlobalModal";
import { playAgeUp } from "../visuals/Sound";

export function onTileExplored(xy: Tile): void {
   const gs = getGameState();
   const building = gs.tiles.get(xy)?.building;
   if (isNaturalWonder(building?.type)) {
      switch (building?.type) {
         case "GrottaAzzurra": {
            getXyBuildings(gs).forEach((building) => {
               if (isSpecialBuilding(building.type)) {
                  return;
               }
               if (building.status === "completed" && Config.BuildingTier[building.type] === 1) {
                  building.level += 5;
               }
            });
            break;
         }
         case "MountSinai": {
            const age = getCurrentAge(gs);
            if (!age) return;
            const candidates = rollGreatPeopleThisRun(age, gs.city, getGreatPeopleChoiceCount(gs));
            if (candidates) {
               gs.greatPeopleChoices.push(candidates);
            }
            if (gs.greatPeopleChoices.length > 0) {
               playAgeUp();
               showModal(<ChooseGreatPersonModal permanent={false} />);
            }
            break;
         }
         case "MountTai": {
            const tech = getMostAdvancedTech(gs);
            const hq = Tick.current.specialBuildings.get("Headquarter")?.building.resources;
            if (tech && hq) {
               safeAdd(hq, "Science", getTechUnlockCost(tech));
            }
            break;
         }
      }
   }
}
