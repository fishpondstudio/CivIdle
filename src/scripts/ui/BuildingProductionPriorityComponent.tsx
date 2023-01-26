import { notifyGameStateUpdate } from "../Global";
import { Tick } from "../logic/TickLogic";
import { PRIORITY_MAX, PRIORITY_MIN } from "../logic/Tile";
import { isEmpty } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";

export function BuildingProductionPriorityComponent({ gameState, xy }: IBuildingComponentProps) {
   const building = gameState.tiles[xy].building;
   if (building == null || isEmpty(Tick.current.buildings[building.type].output)) {
      return null;
   }
   if (!gameState.unlocked.Counting && !gameState.unlocked.Dictator) {
      return null;
   }
   return (
      <fieldset>
         <legend>
            {t(L.ProductionPriority)}: {building.priority}
         </legend>

         <input
            type="range"
            min={PRIORITY_MIN}
            max={PRIORITY_MAX}
            step="1"
            value={building.priority}
            onChange={(e) => {
               building.priority = parseInt(e.target.value, 10);
               notifyGameStateUpdate();
            }}
         />
         <div className="sep15"></div>
         <div className="text-desc">{t(L.ProductionPriorityDesc)}</div>
      </fieldset>
   );
}
