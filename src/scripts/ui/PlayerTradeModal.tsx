import { useState } from "react";
import { L, t } from "../../../shared/utilities/i18n";
import { hideModal } from "./GlobalModal";
import { PlayerTradeComponent } from "./PlayerTradeComponent";

export function PlayerTradeModal(): React.ReactNode {
   const [modal, setModal] = useState<React.ReactNode>(null);
   return (
      <>
         <div className="window" style={{ width: "800px", maxWidth: "80vw" }}>
            <div className="title-bar">
               <div className="title-bar-text">{t(L.PlayerTrade)}</div>
               <div className="title-bar-controls">
                  <button onClick={hideModal} aria-label="Close"></button>
               </div>
            </div>
            <div className="window-body" style={{ padding: 0 }}>
               <PlayerTradeComponent showModal={setModal} hideModal={setModal.bind(null, null)} />
            </div>
         </div>
         <div style={{ position: "absolute", zIndex: 3 }}>{modal}</div>
      </>
   );
}
