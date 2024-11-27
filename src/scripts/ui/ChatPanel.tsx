import Tippy from "@tippyjs/react";
import classNames from "classnames";
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import {
   AccountLevel,
   ChatAttributes,
   ChatChannels,
   ChatMaxChars,
   UserColorsMapping,
   type ChatChannel,
   type IChat,
   type IUser,
} from "../../../shared/utilities/Database";
import { firstKeyOf, hasFlag } from "../../../shared/utilities/Helper";
import { censor } from "../../../shared/utilities/ProfanityFilter";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";
import { L, t } from "../../../shared/utilities/i18n";
import AccountLevelMod from "../../images/AccountLevelMod.png";
import Supporter from "../../images/Supporter.png";
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
import { showToast } from "./GlobalModal";
import { RenderHTML } from "./RenderHTMLComponent";
import { SelectChatChannelModal } from "./SelectChatChannelModal";
import { isIOS } from "../utilities/Platforms";

const SetChatInput = new TypedEvent<{ channel: ChatChannel; getContent: (old: string) => string }>();

export function ChatPanel(): React.ReactNode {
   const options = useGameOptions();
   if (options.chatChannels.size === 0) {
      options.chatChannels.add(firstKeyOf(ChatChannels)!);
   }
   const messages = useChatMessages().filter((m) => !("channel" in m) || options.chatChannels.has(m.channel));
   const [isPending, startTransition] = useTransition();
   const [showChatWindow, setShowChatWindow] = useState(false);
   const user = useUser();

   useTypedEvent(ToggleChatWindow, (on) => {
      setShowChatWindow(on);
   });

   const style: React.CSSProperties = { contentVisibility: showChatWindow ? "visible" : "hidden" };

   if (!CSS.supports("content-visibility", "visible") || !CSS.supports("content-visibility", "hidden")) {
      style.display = showChatWindow ? "flex" : "none";
   }

   return (
      <div
         className={classNames({ "chat-bar window": true, "last-message": !options.chatHideLatestMessage })}
      >
         <div
            className="row pointer"
            style={{ width: "100%", height: "100%", padding: "0 5px" }}
            onClick={() => startTransition(() => setShowChatWindow(!showChatWindow))}
         >
            <img
               style={{
                  width: 16,
                  height: 16,
                  margin: options.chatHideLatestMessage ? 0 : "0 5px 0 0",
               }}
               src={user != null ? chatActive : chatInactive}
            />
            <div className="chat-message pointer">
               <LatestMessage messages={messages} />
            </div>
         </div>
         <div style={style}>
            {Array.from(options.chatChannels).map((channel, i) => (
               <ChatWindow
                  style={{ left: 350 * i }}
                  key={channel}
                  channel={channel}
                  show={showChatWindow}
                  onClose={() =>
                     startTransition(() => {
                        if (options.chatChannels.size <= 1) {
                           setShowChatWindow(false);
                        } else {
                           options.chatChannels.delete(channel);
                           notifyGameOptionsUpdate(options);
                        }
                     })
                  }
                  onMinimize={() => startTransition(() => setShowChatWindow(false))}
               />
            ))}
         </div>
      </div>
   );
}

function ChatWindow({
   show,
   channel,
   style,
   onClose,
   onMinimize,
}: {
   show: boolean;
   channel: ChatChannel;
   style?: React.CSSProperties;
   onClose: () => void;
   onMinimize: () => void;
}): React.ReactNode {
   const scrollAreaRef = useRef<HTMLDivElement>(null);
   const shouldScroll = useRef(false);
   const messages = useChatMessages().filter((m) => !("channel" in m) || channel === m.channel);
   const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
   const user = useUser();

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
   }, [show]);

   return (
      <div className="chat-content window" style={style}>
         <div className="title-bar">
            <div className="title-bar-text">{ChatChannels[channel]}</div>
            <div className="title-bar-controls">
               <button aria-label="Minimize" onClick={onMinimize}></button>
               <button aria-label="Close" onClick={onClose}></button>
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
               return <ChatMessage key={c.id} user={user} chat={c} onImageLoaded={onImageLoaded} />;
            })}
            {user !== null ? null : (
               <div className="text-desc text-center text-small mv10">{t(L.ChatReconnect)}</div>
            )}
         </div>
         <ChatInput
            channel={channel}
            onChatSend={() => {
               shouldScroll.current = true;
            }}
         />
      </div>
   );
}

