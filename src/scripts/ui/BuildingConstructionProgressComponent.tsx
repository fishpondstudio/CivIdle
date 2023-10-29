import { getBuilderCapacity, getBuildingCost, getBuildingPercentage } from "../logic/BuildingLogic";
import { Tick } from "../logic/TickLogic";
import { formatPercent, jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";

export function BuildingConstructionProgressComponent({ gameState, xy }: IBuildingComponentProps) {
   const percentage = getBuildingPercentage(xy, gameState);
   const building = gameState.tiles[xy]?.building;
   if (!building) {
      return null;
   }
   const { base, multiplier, total } = getBuilderCapacity(building);
   const resources = getBuildingCost(building);
   return (
      <fieldset>
         <legend>
            {t(L.ConstructionProgress)}: {formatPercent(percentage, 0)}
         </legend>
         <ProgressBarComponent progress={percentage} />
         {jsxMapOf(resources, (res, value) => {
            return (
               <div className="row mv5" key={res}>
                  <div className="f1">{Tick.current.resources[res].name()}</div>
                  <div>
                     <FormatNumber value={building.resources[res] ?? 0} />/
                     <FormatNumber value={value} />
                  </div>
               </div>
            );
         })}
         <div className="separator"></div>
         <ul className="tree-view">
            <details>
               <summary className="row">
                  <div className="f1">{t(L.ConstructionBuilderCapacity)}</div>
                  <div className="text-strong">
                     <FormatNumber value={total} />
                  </div>
               </summary>
               <ul>
                  <li className="row">
                     <div className="f1">{t(L.ConstructionBuilderBaseCapacity)}</div>
                     <div className="text-strong">
                        <FormatNumber value={base} />
                     </div>
                  </li>
                  <li className="row">
                     <div className="f1">{t(L.ConstructionBuilderMultiplier)}</div>
                     <div className="text-strong">
                        x<FormatNumber value={multiplier} />
                     </div>
                  </li>
               </ul>
            </details>
         </ul>
      </fieldset>
   );
}
