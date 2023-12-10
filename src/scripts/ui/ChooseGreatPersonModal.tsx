import { notifyGameStateUpdate, useGameState } from "../Global";
import { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { GreatPeopleChoice } from "../logic/GameState";
import { safeAdd } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";
import { GreatPersonCard } from "./GreatPersonCard";

export function ChooseGreatPersonModal({
   greatPeopleChoice,
}: { greatPeopleChoice: GreatPeopleChoice }): React.ReactNode {
   const gs = useGameState();
   function onChosen(greatPerson: GreatPerson) {
      playClick();
      gs.greatPeopleChoices.splice(gs.greatPeopleChoices.indexOf(greatPeopleChoice), 1);
      safeAdd(gs.greatPeople, greatPerson, 1);
      notifyGameStateUpdate();
      hideModal();
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
         </div>
      </div>
   );
}
