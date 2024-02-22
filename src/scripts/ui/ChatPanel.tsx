import Tippy from "@tippyjs/react";
import classNames from "classnames";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
   AccountLevel,
   ChatAttributes,
   ChatChannels,
   type IChat,
   type IUser,
} from "../../../shared/utilities/Database";
import { hasFlag, keysOf, sizeOf } from "../../../shared/utilities/Helper";
import { censor } from "../../../shared/utilities/ProfanityFilter";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";
import { L, t } from "../../../shared/utilities/i18n";
import AccountLevelMod from "../../images/AccountLevelMod.png";
import chatActive from "../../images/chat_active.png";
import chatInactive from "../../images/chat_inactive.png";
import { ToggleChatWindow, useGameOptions } from "../Global";
import { AccountLevelImages, AccountLevelNames } from "../logic/AccountLevel";
import { handleChatCommand } from "../logic/ChatCommand";
import {
   addSystemMessage,
   client,
   useChatMessages,
   useUser,
   type IClientChat,
   type LocalChat,
} from "../rpc/RPCClient";
import { getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { useTypedEvent } from "../utilities/Hook";
import { openUrl } from "../utilities/Platform";
import { playError } from "../visuals/Sound";
import { showModal, showToast } from "./GlobalModal";
import { RenderHTML } from "./RenderHTMLComponent";
import { SelectChatChannelModal } from "./SelectChatChannelModal";

const SetChatInput = new TypedEvent<(old: string) => string>();

export function ChatPanel(): React.ReactNode {
   const options = useGameOptions();
   const messages = useChatMessages().filter(
      (m) => !("channel" in m) || options.chatReceiveChannel[m.channel],
   );
   const user = useUser();
   const scrollAreaRef = useRef<HTMLDivElement>(null);
   const [showChatWindow, setShowChatWindow] = useState(false);
   const shouldScroll = useRef(false);
   const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

   useTypedEvent(ToggleChatWindow, (on) => {
      setShowChatWindow(on);
   });

   // biome-ignore lint/correctness/useExhaustiveDependencies:
   useEffect(() => {
      if (!shouldScroll.current) return;
      scrollAreaRef.current?.scrollTo({
         top: scrollAreaRef.current.scrollHeight,
         behavior: "smooth",
      });
   }, [lastMessage?.id ?? 0, user]);

   const onImageLoaded = useCallback(() => {
      if (!shouldScroll.current) return;
      scrollAreaRef.current?.scrollTo({
         top: scrollAreaRef.current.scrollHeight,
         behavior: "smooth",
      });
   }, []);

   // biome-ignore lint/correctness/useExhaustiveDependencies:
   useEffect(() => {
      scrollAreaRef.current?.scrollTo({
         top: scrollAreaRef.current.scrollHeight,
         behavior: "instant",
      });
   }, [showChatWindow]);

   const receiveMultipleChannels = sizeOf(options.chatReceiveChannel) > 1;

   return (
      <div className="chat-bar window">
         <img
            style={{ width: "16px", height: "16px", margin: "0 5px 0 0" }}
            src={user != null ? chatActive : chatInactive}
         />
         <div className="chat-message pointer" onClick={() => setShowChatWindow(!showChatWindow)}>
            <LatestMessage messages={messages} />
         </div>
         {showChatWindow ? (
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
               <div
                  ref={scrollAreaRef}
                  onMouseEnter={() => {
                     shouldScroll.current = false;
                  }}
                  onMouseLeave={() => {
                     shouldScroll.current = true;
                  }}
                  className="window-content inset-shallow"
               >
                  {messages.map((c) => {
                     if (!("channel" in c)) {
                        return (
                           <div className="chat-command-item" key={c.id}>
                              <RenderHTML html={c.message} />
                           </div>
                        );
                     }
                     return (
                        <ChatMessage
                           key={c.id}
                           user={user}
                           chat={c}
                           showChannel={receiveMultipleChannels}
                           onImageLoaded={onImageLoaded}
                        />
                     );
                  })}
                  {user !== null ? null : (
                     <div className="text-desc text-center text-small mv10">{t(L.ChatReconnect)}</div>
                  )}
               </div>
               <ChatInput
                  onChatSend={() => {
                     shouldScroll.current = true;
                  }}
               />
            </div>
         ) : null}
      </div>
   );
}

function ChatInput({ onChatSend }: { onChatSend: (message: string) => void }): React.ReactNode {
   const options = useGameOptions();
   const [chat, setChat] = useState("");
   const chatInput = useRef<HTMLInputElement>(null);
   const sendChat = () => {
      if (!chat) return;
      if (chat.startsWith("/")) {
         const command = chat.substring(1);
         addSystemMessage(`$ ${command}`);
         handleChatCommand(command).catch((e) => addSystemMessage(`${command}: ${e}`));
      } else {
         client.chat(censor(chat), options.chatSendChannel).catch((e) => {
            playError();
            showToast(String(e));
         });
      }
      onChatSend(chat);
      setChat("");
   };
   useTypedEvent(SetChatInput, (content) => {
      setChat(content);
      chatInput.current?.focus();
   });
   return (
      <div className="row" style={{ padding: "2px" }}>
         <Tippy content={ChatChannels[options.chatSendChannel]}>
            <div
               className="language-switch pointer"
               onClick={() => {
                  showModal(<SelectChatChannelModal />);
               }}
            >
               {options.chatSendChannel.toUpperCase()}
            </div>
         </Tippy>
         <input
            ref={chatInput}
            className={classNames({ f1: true, "is-chat-command": chat.startsWith("/") })}
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
   );
}

function ChatMessage({
   user,
   chat,
   showChannel,
   onImageLoaded,
}: {
   user: IUser | null;
   chat: IClientChat;
   showChannel: boolean;
   onImageLoaded: () => void;
}): React.ReactNode {
   return (
      <div
         className={classNames({
            "chat-message-item": true,
            "is-even": chat.id % 2 === 0,
            "mentions-me": user
               ? chat.message.toLowerCase().includes(`@${user.handle.toLowerCase()} `) ||
                 hasFlag(chat.attr, ChatAttributes.Announce)
               : false,
         })}
      >
         {chat.name === user?.handle ? (
            <div className="row text-small text-desc">
               <div>{new Date(chat.time ?? 0).toLocaleTimeString()}</div>
               {showChannel ? <div className="chat-channel">{chat.channel}</div> : null}
               <div className="f1"></div>
               <div className="text-strong">{chat.name}</div>
               <Tippy content={getCountryName(chat.flag)}>
                  <img src={getFlagUrl(chat.flag)} className="player-flag game-cursor" />
               </Tippy>
               {chat.level > 0 ? (
                  <Tippy content={AccountLevelNames[chat.level]()}>
                     <img src={AccountLevelImages[chat.level]} className="player-flag game-cursor" />
                  </Tippy>
               ) : null}
               {hasFlag(chat.attr, ChatAttributes.Mod) ? (
                  <Tippy content={t(L.AccountLevelCensor)}>
                     <img src={AccountLevelMod} className="player-flag game-cursor" />
                  </Tippy>
               ) : null}
            </div>
         ) : (
            <div className="row text-small text-desc">
               <div className="pointer" onClick={() => SetChatInput.emit((old) => `@${chat.name} ${old}`)}>
                  {chat.name}
               </div>
               <Tippy content={getCountryName(chat.flag)}>
                  <img src={getFlagUrl(chat.flag)} className="player-flag game-cursor" />
               </Tippy>
               {chat.level > 0 ? (
                  <Tippy content={AccountLevelNames[chat.level]()}>
                     <img src={AccountLevelImages[chat.level]} className="player-flag game-cursor" />
                  </Tippy>
               ) : null}
               {hasFlag(chat.attr, ChatAttributes.Mod) ? (
                  <Tippy content={t(L.AccountLevelCensor)}>
                     <img src={AccountLevelMod} className="player-flag game-cursor" />
                  </Tippy>
               ) : null}
               <div className="f1"></div>
               <div>{new Date(chat.time ?? 0).toLocaleTimeString()}</div>
               {showChannel ? <div className="chat-channel">{chat.channel}</div> : null}
            </div>
         )}
         <div className="chat-message-content">
            <ChatMessageContent chat={chat} onImageLoaded={onImageLoaded} />
         </div>
      </div>
   );
}

function LatestMessage({ messages }: { messages: LocalChat[] }): React.ReactNode {
   const options = useGameOptions();
   let latestMessage: React.ReactNode = null;
   for (let i = messages.length - 1; i >= 0; --i) {
      const message = messages[i];
      if ("channel" in message) {
         latestMessage = (
            <>
               <span className="text-desc">{message.name}: </span>
               {options.chatHideLatestMessage ? message.message.replaceAll(/[\S]/g, "*") : message.message}
            </>
         );
         break;
      }
   }
   if (latestMessage === null) {
      latestMessage = t(L.ChatNoMessage);
   }
   return latestMessage;
}

const ChatMessageContent = memo(
   function ChatMessageContent({
      chat,
      onImageLoaded,
   }: { chat: IChat; onImageLoaded: () => void }): React.ReactNode {
      const message = chat.message;
      if (chat.level <= AccountLevel.Tribune && hasFlag(chat.attr, ChatAttributes.Mod)) {
         return message;
      }
      const isDomainWhitelisted =
         message.startsWith("https://i.imgur.com/") ||
         message.startsWith("https://i.gyazo.com/") ||
         message.startsWith("https://i.ibb.co/") ||
         message.startsWith("https://gcdnb.pbrd.co/") ||
         message.startsWith("https://i.postimg.cc/");
      const isExtensionWhitelisted =
         message.endsWith(".jpg") || message.endsWith(".png") || message.endsWith(".jpeg");
      if (isDomainWhitelisted && isExtensionWhitelisted) {
         return (
            <img
               className="chat-image"
               src={message}
               onClick={() => openUrl(message)}
               onLoad={onImageLoaded}
            />
         );
      }
      return message;
   },
   (p, n) => p.chat === n.chat && p.onImageLoaded === n.onImageLoaded,
);