function ChatInput({
   onChatSend,
   channel,
}: { onChatSend: (message: string) => void; channel: ChatChannel }): React.ReactNode {
   const user = useUser();
   const [chat, setChat] = useState("");
   const chatInput = useRef<HTMLInputElement>(null);
   const sendChat = () => {
      if (!chat) return;
      if (chat.startsWith("/")) {
         const command = chat.substring(1);
         addSystemMessage(`$ ${command}`);
         handleChatCommand(command).catch((e) => addSystemMessage(`${command}: ${e}`));
      } else {
         client.chat(censor(chat), channel).catch((e) => {
            playError();
            showToast(String(e));
         });
      }
      onChatSend(chat);
      setChat("");
   };
   useTypedEvent(SetChatInput, (e) => {
      if (e.channel === channel) {
         setChat(e.getContent);
         chatInput.current?.focus();
      }
   });
   const [showChatChannel, setShowChatChannel] = useState(false);
   return (
      <div className="row" style={{ padding: "2px", position: "relative" }}>
         <SelectChatChannelModal
            show={showChatChannel}
            style={{ position: "absolute", bottom: "100%", left: 0 }}
            onClose={() => setShowChatChannel(false)}
         />
         <Tippy content={ChatChannels[channel]}>
            <div
               className="language-switch pointer"
               onClick={() => {
                  setShowChatChannel(!showChatChannel);
               }}
            >
               {channel.toUpperCase()}
            </div>
         </Tippy>
         <input
            ref={chatInput}
            className={classNames({ "f1 w100": true, "is-chat-command": chat.startsWith("/") })}
            type="text"
            style={{ margin: "0 2px 0 0" }}
            value={chat}
            onInput={(e) => {
               setChat(e.currentTarget.value);
            }}
            maxLength={ChatMaxChars[user?.level ?? AccountLevel.Tribune]}
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
   onImageLoaded,
}: {
   user: IUser | null;
   chat: IClientChat;
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
               <div className="f1"></div>
               <div style={{ color: UserColorsMapping.get(chat.color) ?? undefined }} className="text-strong">
                  {chat.name}
               </div>
               <Tippy content={getCountryName(chat.flag)}>
                  <img src={getFlagUrl(chat.flag)} className="player-flag" />
               </Tippy>
               {chat.level > 0 ? (
                  <Tippy content={AccountLevelNames[chat.level]()}>
                     <img src={AccountLevelImages[chat.level]} className="player-flag" />
                  </Tippy>
               ) : null}
               {hasFlag(chat.attr, ChatAttributes.Supporter) ? (
                  <Tippy content={t(L.AccountSupporter)}>
                     <img src={Supporter} className="player-flag" />
                  </Tippy>
               ) : null}
               {hasFlag(chat.attr, ChatAttributes.Mod) ? (
                  <Tippy content={t(L.AccountLevelMod)}>
                     <img src={AccountLevelMod} className="player-flag" />
                  </Tippy>
               ) : null}
            </div>
         ) : (
            <div className="row text-small text-desc">
               <div
                  style={{ color: UserColorsMapping.get(chat.color) ?? undefined }}
                  className="pointer"
                  onClick={() =>
                     SetChatInput.emit({ getContent: (old) => `@${chat.name} ${old}`, channel: chat.channel })
                  }
               >
                  {chat.name}
               </div>
               <Tippy content={getCountryName(chat.flag)}>
                  <img src={getFlagUrl(chat.flag)} className="player-flag" />
               </Tippy>
               {chat.level > 0 ? (
                  <Tippy content={AccountLevelNames[chat.level]()}>
                     <img src={AccountLevelImages[chat.level]} className="player-flag" />
                  </Tippy>
               ) : null}
               {hasFlag(chat.attr, ChatAttributes.Supporter) ? (
                  <Tippy content={t(L.AccountSupporter)}>
                     <img src={Supporter} className="player-flag" />
                  </Tippy>
               ) : null}
               {hasFlag(chat.attr, ChatAttributes.Mod) ? (
                  <Tippy content={t(L.AccountLevelMod)}>
                     <img src={AccountLevelMod} className="player-flag" />
                  </Tippy>
               ) : null}
               <div className="f1"></div>
               <div>{new Date(chat.time ?? 0).toLocaleTimeString()}</div>
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
   if (options.chatHideLatestMessage) {
      return null;
   }
   let latestMessage: React.ReactNode = null;
   for (let i = messages.length - 1; i >= 0; --i) {
      const message = messages[i];
      if ("channel" in message) {
         latestMessage = (
            <>
               <span className="text-desc">{message.name}: </span>
               {message.message}
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
      if (chat.level <= AccountLevel.Tribune && !hasFlag(chat.attr, ChatAttributes.Mod)) {
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
               className="chat-image pointer"
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
