import { MAX_TRIBUNE_CARRY_OVER_LEVEL } from "../../../shared/logic/Constants";
import { L, t } from "../../../shared/utilities/i18n";
import { isOnlineUser } from "../rpc/RPCClient";
import { hideModal } from "./GlobalModal";
import { PermanentGreatPeople } from "./PermanentGreatPeople";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function UpgradeGreatPersonModal(): React.ReactNode {
   return (
      <div className="window" style={{ width: "650px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PermanentGreatPeople)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            {isOnlineUser() ? null : (
               <WarningComponent className="mb10" icon="warning">
                  <RenderHTML
                     html={t(L.TribuneGreatPeopleLevelWarning, { level: MAX_TRIBUNE_CARRY_OVER_LEVEL })}
                  />
               </WarningComponent>
            )}
            <PermanentGreatPeople style={{ height: "50vh" }} />
         </div>
      </div>
   );
}
