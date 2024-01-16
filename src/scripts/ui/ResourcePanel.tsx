import classNames from "classnames";
import { useGameState } from "../Global";
import { getScienceFromWorkers } from "../logic/BuildingLogic";
import { GameFeature, hasFeature } from "../logic/FeatureLogic";
import { getHappinessIcon } from "../logic/HappinessLogic";
import { getResourceAmount } from "../logic/ResourceLogic";
import { useCurrentTick } from "../logic/TickLogic";
import { L, t } from "../utilities/i18n";
import { FormatNumber } from "./HelperComponents";

export function ResourcePanel(): React.ReactNode {
   const tick = useCurrentTick();
   const gs = useGameState();
   const { workersAvailableAfterHappiness, workersBusy } = getScienceFromWorkers(gs);
   return (
      <div className="resource-bar window">
         {tick.happiness ? (
            <div className="row" aria-label={t(L.Happiness)} data-balloon-pos="down" data-balloon-text="left">
               <div
                  className={classNames({
                     "m-icon": true,
                     "text-red": tick.happiness.value < 0,
                     "text-green": tick.happiness.value > 0,
                  })}
               >
                  {getHappinessIcon(tick.happiness.value)}
               </div>
               <div className="f1">{tick.happiness.value}</div>
            </div>
         ) : null}
         <div className="separator-vertical" />
         <div
            className="row"
            style={{ width: "150px" }}
            aria-label={`${t(L.WorkersBusy)} / ${t(L.WorkersAvailable)}`}
            data-balloon-pos="down"
            data-balloon-text="left"
         >
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               person
            </div>
            <div className="f1">
               <FormatNumber value={workersBusy} /> / <FormatNumber value={workersAvailableAfterHappiness} />
            </div>
         </div>
         <div className="separator-vertical" />
         {hasFeature(GameFeature.Electricity, gs) ? (
            <>
               <div
                  className="row"
                  style={{ width: "150px" }}
                  aria-label={`${t(L.PowerUsed)}/${t(L.PowerAvailable)}`}
                  data-balloon-pos="down"
                  data-balloon-text="left"
               >
                  <div
                     className={classNames({
                        "m-icon": true,
                        "text-red": (tick.workersAvailable.Power ?? 0) < (tick.workersUsed.Power ?? 0),
                        "text-green": (tick.workersAvailable.Power ?? 0) > (tick.workersUsed.Power ?? 0),
                     })}
                  >
                     bolt
                  </div>
                  <div className="f1">
                     <FormatNumber value={tick.workersUsed.Power ?? 0} />
                     W
                     {" / "}
                     <FormatNumber value={tick.workersAvailable.Power ?? 0} />
                     W
                  </div>
               </div>
               <div className="separator-vertical" />
            </>
         ) : null}
         <div className="row" aria-label={t(L.Science)} data-balloon-pos="down" data-balloon-text="left">
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               science
            </div>
            <div className="f1">
               <FormatNumber value={getResourceAmount("Science", gs)} />
            </div>
         </div>
         <div className="separator-vertical" />
         <div
            className="row"
            aria-label={t(L.NotProducingBuildings)}
            data-balloon-pos="down"
            data-balloon-text="left"
         >
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               domain_disabled
            </div>
            <div className="f1">
               <FormatNumber value={tick.notProducingReasons.size} />
            </div>
         </div>
         <div className="separator-vertical" />
         <div
            className="row"
            aria-label={t(L.TotalEmpireValue)}
            data-balloon-pos="down"
            data-balloon-text="left"
         >
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               account_balance
            </div>
            <div className="f1">
               <FormatNumber value={tick.totalValue} />
            </div>
         </div>
      </div>
   );
}
