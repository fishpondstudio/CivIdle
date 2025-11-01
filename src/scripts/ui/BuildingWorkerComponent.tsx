import Tippy from "@tippyjs/react";
import classNames from "classnames";
import {
   IOFlags,
   applyToAllBuildings,
   getBuildingName,
   getMultipliersFor,
   getResourceName,
   getWorkersFor,
   isSpecialBuilding,
   shouldAlwaysShowBuildingOptions,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import {
   getBuildingIO,
   getFuelByTarget,
   getStorageFullBuildings,
} from "../../../shared/logic/IntraTickCache";
import { NotProducingReason, Tick } from "../../../shared/logic/TickLogic";
import { Transports } from "../../../shared/logic/Transports";
import { formatNumber, formatPercent, isEmpty } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import warning from "../../images/warning.png";
import { useShortcut } from "../utilities/Hook";
import { playSuccess } from "../visuals/Sound";
import { ApplyToAllComponent } from "./ApplyToAllComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";
import { TextWithHelp } from "./TextWithHelpComponent";

export function BuildingWorkerComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const workersRequired = getWorkersFor(xy, gameState);
   const building = gameState.tiles.get(xy)?.building;
   if (building == null) {
      return null;
   }
   const input = getBuildingIO(xy, "input", IOFlags.None, gameState);
   const output = getBuildingIO(xy, "output", IOFlags.None, gameState);
   if (isEmpty(input) && isEmpty(output) && !shouldAlwaysShowBuildingOptions(building)) {
      return null;
   }
   const showWarning = Tick.current.notProducingReasons.get(xy) === NotProducingReason.NotEnoughWorkers;
   const toggleBuilding = () => {
      building.capacity = building.capacity > 0 ? 0 : 1;
      notifyGameStateUpdate();
   };
   const toggleBuildingSetAllSimilar = () => {
      building.capacity = building.capacity > 0 ? 0 : 1;
      applyToAllBuildings(building.type, () => ({ capacity: building.capacity }), gameState);
      notifyGameStateUpdate();
   };
   useShortcut("BuildingPageToggleBuilding", toggleBuilding, [xy]);
   useShortcut("BuildingPageToggleBuildingSetAllSimilar", toggleBuildingSetAllSimilar, [xy]);
   return (
      <fieldset>
         <legend>{t(L.Workers)}</legend>
         <ul className="tree-view">
            {isEmpty(input) ? null : (
               <>
                  <li>
                     <details>
                        <summary className="row">
                           <div className="f1">{t(L.WorkersRequiredInput)}</div>
                           <div className="text-strong">{getFuelByTarget().get(xy) ?? 0}</div>
                        </summary>
                        <ul>
                           {Transports.map((v) => {
                              if (v.toXy !== xy) return null;
                              return (
                                 <li className="row" key={v.id}>
                                    <div className="f1">
                                       {t(L.ResourceFromBuilding, {
                                          resource: `${formatNumber(v.amount)} ${getResourceName(
                                             v.resource,
                                          )}`,
                                          building: getBuildingName(v.fromXy, gameState),
                                       })}{" "}
                                       ({v.ticksSpent}/{v.ticksRequired})
                                    </div>
                                    <div>{v.fuelCurrentTick}</div>
                                 </li>
                              );
                           })}
                        </ul>
                     </details>
                  </li>
                  <li>
                     <details>
                        <summary className="row">
                           <div className="f1">{t(L.WorkersRequiredForTransportationMultiplier)}</div>
                           <div className="text-strong">
                              {formatNumber(
                                 workersRequired.multiplier +
                                    Tick.current.globalMultipliers.transportCapacity.reduce(
                                       (prev, curr) => prev + curr.value,
                                       0,
                                    ),
                              )}
                           </div>
                        </summary>
                        <ul>
                           <li className="row">
                              <div className="f1">{t(L.BaseMultiplier)}</div>
                              <div>1</div>
                           </li>
                           {getMultipliersFor(xy, false, gameState).map((m, i) => {
                              if (!m.worker) {
                                 return null;
                              }
                              return (
                                 <li key={i} className="row">
                                    <div className="f1">{m.source}</div>
                                    <div>{formatNumber(m.worker)}</div>
                                 </li>
                              );
                           })}
                           <li className="row">
                              <div className="f1">{t(L.TransportCapacityMultiplier)}</div>
                              <div>
                                 {formatNumber(
                                    Tick.current.globalMultipliers.transportCapacity.reduce(
                                       (prev, curr) => prev + curr.value,
                                       0,
                                    ),
                                 )}
                              </div>
                           </li>
                           <ul className="text-small">
                              {Tick.current.globalMultipliers.transportCapacity.map((m, i) => {
                                 return (
                                    <li key={i} className="row">
                                       <div className="f1">{m.source}</div>
                                       <div>{formatNumber(m.value)}</div>
                                    </li>
                                 );
                              })}
                           </ul>
                        </ul>
                     </details>
                  </li>
               </>
            )}
            {isEmpty(output) ? null : (
               <>
                  <li>
                     <details>
                        <summary className="row">
                           {showWarning ? <img src={warning} style={{ margin: "0 2px 0 0" }} /> : null}
                           <div
                              className={classNames({
                                 f1: true,
                                 "production-warning": showWarning,
                              })}
                           >
                              {t(L.WorkersRequiredOutput)}
                           </div>
                           <div className="text-strong">
                              <FormatNumber value={Tick.current.workersAssignment.get(xy) ?? 0} />
                           </div>
                        </summary>
                        <ul>
                           <li className="row">
                              <div className="f1">{t(L.WorkersRequiredBeforeMultiplier)}</div>
                              <div>
                                 <TextWithHelp content={t(L.RequiredWorkersTooltipV2)}>
                                    <FormatNumber value={workersRequired.rawOutput} />
                                 </TextWithHelp>
                              </div>
                           </li>
                           <li className="row">
                              <div className="f1">{t(L.WorkersRequiredAfterMultiplier)}</div>
                              <div>
                                 <FormatNumber value={workersRequired.output} />
                              </div>
                           </li>
                        </ul>
                     </details>
                  </li>
                  <li>
                     <details>
                        <summary className="row">
                           <div className="f1">{t(L.WorkersRequiredForProductionMultiplier)}</div>
                           <div className="text-strong">{workersRequired.multiplier}</div>
                        </summary>
                        <ul>
                           <li className="row">
                              <div className="f1">{t(L.BaseMultiplier)}</div>
                              <div>1</div>
                           </li>
                           {getMultipliersFor(xy, false, gameState).map((m, idx) => {
                              if (!m.worker) {
                                 return null;
                              }
                              return (
                                 // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                 <li key={idx} className="row">
                                    <div className="f1">{m.source}</div>
                                    <div>{formatNumber(m.worker)}</div>
                                 </li>
                              );
                           })}
                        </ul>
                     </details>
                  </li>
               </>
            )}
         </ul>
         {isSpecialBuilding(building.type) ? null : (
            <>
               <div className="sep10"></div>
               <div className="separator has-title">
                  <div>
                     {t(L.AdjustBuildingCapacity)}: {formatPercent(building.capacity)}
                  </div>
               </div>
               <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={building.capacity}
                  onChange={(e) => {
                     building.capacity = Number.parseFloat(e.target.value);
                     notifyGameStateUpdate();
                  }}
               />
               <div className="sep10" />
               <div className="row">
                  <div className="f1">
                     <ApplyToAllComponent
                        xy={xy}
                        getOptions={() => ({ capacity: building.capacity })}
                        gameState={gameState}
                     />
                  </div>
                  <Tippy
                     content={t(L.TurnOffFullBuildings, { building: Config.Building[building.type].name() })}
                  >
                     <button
                        style={{ width: 27, padding: 0 }}
                        onClick={() => {
                           playSuccess();
                           getStorageFullBuildings()
                              .filter((xy) => {
                                 return gameState.tiles.get(xy)?.building?.type === building.type;
                              })
                              .forEach((xy) => {
                                 const b = gameState.tiles.get(xy)?.building;
                                 if (b) {
                                    b.capacity = 0;
                                 }
                              });
                        }}
                     >
                        <div className="m-icon small">domain_disabled</div>
                     </button>
                  </Tippy>
               </div>
            </>
         )}
      </fieldset>
   );
}
