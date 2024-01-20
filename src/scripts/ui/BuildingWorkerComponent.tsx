import classNames from "classnames";
import { formatPercent, isEmpty } from "../../../shared/utilities/Helper";
import warning from "../../images/warning.png";
import { notifyGameStateUpdate } from "../Global";
import {
   IOCalculation,
   getBuildingName,
   getMultipliersFor,
   getResourceName,
   getWorkersFor,
   isSpecialBuilding,
} from "../logic/BuildingLogic";
import { getBuildingIO } from "../logic/IntraTickCache";
import { Tick } from "../logic/TickLogic";
import { L, t } from "../utilities/i18n";
import { ApplyToAllComponent } from "./ApplyToAllComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber, fmtNumber } from "./HelperComponents";

export function BuildingWorkerComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const workersRequired = getWorkersFor(xy, { exclude: { Worker: 1 } }, gameState);
   const building = gameState.tiles.get(xy)?.building;
   if (building == null) {
      return null;
   }
   const input = getBuildingIO(xy, "input", IOCalculation.None, gameState);
   const output = getBuildingIO(xy, "output", IOCalculation.None, gameState);
   if (isEmpty(input) && isEmpty(output)) {
      return null;
   }
   const showWarning = Tick.current.notProducingReasons.get(xy) === "NotEnoughWorkers";
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
                           <div className="text-strong">
                              {gameState.transportation
                                 .get(xy)
                                 ?.reduce((prev, curr) => prev + curr.currentFuelAmount, 0) ?? 0}
                           </div>
                        </summary>
                        <ul>
                           {gameState.transportation.get(xy)?.map((v) => {
                              return (
                                 <li className="row" key={v.id}>
                                    <div className="f1">
                                       {t(L.ResourceFromBuilding, {
                                          resource: `${fmtNumber(v.amount, gameState)} ${getResourceName(
                                             v.resource,
                                          )}`,
                                          building: getBuildingName(v.fromXy, gameState),
                                       })}{" "}
                                       ({v.ticksSpent}/{v.ticksRequired})
                                    </div>
                                    <div>{v.currentFuelAmount}</div>
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
                              {workersRequired.multiplier +
                                 Tick.current.globalMultipliers.transportCapacity.reduce(
                                    (prev, curr) => prev + curr.value,
                                    0,
                                 )}
                           </div>
                        </summary>
                        <ul>
                           <li className="row">
                              <div className="f1">{t(L.BaseMultiplier)}</div>
                              <div>1</div>
                           </li>
                           {getMultipliersFor(xy, gameState).map((m) => {
                              if (!m.worker) {
                                 return null;
                              }
                              return (
                                 <li key={m.source} className="row">
                                    <div className="f1">{m.source}</div>
                                    <div>{m.worker}</div>
                                 </li>
                              );
                           })}
                           <li className="row">
                              <div className="f1">{t(L.TransportCapacityMultiplier)}</div>
                              <div>
                                 {Tick.current.globalMultipliers.transportCapacity.reduce(
                                    (prev, curr) => prev + curr.value,
                                    0,
                                 )}
                              </div>
                           </li>
                           <ul className="text-small">
                              {Tick.current.globalMultipliers.transportCapacity.map((m) => {
                                 return (
                                    <li key={m.source} className="row">
                                       <div className="f1">{m.source}</div>
                                       <div>{m.value}</div>
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
                                 <FormatNumber value={workersRequired.rawOutput} />
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
                           {getMultipliersFor(xy, gameState).map((m, idx) => {
                              if (!m.worker) {
                                 return null;
                              }
                              return (
                                 // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                 <li key={idx} className="row">
                                    <div className="f1">{m.source}</div>
                                    <div>{m.worker}</div>
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
                  id="building-capacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={building.capacity}
                  onChange={(e) => {
                     building.capacity = parseFloat(e.target.value);
                     notifyGameStateUpdate();
                  }}
                  className="mh0"
               />
               <div className="sep10" />
               <ApplyToAllComponent
                  building={building}
                  getOptions={() => ({ capacity: building.capacity })}
                  gameState={gameState}
               />
            </>
         )}
      </fieldset>
   );
}
