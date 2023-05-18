/* eslint-disable no-case-declarations */
import { decode, encode } from "@msgpack/msgpack";
import { removeTrailingUndefs, rpcClient, RpcError } from "typed-rpc";
import { v4 } from "uuid";
import type { AllMessageTypes, IChat, IChatMessage, IRPCMessage, IWelcomeMessage } from "../../../server/src/Database";
import { MessageType } from "../../../server/src/Database";
import { ServerImpl } from "../../../server/src/Server";
import { makeObservableHook } from "../utilities/Hook";
import { TypedEvent } from "../utilities/TypedEvent";

const serverAddress = import.meta.env.DEV ? "ws://localhost:8000" : "wss://api.cividle.com";
// const serverAddress = "wss://api.cividle.com";

// export const ipcClient = rpcClient<IPCService>({
//    request: (method: string, params: any[]) => {
//       if (typeof IPCBridge === "undefined") {
//          throw new Error(`IPCBridge is not defined: ${method}(${params})`);
//       }
//       return IPCBridge.rpcCall(method, params);
//    },
// });

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
let steamWs: WebSocket | null = null;

export const client = rpcClient<ServerImpl>({
   request: (method: string, params: any[]) => {
      return new Promise((resolve, reject) => {
         const id = ++requestId;
         if (!ws) {
            return reject("WebSocket is not ready yet");
         }
         const request = {
            jsonrpc: "2.0",
            id: id,
            method,
            params: removeTrailingUndefs(params),
         };
         ws.send(encode(request));
         rpcRequests[id] = { request: JSON.stringify(request), resolve, reject, time: Date.now() };
      });
   },
});

interface ISteamClient {
   player(): { steamId: string; name: string; phoneVerified: boolean; isSteamDeck: boolean };
   auth(): string;
   fileRead(name: string): string;
   fileWrite(name: string, content: string): void;
   fileDelete(name: string): void;
   getBetaName(): string;
}

function isConnected() {
   return ws !== null;
}

export const useIsConnected = makeObservableHook(OnConnectionChanged, isConnected());
export const useChatMessages = makeObservableHook(OnChatMessage, chatMessages);

let reconnect = 0;
let requestId = 0;
// eslint-disable-next-line @typescript-eslint/ban-types
const rpcRequests: Record<number, { request: string; resolve: Function; reject: Function; time: number }> = {};

const STEAM_APP_ID = 2181940;

export function initSteamClient(url: string): Promise<void> {
   return new Promise((resolve, reject) => {
      steamWs = new WebSocket(url);
      steamWs.onopen = () => {
         resolve();
      };
      steamWs.onmessage = (e) => {
         handleRpcResponse(JSON.parse(e.data));
      };
      steamWs.onclose = () => {
         steamWs = null;
         reject();
      };
      steamWs.onerror = () => {
         steamWs = null;
         reject();
      };
   });
}

export async function connectWebSocket() {
   if (window.__STEAM_API_URL) {
      const ticket = await steamClient.auth();
      ws = new WebSocket(`${serverAddress}/?appId=${STEAM_APP_ID}&ticket=${ticket}&platform=steam`);
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
            handleRpcResponse(r.data);
            break;
      }
   };

   ws.onclose = (e) => {
      ws = null;
      OnConnectionChanged.emit(false);
      setTimeout(connectWebSocket, Math.min(++reconnect * 1000, 5000));
   };
}

function handleRpcResponse(response: any) {
   if (!response || !response.id) {
      throw new Error(`Invalid RPC Response received: ${response}`);
   }
   if (!rpcRequests[response.id]) {
      throw new Error(`RPC Request ${response.id} is already handled`);
   }
   const { resolve, reject } = rpcRequests[response.id];
   delete rpcRequests[response.id];
   const { result, error } = response;
   if (error) {
      const { code, message, data } = error;
      reject(new RpcError(message, code, data));
   }
   resolve(result);
}

export const steamClient = rpcClient<ISteamClient>({
   request: (method: string, params: any[]) => {
      return new Promise((resolve, reject) => {
         const id = ++requestId;
         if (!steamWs) {
            return reject("WebSocket is not ready yet");
         }
         const request = JSON.stringify({
            jsonrpc: "2.0",
            id: id,
            method,
            params: removeTrailingUndefs(params),
         });
         steamWs.send(request);
         rpcRequests[id] = { request, resolve, reject, time: Date.now() };
      });
   },
});
