import classNames from "classnames";
import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import { Config } from "../../../shared/logic/Config";
import { MAX_OFFLINE_PRODUCTION_SEC } from "../../../shared/logic/Constants";
import type { GameState } from "../../../shared/logic/GameState";
import { forEach, formatHM, formatHMS, isEmpty, SECOND } from "../../../shared/utilities/Helper";
import type { PartialTabulate } from "../../../shared/utilities/TypeDefinitions";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { jsxMapOf, jsxMMapOf } from "../utilities/Helper";
import { hideModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function OfflineProductionModal({
   before,
   after,
   offlineProductionTime,
   totalOfflineTime,
   warpFull,
}: {
   before: GameState;
   after: GameState;
   offlineProductionTime: number;
   totalOfflineTime: number;
   warpFull: boolean;
}): React.ReactNode {
   const options = useGameOptions();
   return (
      <div className="window" style={{ width: "500px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.OfflineProduction)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            {warpFull ? (
               <WarningComponent icon="info" className="mb10">
                  <RenderHTML html={t(L.WarpStorageFullHTML)} />
               </WarningComponent>
            ) : null}
            <ul className="tree-view">
               <li className="row">
                  <div className="f1">{t(L.TotalOfflineTime)}</div>
                  <div className="text-strong">{formatHMS(totalOfflineTime * SECOND)}</div>
               </li>
               <li className="row">
                  <div className="f1">
                     {t(L.OfflineProductionTime)}{" "}
                     <div className="text-small text-desc">
                        {t(L.MaxOfflineProductionTimeDesc, {
                           time: formatHM(
                              (options.offlineProductionPercent ?? 0) * MAX_OFFLINE_PRODUCTION_SEC,
                           ),
                        })}
                     </div>
                  </div>
                  <div className="text-strong">{formatHMS(offlineProductionTime * SECOND)}</div>
               </li>
            </ul>
            <div className="sep10"></div>
            <div className="table-view" style={{ maxHeight: "40vh", overflowY: "auto" }}>
               <table>
                  <tbody>
                     <tr>
                        <th>{t(L.BuildingName)}</th>
                        <th>{t(L.Level)}</th>
                        <th></th>
                     </tr>
                     {jsxMMapOf(after.tiles, (xy, tile) => {
                        const building = tile.building;
                        if (!building) {
                           return null;
                        }
                        const diff: PartialTabulate<Material> = {};
                        forEach(building.resources, (res, amount) => {
                           const beforeAmount = before.tiles.get(xy)?.building?.resources[res] ?? 0;
                           if (Math.abs(amount - beforeAmount) > 1) {
                              diff[res] = amount - beforeAmount;
                           }
                        });
                        const beforeLevel = before.tiles.get(xy)?.building?.level ?? 0;
                        if (isEmpty(diff) && beforeLevel === building.level) {
                           return null;
                        }
                        return (
                           <tr key={xy}>
                              <td>{Config.Building[building.type].name()}</td>
                              <td>
                                 {beforeLevel === building.level ? (
                                    building.level
                                 ) : (
                                    <span className="text-green text-strong">
                                       {beforeLevel}-&gt;{building.level}
                                    </span>
                                 )}
                              </td>
                              <td>
                                 {jsxMapOf(diff, (res, amount) => {
                                    return (
                                       <span key={res} className="mr10">
                                          {Config.Material[res].name()}:
                                          <span
                                             className={classNames({
                                                "text-red": amount < 0,
                                                "text-green": amount > 0,
                                                "text-strong": true,
                                             })}
                                          >
                                             {amount > 0 ? " +" : " "}
                                             <FormatNumber value={amount} />
                                          </span>
                                       </span>
                                    );
                                 })}
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
