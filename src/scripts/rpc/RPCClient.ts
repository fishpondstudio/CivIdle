import { useEffect, useState } from "react";
import { rpcClient } from "typed-rpc";
import { IChat, IChatMessage, MessageType } from "../../../server/src/Database";
import { ServerImpl } from "../../../server/src/Server";
import { TypedEvent } from "../utilities/TypedEvent";

export const client = rpcClient<ServerImpl>("http://localhost:8000/rpc");

export const OnChatMessage = new TypedEvent<IChat[]>();
let chatMessages: IChat[] = [];

export function useChatMessages() {
   const [getMessages, setMessages] = useState(chatMessages);
   useEffect(() => {
      function handleChatMessage(chat: IChat[]) {
         setMessages(chat);
      }
      OnChatMessage.on(handleChatMessage);
      return () => {
         OnChatMessage.off(handleChatMessage);
      };
   }, []);
   return getMessages;
}

let ws = new WebSocket("ws://localhost:8000/");
ws.onmessage = (e) => {
   const message = JSON.parse(e.data);
   const type = message.type as MessageType;
   if (type === "chat") {
      const c = message as IChatMessage;
      chatMessages = chatMessages.concat(c.chat);
      OnChatMessage.emit(chatMessages);
   }
};

ws.onclose = (e) => {
   setTimeout(() => {
      ws = new WebSocket("ws://localhost:8000/");
   }, 5000);
};
