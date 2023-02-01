import { useEffect, useRef, useState } from "react";
import chatActive from "../../images/chat_active.png";
import chatInactive from "../../images/chat_inactive.png";
import { OnUIThemeChanged } from "../Global";
import { client, useChatMessages, useIsConnected } from "../rpc/RPCClient";
import { useTypedEvent } from "../utilities/Hook";
import { L, t } from "../utilities/i18n";

export function ChatPanel() {
   const [chat, setChat] = useState("");
   const messages = useChatMessages();
   const isConnected = useIsConnected();
   const bottomRef = useRef<HTMLDivElement>(null);
   const [showChatWindow, setShowChatWindow] = useState(false);

   useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages, isConnected, showChatWindow]);

   useTypedEvent(OnUIThemeChanged, () => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
   });

   const latestMessage =
      messages.length > 0 ? (
         <>
            <span className="text-desc">{messages[messages.length - 1].name}: </span>
            {messages[messages.length - 1].message}
         </>
      ) : (
         t(L.ChatNoMessage)
      );
   const sendChat = () => {
      if (chat) {
         client.chat("FishPond", chat);
         setChat("");
      }
   };

   const chatWindow = (
      <div className="chat-content window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Chat)}</div>
            <div className="title-bar-controls">
               <button aria-label="Close" onClick={() => setShowChatWindow(false)}></button>
            </div>
         </div>
         <div className="window-content inset-shallow">
            {messages.map((c, i) => {
               return (
                  <div className="chat-message-item" key={i}>
                     <span className="text-desc">{c.name}</span>: {c.message}
                  </div>
               );
            })}
            <div ref={bottomRef}>
               {isConnected ? null : <div className="text-desc text-center text-small mv10">{t(L.ChatReconnect)}</div>}
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
            <button onClick={sendChat}>{t(L.ChatSend)}</button>
         </div>
      </div>
   );

   return (
      <div className="chat-bar window">
         <img
            style={{ width: "16px", height: "16px", margin: "0 5px 0 0" }}
            src={isConnected ? chatActive : chatInactive}
         />
         <div className="chat-message pointer" onClick={() => setShowChatWindow(!showChatWindow)}>
            {latestMessage}
         </div>
         {showChatWindow ? chatWindow : null}
      </div>
   );
}
