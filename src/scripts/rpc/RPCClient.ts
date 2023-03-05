import { decode, encode } from "@msgpack/msgpack";
import { removeTrailingUndefs, rpcClient, RpcError } from "typed-rpc";
import { v4 } from "uuid";
import type { IPCService } from "../../../electron/src/IPCService";
import type { AllMessageTypes, IChat, IChatMessage, IRPCMessage, IWelcomeMessage } from "../../../server/src/Database";
import { MessageType } from "../../../server/src/Database";
import { ServerImpl } from "../../../server/src/Server";
import { makeObservableHook } from "../utilities/Hook";
import { TypedEvent } from "../utilities/TypedEvent";

// const serverAddress = import.meta.env.DEV ? "ws://localhost:8000" : "wss://api.cividle.com";
const serverAddress = "wss://api.cividle.com";

export function hasIPCBridge() {
   return typeof IPCBridge !== "undefined";
}

export const ipcClient = rpcClient<IPCService>({
   request: (method: string, params: any[]) => {
      if (typeof IPCBridge === "undefined") {
         throw new Error(`IPCBridge is not defined: ${method}(${params})`);
      }
      return IPCBridge.rpcCall(method, params);
   },
});

let handle = "Offline";
export function getHandle() {
   return handle;
}

export async function changeHandle(newHandle: string) {
   await client.changeHandle(newHandle);
   handle = newHandle;
}

export const OnChatMessage = new TypedEvent<IChat[]>();
export const OnConnectionChanged = new TypedEvent<boolean>();

let chatMessages: IChat[] = [];

let ws: WebSocket | null = null;

export const client = rpcClient<ServerImpl>({
   request: (method: string, params: any[]) => {
      const id = ++requestId;
      if (!ws) {
         return Promise.reject("WebSocket is not ready yet");
      }
      ws.send(
         encode({
            jsonrpc: "2.0",
            id: id,
            method,
            params: removeTrailingUndefs(params),
         })
      );
      return new Promise((resolve, reject) => {
         rpcRequests[id] = { resolve, reject, time: Date.now() };
      });
   },
});

function isConnected() {
   return ws !== null;
}

export const useIsConnected = makeObservableHook(OnConnectionChanged, isConnected());
export const useChatMessages = makeObservableHook(OnChatMessage, chatMessages);

let reconnect = 0;
let requestId = 0;
const rpcRequests: Record<number, { resolve: Function; reject: Function; time: number }> = {};

export async function connectWebSocket() {
   if (hasIPCBridge()) {
      const appId = await ipcClient.getAppID();
      const ticket = await ipcClient.getAuthSessionTicket();
      ws = new WebSocket(`${serverAddress}/?appId=${appId}&ticket=${ticket}&platform=steam`);
   } else {
      ws = new WebSocket(`${serverAddress}/?platform=web&ticket=${v4()}`);
   }

   ws.binaryType = "arraybuffer";

   ws.onopen = async (e) => {
      OnConnectionChanged.emit(true);
   };

   ws.onmessage = (e) => {
      const message = decode(e.data as ArrayBuffer) as AllMessageTypes;
      const type = message.type as MessageType;
      switch (type) {
         case MessageType.Chat:
            const c = message as IChatMessage;
            if (c.flush) {
               chatMessages = c.chat;
            } else {
               chatMessages = chatMessages.concat(c.chat);
            }
            OnChatMessage.emit(chatMessages);
            break;
         case MessageType.Welcome:
            const w = message as IWelcomeMessage;
            handle = w.user.handle;
            break;
         case MessageType.RPC:
            const r = message as IRPCMessage;
            if (!r.data || !r.data.id) {
               throw new Error(`Invalid RPC Response received: ${r}`);
            }
            if (!rpcRequests[r.data.id]) {
               throw new Error(`RPC Request ${r.data.id} is already handled`);
            }
            const { resolve, reject } = rpcRequests[r.data.id];
            delete rpcRequests[r.data.id];
            const { result, error } = r.data;
            if (error) {
               const { code, message, data } = error;
               reject(new RpcError(message, code, data));
            }
            resolve(result);
            break;
      }
   };

   ws.onclose = (e) => {
      ws = null;
      OnConnectionChanged.emit(false);
      setTimeout(connectWebSocket, Math.min(++reconnect * 1000, 5000));
   };
}
