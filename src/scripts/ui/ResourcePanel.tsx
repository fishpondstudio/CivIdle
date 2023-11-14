import classNames from "classnames";
import { useGameState } from "../Global";
import { getScienceFromWorkers } from "../logic/BuildingLogic";
import { getHappinessIcon } from "../logic/HappinessLogic";
import { getResourceAmount } from "../logic/ResourceLogic";
import { useCurrentTick } from "../logic/TickLogic";
import { sizeOf } from "../utilities/Helper";
import { FormatNumber } from "./HelperComponents";

export function ResourcePanel() {
   const tick = useCurrentTick();
   const gs = useGameState();
   const {
      happinessPercentage,
      workersAvailable,
      workersAvailableAfterHappiness,
      workersBusy,
      scienceFromBusyWorkers,
      scienceFromIdleWorkers,
      scienceFromWorkers,
      sciencePerBusyWorker,
      sciencePerIdleWorker,
   } = getScienceFromWorkers(gs);
   return (
      <div className="resource-bar window">
         {tick.happiness ? (
            <div className="row">
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
         <div className="row">
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               person
            </div>
            <div className="f1">
               <FormatNumber value={workersAvailableAfterHappiness} />
            </div>
         </div>
         <div className="separator-vertical" />
         <div className="row">
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               directions_walk
            </div>
            <div className="f1">
               <FormatNumber value={workersBusy} />
            </div>
         </div>

         <div className="separator-vertical" />
         <div className="row">
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
         <div className="row">
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               domain_disabled
            </div>
            <div className="f1">
               <FormatNumber value={sizeOf(tick.notProducingReasons)} />
            </div>
         </div>
      </div>
   );
}
