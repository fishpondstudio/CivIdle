import { getBuildingIO } from "../logic/BuildingLogic";
import { Config } from "../logic/Constants";
import { isEmpty, jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";
import { MultiplierTreeViewComponent } from "./MultiplierTreeViewComponent";

export function BuildingConsumeComponent({ gameState, xy }: IBuildingComponentProps) {
   const input = getBuildingIO(xy, "input", { capacity: true }, gameState);
   if (isEmpty(input)) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.Consume)}</legend>
         {jsxMapOf(input, (k, v) => {
            return (
               <div key={k} className="row mv5">
                  <div className="f1">{Config.Resource[k].name()}</div>
                  <div className="text-strong">
                     <FormatNumber value={v} />
                  </div>
               </div>
            );
         })}
         <div className="sep5" />
         <MultiplierTreeViewComponent gameState={gameState} xy={xy} type="input" />
      </fieldset>
   );
}
