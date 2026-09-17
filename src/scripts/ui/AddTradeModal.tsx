import { $t, L } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { AddTradeFormComponent } from "./AddTradeComponent";

export function AddTradeModal({ hideModal }: { hideModal: () => void }): React.ReactNode {
   const gameState = useGameState();
   return (
      <div className="window modal-window" style={{ width: "40rem" }}>
         <div className="title-bar">
            <div className="title-bar-text">{$t(L.PlayerTradeNewTrade)}</div>
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
