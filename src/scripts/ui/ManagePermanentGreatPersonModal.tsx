import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useState } from "react";
import { GreatPersonType, type GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../../shared/logic/Config";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { addPermanentGreatPerson, getGreatPersonUpgradeCost } from "../../../shared/logic/RebornLogic";
import { keysOf, numberToRoman } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { isOnlineUser } from "../rpc/RPCClient";
import { GreatPersonImage } from "../visuals/GreatPersonVisual";
import { playAgeUp, playError, playLevelUp } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { RenderHTML } from "./RenderHTMLComponent";
import { TextWithHelp } from "./TextWithHelpComponent";
import { WarningComponent } from "./WarningComponent";

export function ManagePermanentGreatPersonModal(): React.ReactNode {
   return (
      <div className="window" style={{ width: "800px" }}>
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
                        <th></th>
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
                           return (
                              <tr key={k}>
                                 <td>
                                    <GreatPersonImage
                                       greatPerson={k}
                                       style={{ height: "50px", display: "block" }}
                                    />
                                 </td>
                                 <td style={{ userSelect: import.meta.env.DEV ? "text" : "none" }}>
                                    <div className="text-strong">{person.name()}</div>
                                    <div className="text-desc text-small">
                                       {Config.TechAge[person.age].name()}
                                    </div>
                                    {person.city ? (
                                       <div className="row text-orange text-small">
                                          <div className="m-icon small mr2">map</div>
                                          <Tippy
                                             content={t(L.GreatPersonOnlyIn, {
                                                city: Config.City[person.city].name(),
                                             })}
                                          >
                                             <div>{Config.City[person.city].name()}</div>
                                          </Tippy>
                                       </div>
                                    ) : null}
                                 </td>
                                 <GreatPersonRow greatPerson={k} />
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

function GreatPersonRow({ greatPerson }: { greatPerson: GreatPerson }): React.ReactNode {
   switch (Config.GreatPerson[greatPerson].type) {
      case GreatPersonType.Wildcard:
         return <GreatPersonWildcardRow greatPerson={greatPerson} />;
      case GreatPersonType.Promotion:
         return <GreatPersonPromotionRow greatPerson={greatPerson} />;
      case GreatPersonType.Normal:
         return <GreatPersonNormalRow greatPerson={greatPerson} />;
      default:
         return null;
   }
}

function GreatPersonNormalRow({ greatPerson }: { greatPerson: GreatPerson }): React.ReactNode {
   const options = useGameOptions();
   const value = options.greatPeople[greatPerson];
   const person = Config.GreatPerson[greatPerson];
   const total = value ? getGreatPersonUpgradeCost(greatPerson, value.level + 1) : 0;
   return (
      <>
         <td>
            {value ? (
               <div className="text-center">
                  <TextWithHelp content={person.desc(person, value.level)}>
                     {numberToRoman(value.level)}
                  </TextWithHelp>
               </div>
            ) : null}
         </td>
         <td style={{ userSelect: import.meta.env.DEV ? "text" : "none" }}>
            {person.desc(person, value?.level ?? 1)}
         </td>
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
               className="w100 row text-strong w100"
               disabled={!value || value.amount < total}
            >
               <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
                  input_circle
               </div>
               <div className="f1 text-right">
                  <FormatNumber value={value?.amount ?? 0} />/
                  <FormatNumber value={total} />
               </div>
            </button>
         </td>
      </>
   );
}

function GreatPersonWildcardRow({ greatPerson }: { greatPerson: GreatPerson }): React.ReactNode {
   const options = useGameOptions();
   const value = options.greatPeople[greatPerson];
   if (!options.greatPeople[greatPerson]) {
      options.greatPeople[greatPerson] = { amount: 0, level: 0 };
   }
   const person = Config.GreatPerson[greatPerson];
   const choices = keysOf(Config.GreatPerson)
      .filter(
         (g) =>
            Config.GreatPerson[g].age === person.age &&
            Config.GreatPerson[g].type !== GreatPersonType.Wildcard,
      )
      .sort((a, b) => Config.GreatPerson[a].name().localeCompare(Config.GreatPerson[b].name()));
   const [choice, setChoice] = useState(choices[0]);
   return (
      <>
         <td className="text-center">
            {value ? (
               <div className="text-center">
                  <TextWithHelp content={person.desc(person, value.level)}>{value.amount}</TextWithHelp>
               </div>
            ) : null}
         </td>
         <td>
            <select
               value={choice}
               className="w100"
               onChange={(e) => {
                  setChoice(e.target.value as GreatPerson);
               }}
            >
               {choices.map((g) => (
                  <option key={g} value={g}>
                     ({options.greatPeople[g]?.amount ?? 0}) {Config.GreatPerson[g].name()}
                  </option>
               ))}
            </select>
         </td>
         <td>
            <button
               disabled={!value || value.amount <= 0}
               className="w100 text-strong"
               onClick={() => {
                  if (Config.GreatPerson[choice].type === GreatPersonType.Wildcard) {
                     playError();
                     return;
                  }
                  if (value && value.amount > 0) {
                     --value.amount;
                     addPermanentGreatPerson(choice, 1);
                     playLevelUp();
                     notifyGameOptionsUpdate();
                     return;
                  }
               }}
            >
               {t(L.GreatPersonWildCardBirth)}
            </button>
         </td>
      </>
   );
}

function GreatPersonPromotionRow({ greatPerson }: { greatPerson: GreatPerson }): React.ReactNode {
   const options = useGameOptions();
   if (!options.greatPeople[greatPerson]) {
      options.greatPeople[greatPerson] = { amount: 0, level: 0 };
   }
   const value = options.greatPeople[greatPerson];
   const person = Config.GreatPerson[greatPerson];
   const fromChoices = keysOf(Config.GreatPerson)
      .filter(
         (g) =>
            Config.GreatPerson[g].age === person.age &&
            Config.GreatPerson[g].type !== GreatPersonType.Promotion,
      )
      .sort((a, b) => Config.GreatPerson[a].name().localeCompare(Config.GreatPerson[b].name()));
   const toChoices = keysOf(Config.GreatPerson)
      .filter((g) => Config.TechAge[Config.GreatPerson[g].age].idx === Config.TechAge[person.age].idx + 1)
      .sort((a, b) => Config.GreatPerson[a].name().localeCompare(Config.GreatPerson[b].name()));
   const [fromChoice, setFromChoice] = useState(fromChoices[0]);
   const [toChoice, setToChoice] = useState(toChoices[0]);
   return (
      <>
         <td className="text-center">
            {value ? (
               <div className="text-center">
                  <TextWithHelp content={person.desc(person, value.level)}>{value.amount}</TextWithHelp>
               </div>
            ) : null}
         </td>
         <td>
            <div className="row">
               <select
                  value={fromChoice}
                  className="w100"
                  onChange={(e) => {
                     setFromChoice(e.target.value as GreatPerson);
                  }}
               >
                  {fromChoices.map((g) => (
                     <option key={g} value={g}>
                        ({options.greatPeople[g]?.amount ?? 0}) {Config.GreatPerson[g].name()}
                     </option>
                  ))}
               </select>
               <div className="m-icon" style={{ fontSize: "2rem", margin: "0 0.5rem" }}>
                  double_arrow
               </div>
               <select
                  value={toChoice}
                  className="w100"
                  onChange={(e) => {
                     setToChoice(e.target.value as GreatPerson);
                  }}
               >
                  {toChoices.map((g) => (
                     <option key={g} value={g}>
                        ({options.greatPeople[g]?.amount ?? 0}) {Config.GreatPerson[g].name()}
                     </option>
                  ))}
               </select>
            </div>
         </td>
         <td>
            <button
               disabled={(value?.amount ?? 0) <= 0 || (options.greatPeople[fromChoice]?.amount ?? 0) <= 0}
               className="w100 text-strong"
               onClick={() => {
                  if (Config.GreatPerson[fromChoice].type === GreatPersonType.Promotion) {
                     playError();
                     return;
                  }
                  const from = options.greatPeople[fromChoice];
                  if (value && value.amount > 0 && from && from.amount > 0) {
                     --value.amount;
                     --from.amount;
                     addPermanentGreatPerson(toChoice, 1);
                     notifyGameOptionsUpdate();
                     playAgeUp();
                  }
               }}
            >
               {t(L.GreatPersonPromotionPromote)}
            </button>
         </td>
      </>
   );
}
