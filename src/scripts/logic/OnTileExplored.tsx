import { isNaturalWonder, isSpecialBuilding } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGameState } from "../../../shared/logic/GameStateLogic";
import { getXyBuildings } from "../../../shared/logic/IntraTickCache";
import { rollGreatPeopleThisRun } from "../../../shared/logic/RebornLogic";
import { getCurrentTechAge } from "../../../shared/logic/TechLogic";
import { type Tile } from "../../../shared/utilities/Helper";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { showModal } from "../ui/GlobalModal";
import { playLevelUp } from "../visuals/Sound";

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
            const age = getCurrentTechAge(gs);
            if (!age) return;
            const candidates = rollGreatPeopleThisRun(age);
            if (candidates) {
               gs.greatPeopleChoices.push(candidates);
            }
            if (gs.greatPeopleChoices.length > 0) {
               playLevelUp();
               showModal(<ChooseGreatPersonModal permanent={false} />);
            }
            break;
         }
      }
   }
}
