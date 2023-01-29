import { useState } from "react";
import { client, useChatMessages } from "../rpc/RPCClient";
import { L, t } from "../utilities/i18n";

export function ChatPanel() {
   const [chat, setChat] = useState("");
   const messages = useChatMessages();
   const latestMessage =
      messages.length > 0
         ? `${messages[messages.length - 1].name}: ${messages[messages.length - 1].message}`
         : "No Message";
   return (
      <div className="chat-bar window">
         <div className="m-icon small text-green mr5">chat</div> <div className="chat-message">{latestMessage}</div>
         <div className="chat-content window">
            <div className="title-bar">
               <div className="title-bar-text">{t(L.Chat)}</div>
            </div>
            <div className="window-content inset-deep white">
               {messages.map((c, i) => {
                  return (
                     <div key={i}>
                        {c.name}: {c.message}
                     </div>
                  );
               })}
            </div>
            <div className="row" style={{ padding: "2px" }}>
               <input
                  className="f1"
                  type="text"
                  style={{ margin: "0 2px 0 0" }}
                  value={chat}
                  onInput={(e) => {
                     setChat(e.currentTarget.value);
                  }}
               />
               <button
                  onClick={(e) => {
                     client.chat("FishPond", chat);
                     setChat("");
                  }}
               >
                  <div className="m-icon">send</div>
               </button>
            </div>
         </div>
      </div>
   );
}
