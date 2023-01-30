import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { OnUIThemeChanged } from "../Global";
import { client, useChatMessages, useIsConnected } from "../rpc/RPCClient";
import { useTypedEvent } from "../utilities/Hook";
import { L, t } from "../utilities/i18n";

export function ChatPanel() {
   const [chat, setChat] = useState("");
   const messages = useChatMessages();
   const isConnected = useIsConnected();
   const bottomRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages, isConnected]);

   useTypedEvent(OnUIThemeChanged, () => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
   });

   const latestMessage =
      messages.length > 0
         ? `${messages[messages.length - 1].name}: ${messages[messages.length - 1].message}`
         : t(L.ChatNoMessage);
   const sendChat = () => {
      if (chat) {
         client.chat("FishPond", chat);
         setChat("");
      }
   };

   return (
      <div className="chat-bar window">
         <div
            className={classNames({
               "m-icon small mr5": true,
               "text-red": !isConnected,
               "text-green": isConnected,
            })}
         >
            chat
         </div>{" "}
         <div className="chat-message">{latestMessage}</div>
         <div className="chat-content window">
            <div className="title-bar">
               <div className="title-bar-text">{t(L.Chat)}</div>
            </div>
            <div className="window-content inset-shallow">
               {messages.map((c, i) => {
                  return (
                     <div key={i}>
                        <span className="text-desc">{c.name}</span>: {c.message}
                     </div>
                  );
               })}
               <div className="text-desc text-center text-small" ref={bottomRef}>
                  {isConnected ? null : t(L.ChatReconnect)}
               </div>
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
                  onKeyDown={(e) => {
                     if (e.key == "Enter") {
                        sendChat();
                     }
                  }}
               />
               <button onClick={sendChat}>
                  <div className="m-icon">send</div>
               </button>
            </div>
         </div>
      </div>
   );
}
