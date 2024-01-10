import { notifyGameStateUpdate } from "../Global";
import { IOCalculation } from "../logic/BuildingLogic";
import { GameFeature, hasFeature } from "../logic/FeatureLogic";
import { getBuildingIO } from "../logic/IntraTickCache";
import { PRIORITY_MAX, PRIORITY_MIN, getProductionPriority, setProductionPriority } from "../logic/Tile";
import { isEmpty } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { ApplyToAllComponent } from "./ApplyToAllComponent";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingProductionPriorityComponent({
   gameState,
   xy,
}: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles[xy].building;
   if (building == null) {
      return null;
   }
   if (
      isEmpty(getBuildingIO(xy, "input", IOCalculation.None, gameState)) &&
      isEmpty(getBuildingIO(xy, "output", IOCalculation.None, gameState))
   ) {
      return null;
   }
   if (!hasFeature(GameFeature.BuildingProductionPriority, gameState)) {
      return null;
   }
   return (
      <fieldset>
         <legend>
            {t(L.ProductionPriority)}: {getProductionPriority(building.priority)}
         </legend>
         <input
            type="range"
            min={PRIORITY_MIN}
            max={PRIORITY_MAX}
            step="1"
            value={getProductionPriority(building.priority)}
            onChange={(e) => {
               building.priority = setProductionPriority(building.priority, parseInt(e.target.value, 10));
               notifyGameStateUpdate();
            }}
         />
         <div className="sep15"></div>
         <div className="text-desc text-small">{t(L.ProductionPriorityDesc)}</div>
         <div className="sep5" />
         <ApplyToAllComponent
            building={building}
            getOptions={(s) => ({ priority: setProductionPriority(s.priority, building.priority) })}
            gameState={gameState}
         />
      </fieldset>
   );
}
