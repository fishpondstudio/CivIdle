import { IOCalculation } from "../../../shared/logic/BuildingLogic";
import { getBuildingIO } from "../../../shared/logic/IntraTickCache";
import { isEmpty } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingIOTreeViewComponent } from "./BuildingIOTreeViewComponent";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingProduceComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const output = getBuildingIO(xy, "output", IOCalculation.Capacity, gameState);
   if (isEmpty(output)) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.Produce)}</legend>
         <BuildingIOTreeViewComponent gameState={gameState} xy={xy} type="output" />
      </fieldset>
   );
}
