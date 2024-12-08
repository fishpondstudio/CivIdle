import Tippy from "@tippyjs/react";
import { IOCalculation, shouldAlwaysShowBuildingOptions } from "../../../shared/logic/BuildingLogic";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getBuildingIO } from "../../../shared/logic/IntraTickCache";
import { PRIORITY_MAX, PRIORITY_MIN } from "../../../shared/logic/Tile";
import { isEmpty, safeParseInt } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { ApplyToAllComponent } from "./ApplyToAllComponent";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingProductionPriorityComponent({
   gameState,
   xy,
}: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (building == null) {
      return null;
   }
   if (!hasFeature(GameFeature.BuildingProductionPriority, gameState)) {
      return null;
   }
   if (
      isEmpty(getBuildingIO(xy, "input", IOCalculation.None, gameState)) &&
      isEmpty(getBuildingIO(xy, "output", IOCalculation.None, gameState)) &&
      !shouldAlwaysShowBuildingOptions(building)
   ) {
      return null;
   }
   return (
      <fieldset>
         <legend>
            {t(L.ProductionPriority)}: {building.productionPriority}
         </legend>
         <Tippy content={t(L.ProductionPriorityDescV4)}>
            <input
               type="range"
               min={PRIORITY_MIN}
               max={PRIORITY_MAX}
               step="1"
               value={building.productionPriority}
               onChange={(e) => {
                  building.productionPriority = safeParseInt(e.target.value, PRIORITY_MIN);
                  notifyGameStateUpdate();
               }}
            />
         </Tippy>
         <div className="sep15"></div>
         <ApplyToAllComponent
            xy={xy}
            getOptions={(s) => ({ productionPriority: building.productionPriority })}
            gameState={gameState}
         />
      </fieldset>
   );
}
