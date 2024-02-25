import type { GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import type { GreatPeopleChoice } from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getGreatPersonUpgradeCost } from "../../../shared/logic/RebornLogic";
import { safeAdd } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions, useGameState } from "../Global";
import { playClick, playError } from "../visuals/Sound";
import { hideModal, showModal } from "./GlobalModal";
import { GreatPersonCard } from "./GreatPersonCard";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";
import { UpgradeGreatPersonModal } from "./UpgradeGreatPersonModal";

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
         if (!options.greatPeople[greatPerson]) {
            options.greatPeople[greatPerson] = { level: 1, amount: 0 };
         } else {
            ++options.greatPeople[greatPerson]!.amount;
         }
         notifyGameOptionsUpdate(options);

         if (options.greatPeopleChoices.length <= 0) {
            showModal(<UpgradeGreatPersonModal />);
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
      <div className="window" style={{ width: "650px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.AGreatPersonIsBorn)}</div>
         </div>
         <div className="window-body">
            <div className="row" style={{ alignItems: "stretch" }}>
               <GreatPersonCard greatPerson={greatPeopleChoice[0]} onChosen={onChosen} />
               <div style={{ width: "5px" }} />
               <GreatPersonCard greatPerson={greatPeopleChoice[1]} onChosen={onChosen} />
               <div style={{ width: "5px" }} />
               <GreatPersonCard greatPerson={greatPeopleChoice[2]} onChosen={onChosen} />
            </div>
            <div className="sep5"></div>
            <div className="row">
               <div className="f1">
                  {permanent ? (
                     <PermanentGreatPersonLevel greatPerson={greatPeopleChoice[0]} />
                  ) : (
                     <GreatPersonLevel greatPerson={greatPeopleChoice[0]} />
                  )}
               </div>
               <div style={{ width: "5px" }} />
               <div className="f1">
                  {permanent ? (
                     <PermanentGreatPersonLevel greatPerson={greatPeopleChoice[1]} />
                  ) : (
                     <GreatPersonLevel greatPerson={greatPeopleChoice[1]} />
                  )}
               </div>
               <div style={{ width: "5px" }} />
               <div className="f1">
                  {permanent ? (
                     <PermanentGreatPersonLevel greatPerson={greatPeopleChoice[2]} />
                  ) : (
                     <GreatPersonLevel greatPerson={greatPeopleChoice[2]} />
                  )}
               </div>
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
   const inventory = options.greatPeople[greatPerson];
   const total = getGreatPersonUpgradeCost((inventory?.level ?? 0) + 1);
   return (
      <div className="outset-shallow-2 p8">
         <div className="row text-small">
            <div className="f1">
               {t(L.GreatPeoplePermanentShort)}{" "}
               {inventory ? `(${t(L.LevelX, { level: inventory.level })})` : null}
            </div>
            <div className="text-right">
               <FormatNumber value={inventory?.amount ?? 0} />
               /<FormatNumber value={total} />
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
   const total = getGreatPersonUpgradeCost((inventory?.level ?? 0) + 1);
   return (
      <div className="outset-shallow-2 p8">
         <div className="row text-small">
            <div>{inventory ? t(L.LevelX, { level: inventory.level }) : null}</div>
            <div className="f1 text-right">
               <FormatNumber value={inventory?.amount ?? 0} />
               /<FormatNumber value={total} />
            </div>
         </div>
         <div className="sep5" />
         <ProgressBarComponent progress={(inventory?.amount ?? 0) / total} />
      </div>
   );
}
