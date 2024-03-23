import classNames from "classnames";
import { Config } from "../../../shared/logic/Config";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { getGreatPersonUpgradeCost } from "../../../shared/logic/RebornLogic";
import { keysOf, numberToRoman } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { isOnlineUser } from "../rpc/RPCClient";
import { Singleton } from "../utilities/Singleton";
import { greatPersonImage } from "../visuals/GreatPersonVisual";
import { playError, playLevelUp } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { RenderHTML } from "./RenderHTMLComponent";
import { TextWithHelp } from "./TextWithHelpComponent";
import { WarningComponent } from "./WarningComponent";

export function ManagePermanentGreatPersonModal(): React.ReactNode {
   const options = useGameOptions();
   return (
      <div className="window" style={{ width: "650px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PermanentGreatPeople)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            {isOnlineUser() ? null : (
               <WarningComponent className="mb10" icon="info">
                  <RenderHTML className="text-small" html={t(L.TribuneUpgradeDescV3)} />
               </WarningComponent>
            )}
            <div
               className={classNames({ "table-view": true, "sticky-header f1": true })}
               style={{ height: "50vh" }}
            >
               <table>
                  <thead>
                     <tr>
                        <th></th>
                        <th>{t(L.GreatPeopleName)}</th>
                        <th className="text-center">{t(L.Level)}</th>
                        <th>{t(L.Level)}</th>
                        <th className="text-center">{t(L.Upgrade)}</th>
                     </tr>
                  </thead>
                  <tbody>
                     {keysOf(Config.GreatPerson)
                        .sort((a, b) => {
                           const gpa = Config.GreatPerson[a];
                           const gpb = Config.GreatPerson[b];
                           const diff = Config.TechAge[gpa.age].idx - Config.TechAge[gpb.age].idx;
                           if (diff !== 0) {
                              return diff;
                           }
                           return gpa.name().localeCompare(gpb.name());
                        })
                        .map((k) => {
                           const person = Config.GreatPerson[k];
                           const value = options.greatPeople[k];
                           const total = value ? getGreatPersonUpgradeCost(k, value.level + 1) : 0;
                           return (
                              <tr key={k}>
                                 <td>
                                    <img
                                       src={greatPersonImage(k, Singleton().sceneManager.getContext())}
                                       style={{ height: "50px", display: "block" }}
                                    />
                                 </td>
                                 <td>
                                    <div className="text-strong">{person.name()}</div>
                                    <div className="text-desc text-small">
                                       {Config.TechAge[person.age].name()}
                                    </div>
                                 </td>
                                 <td>
                                    {value ? (
                                       <div className="text-center">
                                          <TextWithHelp content={person.desc(person, value.level)}>
                                             {numberToRoman(value.level)}
                                          </TextWithHelp>
                                       </div>
                                    ) : null}
                                 </td>
                                 <td>{person.desc(person, value?.level ?? 1)}</td>
                                 <td>
                                    <button
                                       onClick={() => {
                                          if (value && value.amount >= total) {
                                             value.amount -= total;
                                             value.level++;
                                             notifyGameOptionsUpdate(options);
                                             playLevelUp();
                                          } else {
                                             playError();
                                          }
                                       }}
                                       className="row text-strong w100"
                                       disabled={!value || value.amount < total}
                                    >
                                       <div
                                          className="m-icon"
                                          style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}
                                       >
                                          input_circle
                                       </div>
                                       <div className="f1 text-right">
                                          <FormatNumber value={value?.amount ?? 0} />/
                                          <FormatNumber value={total} />
                                       </div>
                                    </button>
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
