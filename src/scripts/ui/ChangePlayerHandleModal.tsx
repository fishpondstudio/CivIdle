import { useState } from "react";
import { L, t } from "../../../shared/utilities/i18n";
import { OnUserChanged, client, useUser } from "../rpc/RPCClient";
import { CountryCode, getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { jsxMapOf } from "../utilities/Helper";
import { hideModal, showToast } from "./GlobalModal";

export function ChangePlayerHandleModal(): React.ReactNode {
   const user = useUser();
   if (!user) {
      return null;
   }
   const [handle, setHandle] = useState(user.handle);
   const [flag, setFlag] = useState(user.flag);
   const name = getCountryName(flag);
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
            <div className="row">
               <div className="f1">
                  <input
                     style={{ width: "100%" }}
                     type="text"
                     value={handle}
                     onChange={(e) => setHandle(e.target.value)}
                  />
               </div>
               <div>
                  <img
                     className="ml5"
                     src={getFlagUrl(flag)}
                     style={{ height: "30px", display: "block" }}
                     title={name}
                     alt={name}
                  />
               </div>
            </div>
            <div className="sep10"></div>
            <div
               className="inset-deep-2 white"
               style={{ padding: "10px", height: "200px", overflowY: "auto" }}
            >
               <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
                  {jsxMapOf(CountryCode, (c, v) => {
                     return (
                        <img
                           key={c}
                           onClick={async () => {
                              setFlag(c);
                           }}
                           src={getFlagUrl(c)}
                           className="pointer player-flag-large"
                           title={v}
                           alt={v}
                        />
                     );
                  })}
               </div>
            </div>
            <div className="sep15"></div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
               <button
                  disabled={handle === user.handle && flag === user.flag}
                  onClick={async () => {
                     try {
                        await client.changeHandle(handle, flag);
                        user.handle = handle;
                        user.flag = flag;
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
