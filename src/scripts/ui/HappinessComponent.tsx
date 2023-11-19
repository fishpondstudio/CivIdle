import classNames from "classnames";
import { getHappinessIcon, HappinessNames, HAPPINESS_MULTIPLIER } from "../logic/HappinessLogic";
import { Tick, useCurrentTick } from "../logic/TickLogic";
import { formatPercent, jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";

export function HappinessComponent() {
   const happiness = useCurrentTick().happiness;
   if (!happiness) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.Happiness)}</legend>
         <div className="row">
            <div>
               <div className="text-red m-icon">{getHappinessIcon(-50)}</div>
            </div>
            <div className="f1 text-center">
               <div className="text-red m-icon">{getHappinessIcon(-25)}</div>
            </div>
            <div>
               <div className="text-desc m-icon">{getHappinessIcon(0)}</div>
            </div>
            <div className="f1 text-center">
               <div className="text-green m-icon">{getHappinessIcon(25)}</div>
            </div>
            <div>
               <div className="text-green m-icon">{getHappinessIcon(50)}</div>
            </div>
         </div>
         <div className="sep5"></div>
         <ProgressBarComponent progress={happiness.normalized} />
         <div className="row">
            <div className="f1">-50</div>
            <div className="f1 text-center">0</div>
            <div className="f1 text-right">50</div>
         </div>
         <div className="sep5"></div>
         <ul className="tree-view">
            <li>
               <details>
                  <summary className="row">
                     <div className="f1">{t(L.Happiness)}</div>
                     <div className="text-strong">{happiness.value}</div>
                  </summary>
                  <ul>
                     {jsxMapOf(happiness.positive, (type, value) => {
                        return (
                           <li className="row" key={type}>
                              <div className="f1">{HappinessNames[type]()}</div>
                              <div className="text-green">
                                 +<FormatNumber value={value} />
                              </div>
                           </li>
                        );
                     })}
                     {Tick.current.globalMultipliers.happiness.map((m) => {
                        return (
                           <li className="row" key={m.source}>
                              <div className="f1">{m.source}</div>
                              <div className="text-green">
                                 +<FormatNumber value={m.value} />
                              </div>
                           </li>
                        );
                     })}
                     {jsxMapOf(happiness.negative, (type, value) => {
                        return (
                           <li className="row" key={type}>
                              <div className="f1">{HappinessNames[type]()}</div>
                              <div className="text-red">
                                 -<FormatNumber value={value} />
                              </div>
                           </li>
                        );
                     })}
                  </ul>
               </details>
            </li>
            <li>
               <details>
                  <summary className="row">
                     <div className="f1">{t(L.WorkerHappinessPercentage)}</div>
                     <div
                        className={classNames({
                           "text-strong": true,
                           "text-red": happiness.workerPercentage < 1,
                           "text-green": happiness.workerPercentage > 1,
                        })}
                     >
                        {formatPercent(happiness.workerPercentage)}
                     </div>
                  </summary>
                  <ul>
                     <li>{t(L.WorkerPercentagePerHappiness, { value: HAPPINESS_MULTIPLIER })}</li>
                  </ul>
               </details>
            </li>
         </ul>
      </fieldset>
   );
}
