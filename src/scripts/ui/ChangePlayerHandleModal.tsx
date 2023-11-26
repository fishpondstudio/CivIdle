import { useState } from "react";
import { client, OnUserChanged, useUser } from "../rpc/RPCClient";
import { L, t } from "../utilities/i18n";
import { hideModal, showToast } from "./GlobalModal";

export function ChangePlayerHandleModal() {
   const user = useUser();
   if (!user) {
      return null;
   }
   const [handle, setHandle] = useState(user.handle);
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
                  disabled={handle === user.handle}
                  onClick={async () => {
                     try {
                        await client.changeHandle(handle);
                        user.handle = handle;
                        OnUserChanged.emit({ ...user });
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
