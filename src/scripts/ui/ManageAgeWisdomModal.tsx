import classNames from "classnames";
import { Config } from "../../../shared/logic/Config";
import { getAgeWisdomGreatPeople } from "../../../shared/logic/RebirthLogic";
import { numberToRoman } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { jsxMapOf } from "../utilities/Helper";
import { hideModal } from "./GlobalModal";
import { TextWithHelp } from "./TextWithHelpComponent";

export function ManageAgeWisdomModal(): React.ReactNode {
   const options = useGameOptions();
   return (
      <div className="window" style={{ width: "700px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.ManageAgeWisdom)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <div className="table-view sticky-header" style={{ maxHeight: "50vh" }}>
               <table>
                  <thead>
                     <tr>
                        <th>{t(L.AgeWisdomAge)}</th>
                        <th className="text-center">{t(L.AgeWisdomLevel)}</th>
                        <th></th>
                        <th className="text-right">{t(L.Upgrade)}</th>
                     </tr>
                  </thead>
                  <tbody>
                     {jsxMapOf(Config.TechAge, (age, def) => {
                        if (def.idx === 0) {
                           return null;
                        }
                        const wisdomLevel = options.ageWisdom[age] ?? 0;
                        const nextWisdomLevel = wisdomLevel + 1;
                        return (
                           <tr>
                              <td className="nowrap">{def.name()}</td>
                              <td className="text-center">
                                 {wisdomLevel > 0 ? numberToRoman(wisdomLevel) : null}
                              </td>
                              <td className="text-desc text-small">
                                 {getAgeWisdomGreatPeople(age).map((gp, i) => {
                                    const level = options.greatPeople[gp]?.level ?? 0;
                                    return (
                                       <span key={gp}>
                                          <TextWithHelp
                                             content={
                                                level < nextWisdomLevel
                                                   ? t(L.AgeWisdomRequireExtraLevel, {
                                                        level: nextWisdomLevel - level,
                                                     })
                                                   : t(L.LevelX, { level })
                                             }
                                             className={classNames({
                                                mr5: true,
                                                "text-red": level < nextWisdomLevel,
                                             })}
                                          >
                                             {Config.GreatPerson[gp].name()}
                                          </TextWithHelp>
                                       </span>
                                    );
                                 })}
                              </td>
                              <td></td>
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
