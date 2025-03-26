import classNames from "classnames";
import { Config } from "../../../shared/logic/Config";
import { formatHMS, reverseMap } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { hideModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";

export function RebirthHistoryModal(): React.ReactNode {
   const options = useGameOptions();
   return (
      <div className="window" style={{ width: "700px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.RebirthHistory)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div
            className="window-body"
            style={{
               maxHeight: "80vh",
               overflowY: "auto",
            }}
         >
            {reverseMap(options.rebirthInfo, (rebirth, index) => (
               <div className={classNames("table-view", { mt10: index !== 0 })}>
                  <table>
                     <tbody>
                        <tr>
                           <td>{t(L.RebirthTime)}</td>
                           <td className="text-right text-strong">
                              {new Date(rebirth.time).toLocaleString()}
                           </td>
                        </tr>
                        <tr>
                           <td>{t(L.Civilization)}</td>
                           <td className="text-right text-strong">{Config.City[rebirth.city].name()}</td>
                        </tr>
                        <tr>
                           <td>{t(L.GreatPeopleThisRun)}</td>
                           <td className="text-right text-strong">{rebirth.greatPeopleThisRun}</td>
                        </tr>
                        <tr>
                           <td>{t(L.ExtraGreatPeopleAtReborn)}</td>
                           <td className="text-right text-strong">{rebirth.greatPeopleAtRebirth}</td>
                        </tr>
                        <tr>
                           <td>{t(L.TotalEmpireValue)}</td>
                           <td className="text-right text-strong">
                              <FormatNumber value={rebirth.totalEmpireValue} />
                           </td>
                        </tr>
                        <tr>
                           <td>{t(L.TotalGameTimeThisRun)}</td>
                           <td className="text-right text-strong">{formatHMS(rebirth.totalTicks * 1000)}</td>
                        </tr>
                        <tr>
                           <td>{t(L.TotalEmpireValuePerCycle)}</td>
                           <td className="text-right text-strong">
                              <FormatNumber value={rebirth.totalEmpireValue / rebirth.totalTicks} />
                           </td>
                        </tr>
                        <tr>
                           <td>{t(L.TotalWallTimeThisRun)}</td>
                           <td className="text-right text-strong">
                              {formatHMS(rebirth.totalSeconds * 1000)}
                           </td>
                        </tr>
                        <tr>
                           <td>{t(L.TotalEmpireValuePerWallSecond)}</td>
                           <td className="text-right text-strong">
                              <FormatNumber value={rebirth.totalEmpireValue / rebirth.totalSeconds} />
                           </td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            ))}
         </div>
      </div>
   );
}
