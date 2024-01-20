import { IOCalculation } from "../../../shared/logic/BuildingLogic";
import { getBuildingIO } from "../../../shared/logic/IntraTickCache";
import { isEmpty } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingIOTreeViewComponent } from "./BuildingIOTreeViewComponent";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingConsumeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const input = getBuildingIO(xy, "input", IOCalculation.Capacity, gameState);
   if (isEmpty(input)) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.Consume)}</legend>
         <BuildingIOTreeViewComponent gameState={gameState} xy={xy} type="input" />
      </fieldset>
   );
}
