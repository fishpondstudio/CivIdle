import { notifyGameStateUpdate } from "../Global";
import { Tick } from "../logic/TickLogic";
import { PRIORITY_MAX, PRIORITY_MIN } from "../logic/Tile";
import { isEmpty } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";

export function BuildingProductionPriorityComponent({ gameState, xy }: IBuildingComponentProps) {
   const building = gameState.tiles[xy].building;
   if (building == null || (building.type != "Caravansary" && isEmpty(Tick.current.buildings[building.type].output))) {
      return null;
   }
   if (!gameState.features.BuildingProductionPriority) {
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
