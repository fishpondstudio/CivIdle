import { L, t } from "../../../shared/utilities/i18n";
import { AvailableTradingResourcesComponent } from "./AvailableTradingResourcesComponent";

export function AvailableTradingResourcesModal({ hideModal }: { hideModal: () => void }): React.ReactNode {
   return (
      <div className="window" style={{ width: 600 }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerTradeTabAvailableTrades)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <AvailableTradingResourcesComponent />
         </div>
      </div>
   );
}
