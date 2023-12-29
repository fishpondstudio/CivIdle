import classNames from "classnames";
import type { Resource } from "../definitions/ResourceDefinitions";
import type { PartialTabulate } from "../definitions/TypeDefinitions";
import { Config } from "../logic/Config";
import type { GameState } from "../logic/GameState";
import { forEach, formatHM, isEmpty, jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { hideModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";

export function OfflineProductionModal({
   before,
   after,
   time,
}: { before: GameState; after: GameState; time: number }): React.ReactNode {
   return (
      <div className="window" style={{ width: "500px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.OfflineProduction)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <div className="row mv5">
               <div className="f1">{t(L.OfflineTime)}</div>
               <div className="text-strong">{formatHM(time * 1000)}</div>
            </div>
            <div className="table-view" style={{ maxHeight: "40vh", overflowY: "auto" }}>
               <table>
                  <tbody>
                     <tr>
                        <th>{t(L.BuildingName)}</th>
                        <th>{t(L.Level)}</th>
                        <th></th>
                     </tr>
                     {jsxMapOf(after.tiles, (xy, tile) => {
                        const building = tile.building;
                        if (!building) {
                           return null;
                        }
                        const diff: PartialTabulate<Resource> = {};
                        forEach(building.resources, (res, amount) => {
                           const beforeAmount = before.tiles[xy].building?.resources[res] ?? 0;
                           if (Math.abs(amount - beforeAmount) > 1) {
                              diff[res] = amount - beforeAmount;
                           }
                        });
                        const beforeLevel = before.tiles[xy].building?.level ?? 0;
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
                                          {Config.Resource[res].name()}:
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
