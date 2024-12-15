import { getScienceFromWorkers } from "../../../shared/logic/BuildingLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { L, t } from "../../../shared/utilities/i18n";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";

export function WorkerScienceComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const {
      happinessPercentage,
      workersBeforeHappiness,
      workersAfterHappiness,
      workersBusy,
      scienceFromBusyWorkers,
      scienceFromIdleWorkers,
      scienceFromWorkers,
      sciencePerBusyWorker,
      sciencePerIdleWorker,
   } = getScienceFromWorkers(gameState);
   return (
      <>
         <li>
            <details>
               <summary className="row">
                  <div className="f1">{t(L.ScienceFromIdleWorkers)}</div>
                  <div className="text-strong">
                     <FormatNumber value={scienceFromIdleWorkers} />
                  </div>
               </summary>
               <ul>
                  <li className="row">
                     <div className="f1">{t(L.SciencePerIdleWorker)}</div>
                     <div>
                        <FormatNumber value={sciencePerIdleWorker} />
                     </div>
                  </li>
                  <ul className="text-small">
                     {Tick.current.globalMultipliers.sciencePerIdleWorker.map((m) => (
                        <li key={m.source} className="row">
                           <div className="f1">{m.source}</div>
                           <div>
                              <FormatNumber value={m.value} />
                           </div>
                        </li>
                     ))}
                  </ul>
               </ul>
            </details>
         </li>
         <li>
            <details>
               <summary className="row">
                  <div className="f1">{t(L.ScienceFromBusyWorkers)}</div>
                  <div className="text-strong">
                     <FormatNumber value={scienceFromBusyWorkers} />
                  </div>
               </summary>
               <ul>
                  <li className="row">
                     <div className="f1">{t(L.SciencePerBusyWorker)}</div>
                     <div>{sciencePerBusyWorker}</div>
                  </li>
                  <ul className="text-small">
                     {Tick.current.globalMultipliers.sciencePerBusyWorker.map((m) => (
                        <li key={m.source} className="row">
                           <div className="f1">{m.source}</div>
                           <div>
                              <FormatNumber value={m.value} />
                           </div>
                        </li>
                     ))}
                  </ul>
               </ul>
            </details>
         </li>
      </>
   );
}
