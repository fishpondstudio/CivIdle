import { decode, encode } from "@msgpack/msgpack";
import type { ServerImpl } from "../../../server/src/Server";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import { RpcError, removeTrailingUndefs, rpcClient } from "../../../shared/thirdparty/TRPCClient";
import type {
   AllMessageTypes,
   IChat,
   IChatMessage,
   IClientMapEntry,
   IClientTrade,
   IMapMessage,
   IRPCMessage,
   ITradeMessage,
   IUser,
   IWelcomeMessage,
} from "../../../shared/utilities/Database";
import { AccountLevel, MessageType } from "../../../shared/utilities/Database";
import { forEach } from "../../../shared/utilities/Helper";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";
import { L, t } from "../../../shared/utilities/i18n";
import { saveGame } from "../Global";
import { showToast } from "../ui/GlobalModal";
import { makeObservableHook } from "../utilities/Hook";
import { playBubble, playKaching } from "../visuals/Sound";
import { SteamClient, isSteam } from "./SteamClient";

const url = new URLSearchParams(window.location.search);
const devServerAddress = url.get("server") ?? "ws://localhost:8000";
const serverAddress = import.meta.env.DEV ? devServerAddress : "wss://api.cividle.com";
// const serverAddress = "wss://api.cividle.com";

let user: IUser | null = null;

export const OnOfflineTime = new TypedEvent<number>();
export const OnUserChanged = new TypedEvent<IUser | null>();
export const OnChatMessage = new TypedEvent<LocalChat[]>();
export const OnTradeMessage = new TypedEvent<IClientTrade[]>();
export const OnPlayerMapChanged = new TypedEvent<Record<string, IClientMapEntry>>();
export const OnPlayerMapMessage = new TypedEvent<IMapMessage>();
export const OnNewPendingClaims = new TypedEvent<void>();

export type LocalChat = IChat | string;

let chatMessages: LocalChat[] = [];
const trades: Record<string, IClientTrade> = {};
const playerMap: Record<string, IClientMapEntry> = {};

export function getPlayerMap() {
   return playerMap;
}

let ws: WebSocket | null = null;

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

export const usePlayerMap = makeObservableHook(OnPlayerMapChanged, () => playerMap);
export const useChatMessages = makeObservableHook(OnChatMessage, () => chatMessages);
export const useTrades = makeObservableHook(OnTradeMessage, () => Object.values(trades));
export const useUser = makeObservableHook(OnUserChanged, getUser);

function getUser(): IUser | null {
   return user;
}

export function isOnlineUser(): boolean {
   return (user?.level ?? AccountLevel.Tribune) > AccountLevel.Tribune;
}

export function getUserLevel(): AccountLevel {
   return user?.level ?? AccountLevel.Tribune;
}

export function canEarnGreatPeopleFromReborn(): boolean {
   if (isOnlineUser()) {
      return !getGameState().isOffline;
   }
   return true;
}

export function addSystemMessage(message: string): void {
   chatMessages.push(message);
   OnChatMessage.emit(chatMessages);
}

let reconnect = 0;
let requestId = 0;
// biome-ignore lint/complexity/noBannedTypes: <explanation>
const rpcRequests: Record<number, { resolve: Function; reject: Function; time: number }> = {};

let steamTicket: string | null = null;

export async function connectWebSocket(): Promise<number> {
   if (isSteam()) {
      if (!steamTicket) {
         steamTicket = await SteamClient.getAuthSessionTicket();
      }
      getGameOptions().id = `steam:${await SteamClient.getSteamId()}`;
      ws = new WebSocket(
         `${serverAddress}/?appId=${await SteamClient.getAppID()}&ticket=${steamTicket}&platform=steam`,
      );
   } else {
      const token = `${getGameOptions().id}:${getGameOptions().token ?? getGameOptions().id}`;
      ws = new WebSocket(`${serverAddress}/?platform=web&ticket=${token}`);
   }

   if (!ws) {
      return Promise.reject("Failed to initialize WebSocket");
   }

   ws.binaryType = "arraybuffer";

   ws.onmessage = (e) => {
      const message = decode(e.data as ArrayBuffer) as AllMessageTypes;
      const type = message.type as MessageType;
      switch (type) {
         case MessageType.Chat: {
            const c = message as IChatMessage;
            if (c.flush) {
               chatMessages = c.chat;
            } else {
               c.chat.forEach((m) => {
                  if (user && m.message.includes(`@${user!.handle} `)) {
                     playBubble();
                     showToast(`${m.name}: ${m.message}`);
                  }
                  chatMessages.push(m);
               });
            }
            OnChatMessage.emit(chatMessages);
            break;
         }
         case MessageType.Welcome: {
            const w = message as IWelcomeMessage;
            user = w.user;
            if (user.level <= AccountLevel.Tribune) {
               getGameState().isOffline = true;
            }
            getGameOptions().token = w.user.token;
            saveGame(false).catch(console.error);
            OnUserChanged.emit({ ...user });
            OnOfflineTime.emit(w.offlineTime);
            break;
         }
         case MessageType.Trade: {
            const tm = message as ITradeMessage;
            let pendingClaims = 0;
            if (tm.upsert) {
               tm.upsert.forEach((trade) => {
                  if (trades[trade.id] && trades[trade.id].fromId === user?.userId) {
                     pendingClaims++;
                  }
                  trades[trade.id] = trade;
               });
            }
            if (tm.remove) {
               tm.remove.forEach((id) => {
                  if (trades[id] && trades[id].fromId === user?.userId) {
                     pendingClaims++;
                  }
                  delete trades[id];
               });
            }
            if (pendingClaims > 0) {
               playKaching();
               showToast(t(L.PlayerTradeClaimAvailable, { count: pendingClaims }));
               OnNewPendingClaims.emit();
            }
            OnTradeMessage.emit(Object.values(trades));
            break;
         }
         case MessageType.Map: {
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
            OnPlayerMapChanged.emit({ ...playerMap });
            OnPlayerMapMessage.emit(m);
            break;
         }
         case MessageType.RPC: {
            const r = message as IRPCMessage;
            handleRpcResponse(r.data);
            break;
         }
      }
   };

   ws.onclose = (e) => {
      ws = null;
      user = null;
      OnUserChanged.emit(null);
      setTimeout(connectWebSocket, Math.min(++reconnect * 1000, 5000));
   };

   return new Promise<number>((resolve, reject) => {
      OnOfflineTime.once((e) => resolve(e));
   });
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
