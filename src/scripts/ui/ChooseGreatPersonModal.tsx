import Tippy from "@tippyjs/react";
import { GreatPersonType, type GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../../shared/logic/Config";
import type { GreatPeopleChoice } from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import {
   addPermanentGreatPerson,
   getGreatPersonUpgradeCost,
   getWisdomUpgradeCost,
   isEligibleForWisdom,
} from "../../../shared/logic/RebirthLogic";
import { formatNumber, round, safeAdd } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions, useGameState } from "../Global";
import { Fonts } from "../visuals/Fonts";
import { GreatPersonImage } from "../visuals/GreatPersonVisual";
import { playClick, playError } from "../visuals/Sound";
import { hideModal, showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { ManagePermanentGreatPersonModal } from "./ManagePermanentGreatPersonModal";

export function ChooseGreatPersonModal({ permanent }: { permanent: boolean }): React.ReactNode {
   const gs = useGameState();
   const options = useGameOptions();

   let greatPeopleChoice: GreatPeopleChoice | null = null;
   let amount = 1;
   let onChosen: ((gp: GreatPerson) => void) | null = null;
   let choicesLeft = 0;

   if (permanent && options.greatPeopleChoicesV2.length > 0) {
      const choice = options.greatPeopleChoicesV2[0];
      greatPeopleChoice = choice.choices;
      amount = choice.amount;
      choicesLeft = options.greatPeopleChoicesV2.length;
      onChosen = (greatPerson) => {
         if (!greatPeopleChoice) {
            playError();
            return;
         }
         const idx = options.greatPeopleChoicesV2.indexOf(choice);
         if (idx === -1) {
            playError();
            return;
         }

         playClick();
         options.greatPeopleChoicesV2.splice(idx, 1);
         addPermanentGreatPerson(greatPerson, choice.amount);
         notifyGameOptionsUpdate(options);

         if (options.greatPeopleChoicesV2.length <= 0) {
            showModal(<ManagePermanentGreatPersonModal />);
         }
      };
   }

   if (!permanent && gs.greatPeopleChoicesV2.length > 0) {
      const choice = gs.greatPeopleChoicesV2[0];
      greatPeopleChoice = choice.choices;
      amount = choice.amount;
      choicesLeft = gs.greatPeopleChoicesV2.length;
      onChosen = (greatPerson) => {
         if (!greatPeopleChoice) {
            playError();
            return;
         }
         const idx = gs.greatPeopleChoicesV2.indexOf(choice);
         if (idx === -1) {
            playError();
            return;
         }

         playClick();
         gs.greatPeopleChoicesV2.splice(idx, 1);
         safeAdd(gs.greatPeople, greatPerson, choice.amount);
         notifyGameStateUpdate();

         if (gs.greatPeopleChoicesV2.length <= 0) {
            hideModal();
         }
      };
   }

   if (greatPeopleChoice === null || onChosen === null) {
      return null;
   }

   return (
      <div className="window" style={{ width: greatPeopleChoice.length * 250, maxWidth: "75vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.AGreatPersonIsBorn)}</div>
         </div>
         <div className="window-body">
            <div className="row" style={{ alignItems: "stretch", columnGap: 5 }}>
               {greatPeopleChoice.map((greatPerson, index) => {
                  const p = Config.GreatPerson[greatPerson];
                  return (
                     <div
                        key={index}
                        className="inset-shallow white p10 f1 text-center pointer"
                        onClick={() => onChosen(greatPerson)}
                     >
                        <GreatPersonImage greatPerson={greatPerson} style={{ width: "100%" }} />
                        {amount > 1 ? (
                           <div className="text-orange" style={{ fontSize: 20, fontFamily: Fonts.Cabin }}>
                              x{amount}
                           </div>
                        ) : null}
                        <div>
                           {p.desc(p, permanent ? 1 : round(1 / (1 + (gs.greatPeople[greatPerson] ?? 0)), 2))}
                        </div>
                        {!permanent &&
                        p.type === GreatPersonType.Normal &&
                        (gs.greatPeople[greatPerson] ?? 0) > 0 ? (
                           <Tippy
                              content={t(L.GreatPersonThisRunEffectiveLevel, {
                                 count: gs.greatPeople[greatPerson] ?? 0,
                                 person: p.name(),
                                 effect: 1 + (gs.greatPeople[greatPerson] ?? 0),
                              })}
                           >
                              <div className="m-icon text-orange mt5">release_alert</div>
                           </Tippy>
                        ) : null}
                     </div>
                  );
               })}
            </div>
            <div className="sep5"></div>
            <div className="row" style={{ columnGap: 5 }}>
               {greatPeopleChoice.map((greatPerson, index) => {
                  return (
                     <div key={index} className="f1">
                        <GreatPersonLevel greatPerson={greatPerson} permanent={permanent} />
                     </div>
                  );
               })}
            </div>
            <div className="sep10" />
            <div className="f1 text-desc text-small text-center">
               {t(L.ChooseGreatPersonChoicesLeft, { count: choicesLeft })}
            </div>
         </div>
      </div>
   );
}

function GreatPersonLevel({
   greatPerson,
   permanent,
}: { greatPerson: GreatPerson; permanent: boolean }): React.ReactNode {
   const options = useGameOptions();
   const gs = useGameState();
   const isNormal = Config.GreatPerson[greatPerson].type === GreatPersonType.Normal;
   const isWisdom = isEligibleForWisdom(greatPerson);
   const inventory = options.greatPeople[greatPerson];
   const total = getGreatPersonUpgradeCost(greatPerson, (inventory?.level ?? 0) + 1);
   return (
      <div className="outset-shallow-2 p8">
         {!permanent ? (
            <div className="row text-small">
               <div className="f1">{t(L.GreatPeopleThisRunShort)}</div>
               <div className="text-right">
                  <FormatNumber value={gs.greatPeople[greatPerson] ?? 0} />
               </div>
            </div>
         ) : null}
         <div className="row text-small">
            <div className="f1">
               {t(L.GreatPeoplePermanentShort)}{" "}
               {isNormal && inventory ? `(${t(L.LevelX, { level: inventory.level })})` : null}
            </div>
            <div className="text-right">
               <FormatNumber value={inventory?.amount ?? 0} />
               {isNormal ? `/${formatNumber(total)}` : null}
            </div>
         </div>
         <div className="row text-small">
            <div className="f1">
               {t(L.AgeWisdom)}
               {isWisdom
                  ? ` (${t(L.LevelX, { level: options.ageWisdom[Config.GreatPerson[greatPerson].age] ?? 0 })})`
                  : null}
            </div>
            {isWisdom ? (
               <div className="text-right">
                  <FormatNumber value={inventory?.amount ?? 0} />/
                  {formatNumber(getWisdomUpgradeCost(greatPerson))}
               </div>
            ) : null}
         </div>
      </div>
   );
}
