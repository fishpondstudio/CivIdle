import Tippy from "@tippyjs/react";
import { Fragment } from "react";
import { GreatPersonType, type GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../../shared/logic/Config";
import type { GreatPeopleChoice } from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { addPermanentGreatPerson, getGreatPersonUpgradeCost } from "../../../shared/logic/RebirthLogic";
import { formatNumber, safeAdd } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions, useGameState } from "../Global";
import { GreatPersonImage } from "../visuals/GreatPersonVisual";
import { playClick, playError } from "../visuals/Sound";
import { hideModal, showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { ManagePermanentGreatPersonModal } from "./ManagePermanentGreatPersonModal";
import { ProgressBarComponent } from "./ProgressBarComponent";

export function ChooseGreatPersonModal({ permanent }: { permanent: boolean }): React.ReactNode {
   const gs = useGameState();
   const options = useGameOptions();

   let greatPeopleChoice: GreatPeopleChoice | null = null;
   let onChosen: ((gp: GreatPerson) => void) | null = null;
   let choicesLeft = 0;

   if (permanent && options.greatPeopleChoices.length > 0) {
      greatPeopleChoice = options.greatPeopleChoices[0];
      choicesLeft = options.greatPeopleChoices.length;
      onChosen = (greatPerson) => {
         if (!greatPeopleChoice) {
            playError();
            return;
         }
         const idx = options.greatPeopleChoices.indexOf(greatPeopleChoice);
         if (idx === -1) {
            playError();
            return;
         }

         playClick();
         options.greatPeopleChoices.splice(idx, 1);
         addPermanentGreatPerson(greatPerson, 1);
         notifyGameOptionsUpdate(options);

         if (options.greatPeopleChoices.length <= 0) {
            showModal(<ManagePermanentGreatPersonModal />);
         }
      };
   }

   if (!permanent && gs.greatPeopleChoices.length > 0) {
      greatPeopleChoice = gs.greatPeopleChoices[0];
      choicesLeft = gs.greatPeopleChoices.length;
      onChosen = (greatPerson) => {
         if (!greatPeopleChoice) {
            playError();
            return;
         }
         const idx = gs.greatPeopleChoices.indexOf(greatPeopleChoice);
         if (idx === -1) {
            playError();
            return;
         }

         playClick();
         gs.greatPeopleChoices.splice(idx, 1);
         safeAdd(gs.greatPeople, greatPerson, 1);
         notifyGameStateUpdate();

         if (gs.greatPeopleChoices.length <= 0) {
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
            <div className="row" style={{ alignItems: "stretch" }}>
               {greatPeopleChoice.map((greatPerson, index) => {
                  return (
                     // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                     <Fragment key={index}>
                        {index === 0 ? null : <div style={{ width: "5px" }} />}
                        <GreatPersonCard
                           greatPerson={greatPerson}
                           permanent={permanent}
                           onChosen={onChosen!}
                        />
                     </Fragment>
                  );
               })}
            </div>
            <div className="sep5"></div>
            <div className="row">
               {greatPeopleChoice.map((greatPerson, index) => {
                  return (
                     // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                     <Fragment key={index}>
                        {index === 0 ? null : <div style={{ width: "5px" }} />}
                        <div className="f1">
                           {permanent ? (
                              <PermanentGreatPersonLevel greatPerson={greatPerson} />
                           ) : (
                              <GreatPersonLevel greatPerson={greatPerson} />
                           )}
                        </div>
                     </Fragment>
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

function GreatPersonLevel({ greatPerson }: { greatPerson: GreatPerson }): React.ReactNode {
   const options = useGameOptions();
   const gs = useGameState();
   const isNormal = Config.GreatPerson[greatPerson].type === GreatPersonType.Normal;
   const inventory = options.greatPeople[greatPerson];
   const total = getGreatPersonUpgradeCost(greatPerson, (inventory?.level ?? 0) + 1);
   return (
      <div className="outset-shallow-2 p8">
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
            <div className="f1">{t(L.GreatPeopleThisRunShort)}</div>
            <div className="text-right">
               <FormatNumber value={gs.greatPeople[greatPerson] ?? 0} />
            </div>
         </div>
      </div>
   );
}

function PermanentGreatPersonLevel({ greatPerson }: { greatPerson: GreatPerson }): React.ReactNode {
   const options = useGameOptions();
   const inventory = options.greatPeople[greatPerson];
   const total = getGreatPersonUpgradeCost(greatPerson, (inventory?.level ?? 0) + 1);
   const isNormal = Config.GreatPerson[greatPerson].type === GreatPersonType.Normal;
   return (
      <div className="outset-shallow-2 p8">
         <div className="row text-small">
            {isNormal ? <div>{inventory ? t(L.LevelX, { level: inventory.level }) : null}</div> : null}
            <div className="f1 text-right">
               <FormatNumber value={inventory?.amount ?? 0} />
               {isNormal ? `/${formatNumber(total)}` : null}
            </div>
         </div>
         <div className="sep5" />
         <ProgressBarComponent progress={isNormal ? (inventory?.amount ?? 0) / total : 1} />
      </div>
   );
}

function GreatPersonCard({
   greatPerson,
   permanent,
   onChosen,
}: {
   greatPerson: GreatPerson;
   permanent: boolean;
   onChosen: (chosen: GreatPerson) => void;
}): React.ReactNode {
   const p = Config.GreatPerson[greatPerson];
   const gs = useGameState();
   return (
      <div
         className="inset-shallow white p10 f1 text-center pointer"
         onClick={() => {
            onChosen(greatPerson);
         }}
      >
         <GreatPersonImage greatPerson={greatPerson} style={{ width: "100%" }} />
         {permanent ? (
            <>
               <div className="sep5" />
               <div>{p.desc(p, 1)}</div>
            </>
         ) : (
            <>
               <div className="mt10">
                  {p.desc(p, Math.round(100 / (1 + (gs.greatPeople[greatPerson] ?? 0))) / 100)}
               </div>
               {p.type === GreatPersonType.Normal && (gs.greatPeople[greatPerson] ?? 0) > 0 ? (
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
            </>
         )}
      </div>
   );
}
