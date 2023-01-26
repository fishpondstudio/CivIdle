import { Singleton } from "../Global";
import { getScienceFromWorkers } from "../logic/BuildingLogic";
import { getCurrentTechAge, getScienceAmount, getTechTree, getUnlockCost, unlockableTechs } from "../logic/TechLogic";
import { Tick } from "../logic/TickLogic";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { formatPercent } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProduceComponent } from "./BuildingProduceComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { FormatNumber } from "./HelperComponents";

export function HeadquarterBuildingBody({ gameState, xy }: IBuildingComponentProps) {
   const {
      workersAvailable,
      workersBusy,
      scienceFromBusyWorkers,
      scienceFromIdleWorkers,
      scienceFromWorkers,
      sciencePerBusyWorker,
      sciencePerIdleWorker,
   } = getScienceFromWorkers(gameState);
   const scienceAmount = getScienceAmount();
   const config = getTechTree(gameState);
   const techAge = getCurrentTechAge(gameState);
   return (
      <div className="window-body">
         <BuildingProduceComponent gameState={gameState} xy={xy} />
         <fieldset>
            <legend>Census</legend>
            <div className="row mv5">
               <div className="f1">{t(L.WorkersAvailable)}</div>
               <div className="text-strong">
                  <FormatNumber value={workersAvailable} />
               </div>
            </div>
            <div className="row mv5">
               <div className="f1">{t(L.WorkersBusy)}</div>
               <div className="text-strong">
                  <FormatNumber value={workersBusy} />
               </div>
            </div>
         </fieldset>
         <fieldset>
            <legend>{techAge != null ? config.ages[techAge].name() : "Unknown Age"}</legend>
            <div className="row mv5">
               <div className="f1">{t(L.Science)}</div>
               <div className="text-strong">
                  <FormatNumber value={scienceAmount} />
               </div>
            </div>
            <div className="sep5" />
            <ul className="tree-view">
               <li className="row">
                  <div className="f1">{t(L.WorkerScienceProduction)}</div>
                  <div className="text-strong">
                     <FormatNumber value={scienceFromWorkers} />
                  </div>
               </li>
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
                           <div>{sciencePerIdleWorker}</div>
                        </li>
                        <ul>
                           {Tick.current.globalMultipliers.sciencePerIdleWorker.map((m) => (
                              <li key={m.source} className="row">
                                 <div className="f1">{m.source}</div>
                                 <div>{m.value}</div>
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
                        <ul>
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
            </ul>
            <div className="sep10" />
            <div className="separator has-title">
               <div>{t(L.UnlockableResearch)}</div>
            </div>
            <div className="sep5" />
            <div className="table-view">
               <table>
                  <thead>
                     <tr>
                        <th>{t(L.Name)}</th>
                        <th className="right">{t(L.Science)}</th>
                        <th className="right">{t(L.UnlockTechProgress)}</th>
                        <th />
                     </tr>
                  </thead>
                  <tbody>
                     {unlockableTechs(gameState).map((k) => {
                        const unlockCost = getUnlockCost(config.definitions[k]);
                        return (
                           <tr key={k}>
                              <td>{config.definitions[k].name()}</td>
                              <td className="right">
                                 <FormatNumber value={unlockCost} />
                              </td>
                              <td className="right" style={{ width: "65px" }}>
                                 {scienceAmount < unlockCost ? (
                                    formatPercent(scienceAmount / unlockCost, 0)
                                 ) : (
                                    <div className="m-icon text-green small">check_circle</div>
                                 )}
                              </td>
                              <td className="right" style={{ width: "50px" }}>
                                 <span
                                    className="text-link"
                                    onClick={() => {
                                       Singleton().sceneManager.loadScene(TechTreeScene)?.selectNode(k, "jump");
                                    }}
                                 >
                                    {t(L.View)}
                                 </span>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </fieldset>
         <BuildingStorageComponent xy={xy} gameState={gameState} />
         {/* {jsxMapOf(Config.GreatPerson, (k) => {
                return (
                    <img
                        key={k}
                        src={greatPersonImage(k, Singleton().sceneManager.getContext())}
                        style={{ width: "31%", margin: "1%" }}
                    />
                );
            })} */}
      </div>
   );
}
