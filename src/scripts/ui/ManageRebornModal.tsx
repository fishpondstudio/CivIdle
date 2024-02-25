import type { GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import { MAX_TRIBUNE_CARRY_OVER_LEVEL } from "../../../shared/logic/Constants";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { isOnlineUser } from "../rpc/RPCClient";
import { GreatPersonCard } from "./GreatPersonCard";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function ManageRebornModal(): React.ReactNode {
   const options = useGameOptions();

   if (options.greatPeopleChoices.length <= 0) {
      return null;
   }

   const greatPeopleChoice = options.greatPeopleChoices[0];

   function onChosen(greatPerson: GreatPerson): void {}

   return (
      <div className="window" style={{ width: "650px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.ChooseGreatPersonFromLastReborn)}</div>
         </div>
         <div className="window-body">
            {isOnlineUser() ? null : (
               <WarningComponent className="mb10 text-small" icon="warning">
                  <RenderHTML
                     html={t(L.TribuneGreatPeopleLevelWarningV2, { level: MAX_TRIBUNE_CARRY_OVER_LEVEL })}
                  />
               </WarningComponent>
            )}
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
            <div className="f1 text-desc text-small text-center">
               You have {options.greatPeopleChoices.length} choices left
            </div>
         </div>
      </div>
   );
}
