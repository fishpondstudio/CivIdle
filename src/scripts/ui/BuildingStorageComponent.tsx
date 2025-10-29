import classNames from "classnames";
import { getMultipliersFor, getStorageFor } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { NotProducingReason, Tick } from "../../../shared/logic/TickLogic";
import { formatPercent, keysOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import warning from "../../images/warning.png";
import { playClick } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { ConfirmModal } from "./ConfirmModal";
import { DeleteResourceModal } from "./DeleteResourceModal";
import { showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";

export function BuildingStorageComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const storage = getStorageFor(xy, gameState);
   const building = gameState.tiles.get(xy)?.building;
   if (building == null || !Number.isFinite(storage.total) || storage.total <= 0) {
      return null;
   }
   const percentage = storage.used / storage.total;
   const showWarning = Tick.current.notProducingReasons.get(xy) === NotProducingReason.StorageFull;
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
                     <ul className="text-small">
                        <li className="row">
                           <div className="f1">{t(L.BaseMultiplier)}</div>
                           <div>1</div>
                        </li>
                        {storage.multiplier === 1
                           ? null
                           : getMultipliersFor(xy, true, gameState).map((m, idx) => {
                                if (!m.storage) {
                                   return null;
                                }
                                return (
                                   // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                   <li key={idx} className="row">
                                      <div className="f1">{m.source}</div>
                                      <div>
                                         <FormatNumber value={m.storage} />
                                      </div>
                                   </li>
                                );
                             })}
                     </ul>
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
                     <li
                        className="row"
                        onClick={() => {
                           showModal(
                              <ConfirmModal
                                 title={t(L.DestroyAllResources)}
                                 onConfirm={() => {
                                    playClick();
                                    building.resources = {};
                                    notifyGameStateUpdate();
                                 }}
                              >
                                 {t(L.DestroyAllResourcesContent)}
                              </ConfirmModal>,
                           );
                        }}
                     >
                        <div className="m-icon text-red small mr5 pointer">delete</div>
                        <div className="text-strong">{t(L.DestroyAllResources)}</div>
                     </li>
                     {keysOf(building.resources)
                        .sort((a, b) => {
                           return building.resources[b]! - building.resources[a]!;
                        })
                        .map((res) => {
                           return (
                              <li className="row" key={res}>
                                 {(building.resources[res] ?? 0) > 0 ? (
                                    <div
                                       className="m-icon small text-red mr5 pointer"
                                       onClick={() => {
                                          showModal(
                                             <DeleteResourceModal building={building} resource={res} />,
                                          );
                                       }}
                                    >
                                       delete
                                    </div>
                                 ) : null}
                                 <div className="f1">{Config.Resource[res].name()}</div>
                                 <div>
                                    <FormatNumber value={building.resources[res]} />
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
