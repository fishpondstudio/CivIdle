/* eslint-disable no-case-declarations */
import { decode, encode } from "@msgpack/msgpack";
import { removeTrailingUndefs, rpcClient, RpcError } from "typed-rpc";
import type {
   AllMessageTypes,
   IChat,
   IChatMessage,
   IMapEntry,
   IMapMessage,
   IRPCMessage,
   ITrade,
   ITradeMessage,
   IUser,
   IWelcomeMessage,
} from "../../../server/src/Database";
import { MessageType } from "../../../server/src/Database";
import { ServerImpl } from "../../../server/src/Server";
import { getGameOptions } from "../Global";
import { forEach } from "../utilities/Helper";
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

let user: IUser | null = null;
export function getHandle() {
   return user?.handle ?? "Offline";
}

export async function changeHandle(newHandle: string) {
   if (user) {
      await client.changeHandle(newHandle);
      user.handle = newHandle;
   }
}

export const OnUserChanged = new TypedEvent<IUser | null>();
export const OnChatMessage = new TypedEvent<IChat[]>();
export const OnTradeMessage = new TypedEvent<ITrade[]>();
export const OnPlayerMapMessage = new TypedEvent<Record<string, IMapEntry>>();

let chatMessages: IChat[] = [];
const trades: Record<string, ITrade> = {};
export const playerMap: Record<string, IMapEntry> = {};

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
         rpcRequests[id] = { resolve, reject, time: Date.now() };
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

export const usePlayerMap = makeObservableHook(OnPlayerMapMessage, () => playerMap);
export const useChatMessages = makeObservableHook(OnChatMessage, () => chatMessages);
export const useTrades = makeObservableHook(OnTradeMessage, () => Object.values(trades));
export const useUser = makeObservableHook(OnUserChanged, () => user);

let reconnect = 0;
let requestId = 0;
// eslint-disable-next-line @typescript-eslint/ban-types
const rpcRequests: Record<number, { resolve: Function; reject: Function; time: number }> = {};

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

let steamTicket: string | null = null;

export async function connectWebSocket() {
   if (window.__STEAM_API_URL) {
      if (!steamTicket) {
         steamTicket = await steamClient.auth();
      }
      ws = new WebSocket(`${serverAddress}/?appId=${STEAM_APP_ID}&ticket=${steamTicket}&platform=steam`);
   } else {
      ws = new WebSocket(`${serverAddress}/?platform=web&ticket=${getGameOptions().userId}`);
   }

   ws.binaryType = "arraybuffer";

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
            user = w.user;
            OnUserChanged.emit(user);
            break;
         case MessageType.Trade:
            const t = message as ITradeMessage;
            let hasPendingClaim = false;
            if (t.upsert) {
               t.upsert.forEach((trade, id) => {
                  if (trades[id] && trades[id].fromId == user?.userId) {
                     hasPendingClaim = true;
                  }
                  trades[id] = trade;
               });
            }
            if (t.remove) {
               t.remove.forEach((id) => {
                  if (trades[id] && trades[id].fromId == user?.userId) {
                     hasPendingClaim = true;
                  }
                  delete trades[id];
               });
            }
            if (hasPendingClaim) {
               const pendingClaims = client.claimTrade();
               // TODO: Claim trades
            }
            OnTradeMessage.emit(Object.values(trades));
            break;
         case MessageType.Map:
            const m = message as IMapMessage;
            if (m.upsert) {
               forEach(m.upsert, (xy, entry) => {
                  playerMap[xy] = entry;
               });
            }
            if (m.remove) {
               m.remove.forEach((xy) => {
                  delete playerMap[xy];
               });
            }
            OnPlayerMapMessage.emit(playerMap);
            break;
         case MessageType.RPC:
            const r = message as IRPCMessage;
            handleRpcResponse(r.data);
            break;
      }
   };

   ws.onclose = (e) => {
      ws = null;
      user = null;
      OnUserChanged.emit(user);
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
         rpcRequests[id] = { resolve, reject, time: Date.now() };
      });
   },
});
