import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { PendingClaimComponent } from "./PendingClaimComponent";

export function PendingClaimModal({ hideModal }: { hideModal: () => void }): React.ReactNode {
   const gameState = useGameState();
   return (
      <div className="window" style={{ width: 500 }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerTradeTabPendingTrades)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <PendingClaimComponent gameState={gameState} />
         </div>
      </div>
   );
}
