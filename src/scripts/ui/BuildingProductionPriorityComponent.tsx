import { notifyGameStateUpdate } from "../Global";
import { IOCalculation, applyToAllBuildings } from "../logic/BuildingLogic";
import { getBuildingIO } from "../logic/IntraTickCache";
import { Tick } from "../logic/TickLogic";
import { PRIORITY_MAX, PRIORITY_MIN } from "../logic/Tile";
import { isEmpty } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { IBuildingComponentProps } from "./BuildingPage";

export function BuildingProductionPriorityComponent({
   gameState,
   xy,
}: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles[xy].building;
   if (building == null || isEmpty(getBuildingIO(xy, "output", IOCalculation.None, gameState))) {
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
         <div className="text-desc text-small">{t(L.ProductionPriorityDesc)}</div>
         <div className="sep5" />
         <div
            className="text-link text-small"
            onClick={() => {
               playClick();
               applyToAllBuildings(building.type, { priority: building.priority }, gameState);
            }}
         >
            {t(L.ApplyToAll, { building: Tick.current.buildings[building.type].name() })}
         </div>
      </fieldset>
   );
}
