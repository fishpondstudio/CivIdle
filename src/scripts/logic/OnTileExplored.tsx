import { isNaturalWonder, isSpecialBuilding } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGameState } from "../../../shared/logic/GameStateLogic";
import { getGrid, getXyBuildings } from "../../../shared/logic/IntraTickCache";
import { getGreatPeopleChoiceCount, rollGreatPeopleThisRun } from "../../../shared/logic/RebirthLogic";
import {
   addDeposit,
   getCurrentAge,
   getMostAdvancedTech,
   getTechUnlockCost,
} from "../../../shared/logic/TechLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { isEmpty, pointToTile, safeAdd, tileToPoint, type Tile } from "../../../shared/utilities/Helper";
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
               gs.greatPeopleChoicesV2.push(candidates);
            }
            if (gs.greatPeopleChoicesV2.length > 0) {
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
         case "EuphratesRiver": {
            for (const point of getGrid(gs).getNeighbors(tileToPoint(xy))) {
               const tileXy = pointToTile(point);
               const tile = gs.tiles.get(tileXy);
               if (tile && isEmpty(tile?.deposit)) {
                  addDeposit(tileXy, "Water", true, gs);
               }
            }
            break;
         }
      }
   }
}
