import classNames from "classnames";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import { forEach, formatHM, isEmpty } from "../../../shared/utilities/Helper";
import type { PartialTabulate } from "../../../shared/utilities/TypeDefinitions";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMMapOf, jsxMapOf } from "../utilities/Helper";
import { hideModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function OfflineProductionModal({
   before,
   after,
   time,
   warpFull,
}: { before: GameState; after: GameState; time: number; warpFull: boolean }): React.ReactNode {
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
               <WarningComponent icon="info">
                  <RenderHTML html={t(L.WarpStorageFullHTML)} />
               </WarningComponent>
            ) : null}
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
                     {jsxMMapOf(after.tiles, (xy, tile) => {
                        const building = tile.building;
                        if (!building) {
                           return null;
                        }
                        const diff: PartialTabulate<Resource> = {};
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
