import { safeAdd } from "../../../shared/utilities/Helper";
import { notifyGameStateUpdate, useGameOptions, useGameState } from "../Global";
import type { GreatPerson } from "../definitions/GreatPersonDefinitions";
import type { GreatPeopleChoice } from "../logic/GameState";
import { getGreatPersonUpgradeCost } from "../logic/RebornLogic";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";
import { GreatPersonCard } from "./GreatPersonCard";
import { FormatNumber } from "./HelperComponents";

export function ChooseGreatPersonModal({
   greatPeopleChoice,
}: { greatPeopleChoice: GreatPeopleChoice }): React.ReactNode {
   const gs = useGameState();
   const options = useGameOptions();
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
            <div className="sep5"></div>
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
