import classNames from "classnames";
import { Tech, TechAge } from "../definitions/TechDefinitions";
import { Singleton } from "../Global";
import { getScienceFromWorkers } from "../logic/BuildingLogic";
import { Config } from "../logic/Constants";
import { getCurrentTechAge, getScienceAmount, getUnlockCost, unlockableTechs } from "../logic/TechLogic";
import { Tick } from "../logic/TickLogic";
import { getHandle, useUser } from "../rpc/RPCClient";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { formatPercent, jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playError } from "../visuals/Sound";
import { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProduceComponent } from "./BuildingProduceComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { ChangePlayerHandleModal } from "./ChangePlayerHandleModal";
import { showModal } from "./GlobalModal";
import { GreatPersonPage } from "./GreatPersonPage";
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
   const techAge = getCurrentTechAge(gameState);
   const user = useUser();
   return (
      <div className="window-body">
         <BuildingProduceComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent xy={xy} gameState={gameState} />
         <fieldset>
            <legend>{t(L.Census)}</legend>
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
            <legend>{techAge != null ? TechAge[techAge].name() : "Unknown Age"}</legend>
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
                        <ul className="text-small">
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
                        const unlockCost = getUnlockCost(Tech[k]);
                        return (
                           <tr key={k}>
                              <td>{Tech[k].name()}</td>
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
         <fieldset>
            <legend>{t(L.GreatPeople)}</legend>
            {jsxMapOf(gameState.greatPeople, (person, v) => {
               return (
                  <div key={person} className="row mv5">
                     <div className="f1">{Config.GreatPerson[person].name()}</div>
                     <div className="text-strong">
                        <FormatNumber value={v} />
                     </div>
                  </div>
               );
            })}
            <div className="mv5 text-link" onClick={() => Singleton().routeTo(GreatPersonPage, {})}>
               {t(L.ManageGreatPeople)}
            </div>
         </fieldset>
         <fieldset>
            <legend>{t(L.PlayerHandle)}</legend>
            <div className="row mv5">
               <div className="f1">
                  <b>{getHandle()}</b>
                  <br />
                  <div className="text-desc text-small">{t(L.ChangePlayerHandledDesc)}</div>
               </div>
               <div
                  className={classNames("text-link text-strong", { disabled: !user })}
                  onClick={() => {
                     if (user) {
                        showModal(<ChangePlayerHandleModal />);
                     } else {
                        playError();
                     }
                  }}
               >
                  {t(L.ChangePlayerHandle)}
               </div>
            </div>
         </fieldset>
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
