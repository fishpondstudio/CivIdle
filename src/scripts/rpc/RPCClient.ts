import { rpcClient } from "typed-rpc";
import { v4 } from "uuid";
import type { IPCService } from "../../../electron/src/ipc";
import { IChat, IChatMessage, MessageType } from "../../../server/src/Database";
import { ServerImpl } from "../../../server/src/Server";
import { hasIPCBridge, IPCClient } from "../native/IPCClient";
import { makeObservableHook } from "../utilities/Hook";
import { TypedEvent } from "../utilities/TypedEvent";

let sessionId = "";

export const client = rpcClient<ServerImpl>("http://localhost:8000/rpc", {
   getHeaders() {
      return { "Session-Id": sessionId };
   },
});

const ipcClient = IPCClient<IPCService>();

export async function signIn() {
   if (hasIPCBridge()) {
      const appId = await ipcClient.getAppID();
      const ticket = await ipcClient.getAuthSessionTicket();
      sessionId = await client.signIn({ platform: "steam", appId, ticket });
   } else {
      sessionId = v4();
   }
   connectWebSocket();
}

export const OnChatMessage = new TypedEvent<IChat[]>();
export const OnConnectionChanged = new TypedEvent<boolean>();

let chatMessages: IChat[] = [];

let ws: WebSocket | null = null;

function isConnected() {
   return ws !== null;
}

export const useIsConnected = makeObservableHook(OnConnectionChanged, isConnected());
export const useChatMessages = makeObservableHook(OnChatMessage, chatMessages);

function connectWebSocket() {
   ws = new WebSocket(`ws://localhost:8000/?session=${sessionId}`);

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
      setTimeout(connectWebSocket, 5000);
   };
}
