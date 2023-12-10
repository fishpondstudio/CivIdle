import { notifyGameOptionsUpdate, useGameOptions } from "../Global";
import { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { getGreatPersonUpgradeCost } from "../logic/RebornLogic";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { showModal } from "./GlobalModal";
import { GreatPersonCard } from "./GreatPersonCard";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";
import { UpgradeGreatPersonModal } from "./UpgradeGreatPersonModal";

export function ManageRebornModal(): React.ReactNode {
   const options = useGameOptions();

   if (options.greatPeopleChoices.length <= 0) {
      return null;
   }

   const greatPeopleChoice = options.greatPeopleChoices[0];

   function onChosen(greatPerson: GreatPerson): void {
      playClick();
      options.greatPeopleChoices.splice(options.greatPeopleChoices.indexOf(greatPeopleChoice), 1);
      if (!options.greatPeople[greatPerson]) {
         options.greatPeople[greatPerson] = { level: 1, amount: 0 };
      } else {
         ++options.greatPeople[greatPerson]!.amount;
      }
      notifyGameOptionsUpdate(options);
      if (options.greatPeopleChoices.length <= 0) {
         showModal(<UpgradeGreatPersonModal />);
      }
   }

   return (
      <div className="window" style={{ width: "650px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.ChooseGreatPersonFromLastReborn)}</div>
         </div>
         <div className="window-body">
            <div className="sep5" />
            <div className="row" style={{ alignItems: "stretch" }}>
               <GreatPersonCard greatPerson={greatPeopleChoice[0]} onChosen={onChosen} />
               <div style={{ width: "5px" }} />
               <GreatPersonCard greatPerson={greatPeopleChoice[1]} onChosen={onChosen} />
               <div style={{ width: "5px" }} />
               <GreatPersonCard greatPerson={greatPeopleChoice[2]} onChosen={onChosen} />
            </div>
            <div className="sep5" />
            <div className="row">
               <div className="f1">
                  <GreatPersonLevel greatPerson={greatPeopleChoice[0]} />
               </div>
               <div style={{ width: "5px" }} />
               <div className="f1">
                  <GreatPersonLevel greatPerson={greatPeopleChoice[1]} />
               </div>
               <div style={{ width: "5px" }} />
               <div className="f1">
                  <GreatPersonLevel greatPerson={greatPeopleChoice[2]} />
               </div>
            </div>
            <div className="sep10" />
            <div className="row">
               <div className="f1 text-desc text-small">
                  You have {options.greatPeopleChoices.length - 1} choices left
               </div>
               <button>Next</button>
            </div>
         </div>
      </div>
   );
}

function GreatPersonLevel({ greatPerson }: { greatPerson: GreatPerson }): React.ReactNode {
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
