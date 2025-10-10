import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { AddTradeFormComponent } from "./AddTradeComponent";

export function AddTradeModal({ hideModal }: { hideModal: () => void }): React.ReactNode {
   const gameState = useGameState();
   return (
      <div className="window" style={{ width: 400, maxWidth: "50vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerTradeNewTrade)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <AddTradeFormComponent onCancel={hideModal} hideModal={hideModal} gameState={gameState} />
         </div>
      </div>
   );
}
