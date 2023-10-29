import { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { notifyGameStateUpdate, Singleton, useGameState } from "../Global";
import { Config } from "../logic/Constants";
import { GreatPeopleChoice } from "../logic/GameState";
import { safeAdd } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { greatPersonImage } from "../visuals/GreatPersonVisual";
import { hideModal } from "./GlobalModal";

export function ChooseGreatPersonModal({ greatPeopleChoice }: { greatPeopleChoice: GreatPeopleChoice }) {
   const gs = useGameState();
   function onChosen() {
      gs.greatPeopleChoices.splice(gs.greatPeopleChoices.indexOf(greatPeopleChoice), 1);
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

function GreatPersonCard({ greatPerson, onChosen }: { greatPerson: GreatPerson; onChosen: () => void }) {
   const p = Config.GreatPerson[greatPerson];
   const gs = useGameState();
   return (
      <div
         className="inset-shallow white p10 f1 text-center pointer"
         onClick={() => {
            safeAdd(gs.greatPeople, greatPerson, 1);
            onChosen();
            notifyGameStateUpdate();
            hideModal();
         }}
      >
         <img src={greatPersonImage(greatPerson, Singleton().sceneManager.getContext())} style={{ width: "100%" }} />
         <div className="sep5" />
         {p.desc(p, 1)}
      </div>
   );
}
