import { rpcClient } from "typed-rpc";
import { IChat, IChatMessage, MessageType } from "../../../server/src/Database";
import { ServerImpl } from "../../../server/src/Server";
import { makeObservableHook } from "../utilities/Hook";
import { TypedEvent } from "../utilities/TypedEvent";

export const client = rpcClient<ServerImpl>("http://localhost:8000/rpc");

export const OnChatMessage = new TypedEvent<IChat[]>();
export const OnConnectionChanged = new TypedEvent<boolean>();

let chatMessages: IChat[] = [];

let ws: WebSocket | null = null;

function isConnected() {
   return ws !== null;
}

export const useIsConnected = makeObservableHook(OnConnectionChanged, isConnected());
export const useChatMessages = makeObservableHook(OnChatMessage, chatMessages);

function connect() {
   ws = new WebSocket("ws://localhost:8000/");

   ws.onopen = (e) => {
      OnConnectionChanged.emit(true);
   };

   ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      const type = message.type as MessageType;
      if (type === "chat") {
         const c = message as IChatMessage;
         if (c.flush) {
            chatMessages = c.chat;
         } else {
            chatMessages = chatMessages.concat(c.chat);
         }
         OnChatMessage.emit(chatMessages);
      }
   };

   ws.onclose = (e) => {
      ws = null;
      OnConnectionChanged.emit(false);
      setTimeout(connect, 5000);
   };
}

connect();
