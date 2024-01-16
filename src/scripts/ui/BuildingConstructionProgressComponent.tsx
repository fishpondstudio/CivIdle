import {
   getBuilderCapacity,
   getBuildingPercentage,
   getMultipliersFor,
   isWorldWonder,
} from "../logic/BuildingLogic";
import { Config } from "../logic/Config";
import { Tick } from "../logic/TickLogic";
import { formatHMS, formatPercent, jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";
import { WarningComponent } from "./WarningComponent";

export function BuildingConstructionProgressComponent({
   gameState,
   xy,
}: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const { base, multiplier, total } = getBuilderCapacity(building, xy, gameState);
   const { cost, percent, secondsLeft } = getBuildingPercentage(xy, gameState);
   return (
      <fieldset>
         <div className="row">
            <div className="f1">{t(L.ConstructionProgress)}</div>
            <div>{formatPercent(percent, 0)}</div>
         </div>
         <div className="sep5"></div>
         <div className="row">
            <div className="f1">{t(L.EstimatedTimeLeft)}</div>
            <div>{formatHMS(secondsLeft * 1000)}</div>
         </div>
         <div className="sep5"></div>

         <ProgressBarComponent progress={percent} />
         {jsxMapOf(cost, (res, value) => {
            return (
               <div className="row mv5" key={res}>
                  <div className="f1">{Config.Resource[res].name()}</div>
                  <div>
                     <FormatNumber value={building.resources[res] ?? 0} />/
                     <FormatNumber value={value} />
                  </div>
               </div>
            );
         })}
         <div className="separator"></div>
         {isWorldWonder(building.type) ? (
            <>
               <WarningComponent icon="info">{t(L.WonderBuilderCapacityDesc)}</WarningComponent>
               <div className="sep10"></div>
            </>
         ) : null}
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
                        x
                        <FormatNumber value={multiplier} />
                     </div>
                  </li>
                  <ul>
                     {Tick.current.globalMultipliers.builderCapacity.map((value) => {
                        return (
                           <li key={value.source} className="text-small row">
                              <div className="f1">{value.source}</div>
                              <div>{value.value}</div>
                           </li>
                        );
                     })}
                     {getMultipliersFor(xy, gameState).map((value) => {
                        if (!value.worker) {
                           return null;
                        }
                        return (
                           <li key={value.source} className="text-small row">
                              <div className="f1">{value.source}</div>
                              <div>{value.worker}</div>
                           </li>
                        );
                     })}
                  </ul>
               </ul>
            </details>
         </ul>
      </fieldset>
   );
}
