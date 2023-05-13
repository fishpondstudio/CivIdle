import { getBuildingIO } from "../logic/BuildingLogic";
import { isEmpty } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { BuildingIOTreeViewComponent } from "./BuildingIOTreeViewComponent";
import { IBuildingComponentProps } from "./BuildingPage";

export function BuildingConsumeComponent({ gameState, xy }: IBuildingComponentProps) {
   const input = getBuildingIO(xy, "input", { capacity: true }, gameState);
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
