import classNames from "classnames";
import warning from "../../images/warning.png";
import { notifyGameStateUpdate } from "../Global";
import {
   applyToAllBuildings,
   getBuildingName,
   getMultipliersFor,
   getResourceName,
   getWorkersFor,
} from "../logic/BuildingLogic";
import { Tick } from "../logic/TickLogic";
import { formatPercent, isEmpty } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { IBuildingComponentProps } from "./BuildingPage";
import { fmtNumber } from "./HelperComponents";

export function BuildingWorkerComponent({ gameState, xy }: IBuildingComponentProps) {
   const workersRequired = getWorkersFor(xy, { exclude: { Worker: true } }, gameState);
   const building = gameState.tiles[xy].building;
   if (building == null) {
      return null;
   }
   if (isEmpty(Tick.current.buildings[building.type].input) && isEmpty(Tick.current.buildings[building.type].output)) {
      return null;
   }
   const showWarning = Tick.current.notProducingReasons[xy] === "NotEnoughWorkers";
   return (
      <fieldset>
         <legend>{t(L.Workers)}</legend>
         <ul className="tree-view">
            <li>
               <details>
                  <summary className="row">
                     <div className="f1">{t(L.WorkersRequiredInput)}</div>
                     <div className="text-strong">
                        {gameState.transportation[xy]?.reduce((prev, curr) => prev + curr.fuelAmount, 0) ?? 0}
                     </div>
                  </summary>
                  <ul>
                     {gameState.transportation[xy]?.map((v) => {
                        return (
                           <li className="row" key={v.id}>
                              <div className="f1">
                                 {t(L.ResourceFromBuilding, {
                                    resource: `${fmtNumber(v.amount, gameState)} ${getResourceName(v.resource)}`,
                                    building: getBuildingName(xy, gameState),
                                 })}
                              </div>
                              <div>{v.fuelAmount}</div>
                           </li>
                        );
                     })}
                  </ul>
               </details>
            </li>
            <li>
               <details>
                  <summary className="row">
                     {showWarning ? <img src={warning} style={{ margin: "0 2px 0 0" }} /> : null}
                     <div className={classNames({ f1: true, "production-warning": showWarning })}>
                        {t(L.WorkersRequiredOutput)}
                     </div>
                     <div className="text-strong">{Tick.current.workersAssignment[xy] ?? 0}</div>
                  </summary>
                  <ul>
                     <li className="row">
                        <div className="f1">{t(L.WorkersRequiredBeforeMultiplier)}</div>
                        <div>{workersRequired.rawOutput}</div>
                     </li>
                     <li className="row">
                        <div className="f1">{t(L.WorkersRequiredAfterMultiplier)}</div>
                        <div>{workersRequired.output}</div>
                     </li>
                  </ul>
               </details>
            </li>
            <li>
               <details>
                  <summary className="row">
                     <div className="f1">{t(L.WorkersRequiredMultiplier)}</div>
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
                           <li key={idx} className="row">
                              <div className="f1">{m.source}</div>
                              <div>{m.worker}</div>
                           </li>
                        );
                     })}
                  </ul>
               </details>
            </li>
         </ul>
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
         <div
            className="text-link text-small"
            onClick={() => {
               playClick();
               applyToAllBuildings(building.type, { capacity: building.capacity }, gameState);
            }}
         >
            {t(L.ApplyToAll, { building: Tick.current.buildings[building.type].name() })}
         </div>
      </fieldset>
   );
}
