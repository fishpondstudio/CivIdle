import { useState } from "react";
import { client, getHandle } from "../rpc/RPCClient";
import { L, t } from "../utilities/i18n";
import { hideModal, showToast } from "./GlobalModal";

export function ChangePlayerHandleModal() {
   const [handle, setHandle] = useState(getHandle());
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerHandle)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <div className="text-small">{t(L.ChangePlayerHandledDesc)}</div>
            <div className="sep10"></div>
            <input style={{ width: "100%" }} type="text" value={handle} onChange={(e) => setHandle(e.target.value)} />
            <div className="sep15"></div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
               <button
                  disabled={handle === getHandle()}
                  onClick={async () => {
                     try {
                        await client.changeHandle(handle);
                        hideModal();
                     } catch (error) {
                        showToast(String(error));
                     }
                  }}
               >
                  {t(L.ChangePlayerHandle)}
               </button>
               <div style={{ width: "10px" }}></div>
               <button onClick={hideModal}>{t(L.ChangePlayerHandleCancel)}</button>
            </div>
         </div>
      </div>
   );
}
