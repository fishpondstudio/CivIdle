import classNames from "classnames";
import warning from "../../images/warning.png";
import { getStorageFor } from "../logic/BuildingLogic";
import { Tick } from "../logic/TickLogic";
import { formatPercent, jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";

export function BuildingStorageComponent({ gameState, xy }: IBuildingComponentProps) {
   const storage = getStorageFor(xy, gameState);
   const building = gameState.tiles[xy].building;
   if (building == null || !isFinite(storage.total) || storage.total <= 0) {
      return null;
   }
   const percentage = storage.used / storage.total;
   const showWarning = Tick.current.notProducingReasons[xy] === "StorageFull";
   return (
      <fieldset>
         <legend className="row">
            {showWarning ? <img src={warning} style={{ margin: "0 2px 0 0" }} /> : null}
            <div className={classNames({ f1: true, "production-warning": showWarning })}>
               {t(L.Storage)}: {formatPercent(percentage)}
            </div>
         </legend>
         <ProgressBarComponent progress={percentage} />
         <div className="sep5"></div>
         <ul className="tree-view">
            <li>
               <details>
                  <summary className="row">
                     <div className="f1">{t(L.TotalStorage)}</div>
                     <div className="text-strong">
                        <FormatNumber value={storage.total} />
                     </div>
                  </summary>
                  <ul>
                     <li className="row">
                        <div className="f1">{t(L.StorageBaseCapacity)}</div>
                        <div>
                           <FormatNumber value={storage.base} />
                        </div>
                     </li>
                     <li className="row">
                        <div className="f1">{t(L.StorageMultiplier)}</div>
                        <div>
                           x
                           <FormatNumber value={storage.multiplier} />
                        </div>
                     </li>
                  </ul>
               </details>
            </li>
            <li>
               <details>
                  <summary className="row">
                     <div className="f1">{t(L.StorageUsed)}</div>
                     <div className="text-strong">
                        <FormatNumber value={storage.used} />
                     </div>
                  </summary>
                  <ul>
                     {jsxMapOf(building.resources, (res, value) => {
                        return (
                           <li className="row" key={res}>
                              <div className="f1">{Tick.current.resources[res].name()}</div>
                              <div>
                                 <FormatNumber value={value} />
                              </div>
                           </li>
                        );
                     })}
                  </ul>
               </details>
            </li>
         </ul>
      </fieldset>
   );
}
