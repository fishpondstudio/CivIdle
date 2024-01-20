import { L, t } from "../../../shared/utilities/i18n";
import { hideModal } from "./GlobalModal";
import { PermanentGreatPeople } from "./PermanentGreatPeople";

export function UpgradeGreatPersonModal(): React.ReactNode {
   return (
      <div className="window" style={{ width: "650px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PermanentGreatPeople)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body" style={{ display: "flex", maxHeight: "50vh" }}>
            <PermanentGreatPeople showEffect={true} stickyHeader={true} />
         </div>
      </div>
   );
}
