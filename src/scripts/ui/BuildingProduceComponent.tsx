import { getBuildingIO } from "../logic/BuildingLogic";
import { isEmpty } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { BuildingIOTreeViewComponent } from "./BuildingIOTreeViewComponent";
import { IBuildingComponentProps } from "./BuildingPage";

export function BuildingProduceComponent({ gameState, xy }: IBuildingComponentProps) {
   const output = getBuildingIO(xy, "output", { capacity: true }, gameState);
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
