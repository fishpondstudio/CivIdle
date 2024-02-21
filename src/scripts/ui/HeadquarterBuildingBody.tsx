import { getScienceFromWorkers } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getXyBuildings } from "../../../shared/logic/IntraTickCache";
import { getGreatPeopleAtReborn } from "../../../shared/logic/RebornLogic";
import {
   getCurrentTechAge,
   getScienceAmount,
   getUnlockCost,
   unlockableTechs,
} from "../../../shared/logic/TechLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import {
   SECOND,
   filterOf,
   formatHMS,
   formatPercent,
   keysOf,
   numberToRoman,
   reduceOf,
   sizeOf,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { Singleton } from "../utilities/Singleton";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProduceComponent } from "./BuildingProduceComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { showModal } from "./GlobalModal";
import { GreatPersonPage } from "./GreatPersonPage";
import { HappinessComponent } from "./HappinessComponent";
import { FormatNumber } from "./HelperComponents";
import { PlayerHandleComponent } from "./PlayerHandleComponent";
import { RebornModal } from "./RebornModal";
import { SteamAchievementPage } from "./SteamAchievementPage";
import { TextWithHelp } from "./TextWithHelpComponent";
import { WonderPage } from "./WonderPage";

export function HeadquarterBuildingBody({
   gameState,
   xy,
   expandHappiness,
}: IBuildingComponentProps & { expandHappiness?: boolean }): React.ReactNode {
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
   } = getScienceFromWorkers(gameState);
   const scienceAmount = getScienceAmount();
   const techAge = getCurrentTechAge(gameState);
   const options = useGameOptions();
   // const patch = PatchNotes[0];
   return (
      <div className="window-body">
         <PlayerHandleComponent />
         <BuildingProduceComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent xy={xy} gameState={gameState} />
         <HappinessComponent open={expandHappiness ?? false} />
         <fieldset>
            <legend>{t(L.Census)}</legend>
            <ul className="tree-view">
               <li>
                  <details>
                     <summary className="row">
                        <div className="f1">{t(L.WorkersAvailable)}</div>
                        <div className="text-strong">
                           <FormatNumber value={workersAvailableAfterHappiness} />
                        </div>
                     </summary>
                     <ul>
                        <li className="row">
                           <div className="f1">{t(L.WorkersAvailable)}</div>
                           <div className="text-strong">
                              <FormatNumber value={workersAvailable} />
                           </div>
                        </li>
                        <li className="row">
                           <div className="f1">{t(L.WorkerHappinessPercentage)}</div>
                           <div className="text-strong">{formatPercent(happinessPercentage)}</div>
                        </li>
                     </ul>
                  </details>
               </li>
               <li>
                  <details>
                     <summary className="row">
                        <div className="f1">{t(L.WorkersBusy)}</div>
                        <div className="text-strong">
                           <FormatNumber value={workersBusy} />
                        </div>
                     </summary>
                  </details>
               </li>
               <li>
                  <details>
                     <summary className="row">
                        <div className="f1">{t(L.ConstructionBuilderMultiplierFull)}</div>
                        <div className="text-strong">
                           <FormatNumber
                              value={Tick.current.globalMultipliers.builderCapacity.reduce(
                                 (prev, curr) => prev + curr.value,
                                 0,
                              )}
                           />
                        </div>
                     </summary>
                     <ul>
                        {Tick.current.globalMultipliers.builderCapacity.map((value) => {
                           return (
                              <li key={value.source} className="row">
                                 <div className="f1">{value.source}</div>
                                 <div>{value.value}</div>
                              </li>
                           );
                        })}
                     </ul>
                  </details>
               </li>
               <li>
                  <details>
                     <summary className="row">
                        <div className="f1">{t(L.TransportCapacityMultiplier)}</div>
                        <div className="text-strong">
                           <FormatNumber
                              value={Tick.current.globalMultipliers.transportCapacity.reduce(
                                 (prev, curr) => prev + curr.value,
                                 0,
                              )}
                           />
                        </div>
                     </summary>
                     <ul>
                        {Tick.current.globalMultipliers.transportCapacity.map((value) => {
                           return (
                              <li key={value.source} className="row">
                                 <div className="f1">{value.source}</div>
                                 <div>{value.value}</div>
                              </li>
                           );
                        })}
                     </ul>
                  </details>
               </li>
            </ul>
         </fieldset>
         <fieldset>
            <legend>{techAge != null ? Config.TechAge[techAge].name() : "Unknown Age"}</legend>
            <div className="row">
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
                        const unlockCost = getUnlockCost(k);
                        return (
                           <tr key={k}>
                              <td>{Config.Tech[k].name()}</td>
                              <td className="right">
                                 <FormatNumber value={unlockCost ?? 0} />
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
                                       Singleton()
                                          .sceneManager.loadScene(TechTreeScene)
                                          ?.selectNode(k, "jump", true);
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
            <ul className="tree-view">
               <li>
                  <details>
                     <summary className="row">
                        <div className="f1">{t(L.GreatPeopleThisRun)}</div>
                        <div className="text-strong">{sizeOf(gameState.greatPeople)}</div>
                     </summary>
                     <ul>
                        {keysOf(gameState.greatPeople)
                           .sort(
                              (a, b) =>
                                 Config.TechAge[Config.GreatPerson[a].age].idx -
                                 Config.TechAge[Config.GreatPerson[b].age].idx,
                           )
                           .map((person) => {
                              const gp = Config.GreatPerson[person];
                              const v = gameState.greatPeople[person]!;
                              return (
                                 <li key={person} className="row text-small">
                                    <div className="f1">
                                       {gp.name()}
                                       <span className="text-desc ml5">
                                          ({Config.TechAge[gp.age].name()})
                                       </span>
                                    </div>
                                    <div className="text-strong">
                                       <TextWithHelp content={gp.desc(gp, v)}>
                                          <FormatNumber value={v} />
                                       </TextWithHelp>
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
                        <div className="f1">{t(L.PermanentGreatPeople)}</div>
                        <div className="text-strong">
                           {sizeOf(filterOf(options.greatPeople, (k, v) => v.level > 0))}
                        </div>
                     </summary>
                     <ul>
                        {keysOf(options.greatPeople)
                           .sort(
                              (a, b) =>
                                 Config.TechAge[Config.GreatPerson[a].age].idx -
                                 Config.TechAge[Config.GreatPerson[b].age].idx,
                           )
                           .map((person) => {
                              const gp = Config.GreatPerson[person];
                              const v = options.greatPeople[person]!;
                              return (
                                 <li key={person} className="row text-small">
                                    <div className="f1">
                                       {gp.name()}
                                       <span className="text-desc ml5">
                                          ({Config.TechAge[gp.age].name()})
                                       </span>
                                    </div>
                                    <div className="text-strong">
                                       <TextWithHelp content={gp.desc(gp, v.level)}>
                                          {numberToRoman(v.level)}
                                       </TextWithHelp>
                                    </div>
                                 </li>
                              );
                           })}
                     </ul>
                  </details>
               </li>
            </ul>
            <button onClick={() => Singleton().routeTo(GreatPersonPage, {})} className="jcc w100 row mt10">
               <div className="m-icon">person_celebrate</div>
               <div className="f1 text-strong">{t(L.ManageGreatPeople)}</div>
            </button>
         </fieldset>
         <fieldset>
            <legend>{t(L.Reborn)}</legend>
            <ul className="tree-view">
               <li className="row">
                  <div className="f1">{t(L.GreatPeopleThisRun)}</div>
                  <div className="text-strong">
                     {reduceOf(
                        gameState.greatPeople,
                        (prev, k, v) => {
                           return prev + v;
                        },
                        0,
                     )}
                  </div>
               </li>
               <li className="row">
                  <div className="f1">{t(L.TotalEmpireValue)}</div>
                  <div className="text-strong">
                     <FormatNumber value={Tick.current.totalValue} />
                  </div>
               </li>
               <ul>
                  <li className="row text-small">
                     <div className="f1">{t(L.TotalTimeThisRun)}</div>
                     <div>{formatHMS(gameState.tick * SECOND)}</div>
                  </li>
                  <li className="row text-small">
                     <div className="f1">{t(L.TotalEmpireValuePerCycle)}</div>
                     <FormatNumber value={Tick.current.totalValue / gameState.tick} />
                  </li>
               </ul>
               <li className="row">
                  <div className="f1">{t(L.ExtraGreatPeopleAtReborn)}</div>
                  <div className="text-strong">{getGreatPeopleAtReborn()}</div>
               </li>
            </ul>
            <div className="sep10"></div>
            <button className="row w100 jcc" onClick={() => showModal(<RebornModal />)}>
               <div className="m-icon small">stroller</div>
               <div className="f1 text-strong">{t(L.Reborn)}</div>
            </button>
         </fieldset>
         <fieldset>
            <legend>{t(L.Wonder)}</legend>
            {Array.from(getXyBuildings(gameState).entries())
               .flatMap(([_, building]) => {
                  const def = Config.Building[building.type];
                  if (def.max !== 1 || !def.construction) {
                     return [];
                  }
                  return [def.name()];
               })
               .join(", ")}
            <div className="mv5 text-link text-strong" onClick={() => Singleton().routeTo(WonderPage, {})}>
               {t(L.ManageWonders)}
            </div>
         </fieldset>
         <fieldset>
            <legend>{t(L.SteamAchievement)}</legend>
            <div
               className="text-link text-strong"
               onClick={() => Singleton().routeTo(SteamAchievementPage, {})}
            >
               {t(L.SteamAchievementDetails)}
            </div>
         </fieldset>
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
