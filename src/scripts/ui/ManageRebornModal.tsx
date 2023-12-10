import { useGameOptions, useGameState } from "../Global";
import { L, t } from "../utilities/i18n";
import { hideModal } from "./GlobalModal";
import { GreatPersonCard } from "./GreatPersonCard";
import { ProgressBarComponent } from "./ProgressBarComponent";

export function ManageRebornModal(): React.ReactNode {
   const gs = useGameState();
   const options = useGameOptions();

   if (options.greatPeopleChoices.length <= 0) {
      hideModal();
      return null;
   }

   const greatPeopleChoice = options.greatPeopleChoices[0];

   function onChosen() {
      gs.greatPeopleChoices.splice(gs.greatPeopleChoices.indexOf(greatPeopleChoice), 1);
   }

   return (
      <div className="window" style={{ width: "650px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.ChooseGreatPersonFromLastReborn)}</div>
         </div>
         <div className="window-body">
            <div className="sep5" />
            <div className="row" style={{ alignItems: "stretch" }}>
               <GreatPersonCard greatPerson={greatPeopleChoice[0]} onChosen={onChosen}>
                  <div
                     className="row text-small"
                     style={{
                        margin: "10px -10px -10px -10px",
                        borderTop: "1px solid #ccc",
                        padding: "10px",
                     }}
                  >
                     <div>Level 3</div>
                     <div className="f1 text-right">3/4</div>
                  </div>
                  <div className="sep5" />
                  <ProgressBarComponent progress={0.5} />
               </GreatPersonCard>
               <div style={{ width: "5px" }} />
               <GreatPersonCard greatPerson={greatPeopleChoice[1]} onChosen={onChosen} />
               <div style={{ width: "5px" }} />
               <GreatPersonCard greatPerson={greatPeopleChoice[2]} onChosen={onChosen} />
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
