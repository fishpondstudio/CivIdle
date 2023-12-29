import classNames from "classnames";
import { notifyGameOptionsUpdate, useGameOptions } from "../Global";
import { Config } from "../logic/Config";
import { getGreatPersonUpgradeCost } from "../logic/RebornLogic";
import { isEmpty, keysOf, numberToRoman } from "../utilities/Helper";
import { Singleton } from "../utilities/Singleton";
import { L, t } from "../utilities/i18n";
import { greatPersonImage } from "../visuals/GreatPersonVisual";
import { playError, playLevelUp } from "../visuals/Sound";
import { FormatNumber } from "./HelperComponents";

export function PermanentGreatPeople({
   showEffect,
   stickyHeader,
}: { showEffect: boolean; stickyHeader: boolean }): React.ReactNode {
   const options = useGameOptions();
   return (
      <div className={classNames({ "table-view": true, "sticky-header f1": stickyHeader })}>
         <table>
            <thead>
               <tr>
                  <th></th>
                  <th>{t(L.GreatPeopleName)}</th>
                  <th className="text-center">{t(L.Level)}</th>
                  {showEffect ? <th>{t(L.Level)}</th> : null}
                  <th className="text-center">{t(L.Upgrade)}</th>
               </tr>
            </thead>
            <tbody>
               {keysOf(options.greatPeople)
                  .sort(
                     (a, b) =>
                        Config.TechAge[Config.GreatPerson[a].age].idx -
                        Config.TechAge[Config.GreatPerson[b].age].idx,
                  )
                  .map((k) => {
                     const person = Config.GreatPerson[k];
                     const value = options.greatPeople[k]!;
                     const total = getGreatPersonUpgradeCost(value.level + 1);
                     return (
                        <tr key={k}>
                           <td>
                              <img
                                 src={greatPersonImage(k, Singleton().sceneManager.getContext())}
                                 style={{ height: "50px", display: "block" }}
                              />
                           </td>
                           <td className="nowrap">
                              <div className="text-strong">{person.name()}</div>
                              <div className="text-desc text-small">{Config.TechAge[person.age].name()}</div>
                           </td>
                           <td>
                              <div
                                 className="text-center"
                                 aria-label={person.desc(person, value.level)}
                                 data-balloon-pos="left"
                                 data-balloon-text="left"
                                 data-balloon-length="medium"
                              >
                                 {numberToRoman(value.level)}
                              </div>
                           </td>
                           {showEffect ? <td>{person.desc(person, value.level)}</td> : null}
                           <td>
                              <button
                                 onClick={() => {
                                    if (value.amount >= total) {
                                       value.amount -= total;
                                       value.level++;
                                       notifyGameOptionsUpdate(options);
                                       playLevelUp();
                                    } else {
                                       playError();
                                    }
                                 }}
                                 className="row text-strong w100"
                                 disabled={value.amount < total}
                              >
                                 <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
                                    input_circle
                                 </div>
                                 <div className="f1 text-right">
                                    <FormatNumber value={value.amount} />/
                                    <FormatNumber value={total} />
                                 </div>
                              </button>
                           </td>
                        </tr>
                     );
                  })}
               {isEmpty(options.greatPeople) ? (
                  <tr>
                     <td colSpan={5} className="text-desc">
                        {t(L.NothingHere)}
                     </td>
                  </tr>
               ) : null}
            </tbody>
         </table>
      </div>
   );
}
