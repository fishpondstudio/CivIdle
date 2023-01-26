import { getBuildingIO } from "../logic/BuildingLogic";
import { Config } from "../logic/Constants";
import { isEmpty, jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";
import { MultiplierTreeViewComponent } from "./MultiplierTreeViewComponent";

export function BuildingProduceComponent({ gameState, xy }: IBuildingComponentProps) {
   const output = getBuildingIO(xy, "output", { capacity: true }, gameState);
   if (isEmpty(output)) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.Produce)}</legend>
         {jsxMapOf(
            output,
            (k, v) => {
               return (
                  <div key={k} className="row mv5">
                     <div className="f1">{Config.Resource[k].name()}</div>
                     <div className="text-strong">
                        <FormatNumber value={v} />
                     </div>
                  </div>
               );
            },
            () => (
               <div className="mv5">{t(L.ConsumeProduceNothing)}</div>
            )
         )}
         <div className="sep5"></div>
         <MultiplierTreeViewComponent gameState={gameState} xy={xy} type="output" />
      </fieldset>
   );
}
