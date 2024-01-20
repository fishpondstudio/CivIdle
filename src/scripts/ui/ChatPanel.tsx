import React, { useEffect, useRef, useState } from "react";
import { ChatChannels } from "../../../shared/utilities/Database";
import { isEmpty, keysOf, sizeOf } from "../../../shared/utilities/Helper";
import chatActive from "../../images/chat_active.png";
import chatInactive from "../../images/chat_inactive.png";
import { OnUIThemeChanged, useGameOptions } from "../Global";
import { handleChatCommand } from "../logic/ChatCommand";
import { addSystemMessage, client, useChatMessages, useUser } from "../rpc/RPCClient";
import { getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { useTypedEvent } from "../utilities/Hook";
import { L, t } from "../utilities/i18n";
import { showModal } from "./GlobalModal";
import { RenderHTML } from "./RenderHTMLComponent";
import { SelectChatChannelModal } from "./SelectChatChannelModal";

export function ChatPanel(): React.ReactNode {
   const [chat, setChat] = useState("");
   const options = useGameOptions();
   const messages = useChatMessages().filter(
      (m) => typeof m === "string" || options.chatReceiveChannel[m.channel],
   );
   const user = useUser();
   const bottomRef = useRef<HTMLDivElement>(null);
   const [showChatWindow, setShowChatWindow] = useState(false);
   const chatInput = useRef<HTMLInputElement>(null);

   if (typeof options.chatSendChannel !== "string" || !ChatChannels[options.chatSendChannel]) {
      options.chatSendChannel = "en";
   }

   if (isEmpty(options.chatReceiveChannel)) {
      options.chatReceiveChannel.en = true;
   }

   useEffect(() => {
      if (bottomRef.current?.parentElement?.scrollTop === 0) {
         bottomRef.current?.scrollIntoView();
      } else {
         bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
   });

   useTypedEvent(OnUIThemeChanged, () => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
   });

   let latestMessage: React.ReactNode = t(L.ChatNoMessage);

   for (let i = messages.length - 1; i >= 0; --i) {
      const message = messages[i];
      if (typeof message === "object") {
         latestMessage = (
            <>
               <span className="text-desc">{message.name}: </span>
               {message.message}
            </>
         );
         break;
      }
   }
   const sendChat = () => {
      if (chat) {
         if (chat.startsWith("/")) {
            const command = chat.substring(1);
            addSystemMessage(`$ ${command}`);
            handleChatCommand(command).catch((e) => addSystemMessage(`${command}: ${e}`));
         } else {
            client.chat(chat, options.chatSendChannel);
         }
         setChat("");
      }
   };

   const receiveMultipleChannels = sizeOf(options.chatReceiveChannel) > 1;

   const chatWindow = (
      <div className="chat-content window">
         <div className="title-bar">
            <div className="title-bar-text">
               {t(L.Chat)}
               {": "}
               {keysOf(options.chatReceiveChannel)
                  .sort()
                  .map((c) => ChatChannels[c])
                  .join(", ")}
            </div>
            <div className="title-bar-controls">
               <button aria-label="Close" onClick={() => setShowChatWindow(false)}></button>
            </div>
         </div>
         <div className="window-content inset-shallow">
            {messages.map((c, i) => {
               if (typeof c === "string") {
                  return (
                     <div className="chat-command-item" key={i}>
                        <RenderHTML html={c} />
                     </div>
                  );
               }
               return (
                  <div className="chat-message-item" key={i}>
                     {c.name === user?.handle ? (
                        <div className="row text-small text-desc">
                           <div>{new Date(c.time ?? 0).toLocaleTimeString()}</div>
                           {receiveMultipleChannels ? <div className="chat-channel">{c.channel}</div> : null}
                           <div className="f1"></div>
                           <div className="text-strong">{c.name}</div>
                           <img
                              src={getFlagUrl(c.flag)}
                              className="player-flag game-cursor"
                              title={getCountryName(c.flag)}
                           />
                        </div>
                     ) : (
                        <div className="row text-small text-desc">
                           <div
                              className="pointer"
                              onClick={() => {
                                 setChat(`@${c.name} ${chat}`);
                                 chatInput.current?.focus();
                              }}
                           >
                              {c.name}
                           </div>
                           <img
                              src={getFlagUrl(c.flag)}
                              className="player-flag game-cursor"
                              title={getCountryName(c.flag)}
                           />
                           <div className="f1"></div>
                           <div>{new Date(c.time ?? 0).toLocaleTimeString()}</div>
                           {receiveMultipleChannels ? <div className="chat-channel">{c.channel}</div> : null}
                        </div>
                     )}
                     <div>{c.message}</div>
                  </div>
               );
            })}
            <div ref={bottomRef}>
               {user != null ? null : (
                  <div className="text-desc text-center text-small mv10">{t(L.ChatReconnect)}</div>
               )}
            </div>
         </div>
         <div className="row" style={{ padding: "2px" }}>
            <div
               className="language-switch pointer"
               aria-label={ChatChannels[options.chatSendChannel]}
               data-balloon-pos="right"
               data-balloon-text="left"
               onClick={() => {
                  showModal(<SelectChatChannelModal />);
               }}
            >
               {options.chatSendChannel.toUpperCase()}
            </div>
            <input
               ref={chatInput}
               className="f1"
               type="text"
               style={{ margin: "0 2px 0 0" }}
               value={chat}
               onInput={(e) => {
                  setChat(e.currentTarget.value);
               }}
               onKeyDown={(e) => {
                  if (e.key === "Enter") {
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
            src={user != null ? chatActive : chatInactive}
         />
         <div className="chat-message pointer" onClick={() => setShowChatWindow(!showChatWindow)}>
            {latestMessage}
         </div>
         {showChatWindow ? chatWindow : null}
      </div>
   );
}
