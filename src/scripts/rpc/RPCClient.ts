import { decode, encode } from "@msgpack/msgpack";
import type { ServerImpl } from "../../../server/src/Server";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import { RpcError, removeTrailingUndefs, rpcClient } from "../../../shared/thirdparty/TRPCClient";
import type {
   AllMessageTypes,
   IChat,
   IChatMessage,
   IClientMapEntry,
   IClientTrade,
   IMapMessage,
   IPendingClaimMessage,
   IRPCMessage,
   ITradeMessage,
   IUser,
   IWelcomeMessage,
} from "../../../shared/utilities/Database";
import { AccountLevel, ChatAttributes, MessageType } from "../../../shared/utilities/Database";
import { vacuumChat } from "../../../shared/utilities/DatabaseShared";
import { SECOND, forEach, hasFlag } from "../../../shared/utilities/Helper";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";
import { L, t } from "../../../shared/utilities/i18n";
import { saveGame } from "../Global";
import { showToast } from "../ui/GlobalModal";
import { makeObservableHook } from "../utilities/Hook";
import { playBubble, playKaching } from "../visuals/Sound";
import { SteamClient, isSteam } from "./SteamClient";

const url = new URLSearchParams(window.location.search);
const devServerAddress = url.get("server") ?? "ws://localhost:8000";
const serverAddress = import.meta.env.DEV ? devServerAddress : "wss://de.cividle.com";

let user: IUser | null = null;

export const OnOfflineTime = new TypedEvent<number>();
export const OnUserChanged = new TypedEvent<IUser | null>();
export const OnChatMessage = new TypedEvent<LocalChat[]>();
export const OnTradeMessage = new TypedEvent<IClientTrade[]>();
export const OnPlayerMapChanged = new TypedEvent<Map<string, IClientMapEntry>>();
export const OnPlayerMapMessage = new TypedEvent<IMapMessage>();
export const OnNewPendingClaims = new TypedEvent<void>();

export interface IClientChat extends IChat {
   id: number;
}

interface ISystemMessage {
   id: number;
   message: string;
}

export type LocalChat = IClientChat | ISystemMessage;

let chatMessages: LocalChat[] = [];
const trades: Map<string, IClientTrade> = new Map();
const playerMap: Map<string, IClientMapEntry> = new Map();

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

function getTrades(): IClientTrade[] {
   return Array.from(trades.values()).filter(
      (trade) => Config.Resource[trade.buyResource] && Config.Resource[trade.sellResource],
   );
}

export const usePlayerMap = makeObservableHook(OnPlayerMapChanged, () => playerMap);
export const useChatMessages = makeObservableHook(OnChatMessage, () => chatMessages);
export const useTrades = makeObservableHook(OnTradeMessage, getTrades);
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

// TODO: Need to properly implement this after supporting offline run
export function canEarnGreatPeopleFromReborn(): boolean {
   if (isOnlineUser()) {
      getGameState().isOffline = false;
   } else {
      getGameState().isOffline = true;
   }
   return true;
}

let chatId = 0;

export function addSystemMessage(message: string): void {
   chatMessages.push({ id: ++chatId, message });
   OnChatMessage.emit(chatMessages);
}

let reconnect = 0;
let requestId = 0;
// biome-ignore lint/complexity/noBannedTypes: <explanation>
const rpcRequests: Record<number, { resolve: Function; reject: Function; time: number }> = {};

let steamTicket: string | null = null;
let steamTicketTime = 0;

export async function connectWebSocket(): Promise<number> {
   if (isSteam()) {
      if (!steamTicket || Date.now() - steamTicketTime > 30 * SECOND) {
         steamTicket = await SteamClient.getAuthSessionTicket();
         steamTicketTime = Date.now();
      }
      getGameOptions().id = `steam:${await SteamClient.getSteamId()}`;
      ws = new WebSocket(
         `${serverAddress}/?appId=${await SteamClient.getAppId()}&ticket=${steamTicket}&platform=steam&steamId=${await SteamClient.getSteamId()}`,
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
               chatMessages = c.chat.map((c) => ({ ...c, id: ++chatId }));
            } else {
               c.chat.forEach((m) => {
                  const mentionsMe =
                     user && m.message.toLowerCase().includes(`@${user.handle.toLowerCase()} `);
                  const isAnnounce = hasFlag(m.attr, ChatAttributes.Announce);
                  if (mentionsMe || isAnnounce) {
                     playBubble();
                     showToast(`${m.name}: ${m.message}`);
                  }
                  chatMessages.push({ ...m, id: ++chatId });
               });
            }
            chatMessages = vacuumChat(chatMessages);
            OnChatMessage.emit(chatMessages);
            break;
         }
         case MessageType.Welcome: {
            const w = message as IWelcomeMessage;
            user = w.user;
            getGameOptions().token = w.user.token;
            saveGame().catch(console.error);
            OnUserChanged.emit({ ...user });
            const offlineTick = w.lastGameTick + w.offlineTime - getGameState().tick;
            OnOfflineTime.emit(Math.min(w.offlineTime, offlineTick));
            break;
         }
         case MessageType.Trade: {
            const tm = message as ITradeMessage;
            if (tm.upsert) {
               tm.upsert.forEach((trade) => {
                  trades.set(trade.id, trade);
               });
            }
            if (tm.remove) {
               tm.remove.forEach((id) => {
                  trades.delete(id);
               });
            }
            OnTradeMessage.emit(getTrades());
            break;
         }
         case MessageType.Map: {
            const m = message as IMapMessage;
            if (m.upsert) {
               forEach(m.upsert, (xy, entry) => {
                  playerMap.set(xy, entry);
               });
            }
            if (m.remove) {
               m.remove.forEach((xy) => {
                  playerMap.delete(xy);
               });
            }
            OnPlayerMapChanged.emit({ ...playerMap });
            OnPlayerMapMessage.emit(m);
            break;
         }
         case MessageType.PendingClaim: {
            const r = message as IPendingClaimMessage;
            if (user && r.claims[user.userId]) {
               playKaching();
               showToast(t(L.PlayerTradeClaimAvailable, { count: r.claims[user.userId] }));
               OnNewPendingClaims.emit();
            }
            break;
         }
         case MessageType.RPC: {
            const r = message as IRPCMessage;
            handleRpcResponse(r.data);
            break;
         }
      }
   };

   ws.onopen = () => {
      reconnect = 0;
   };

   ws.onclose = () => {
      ws = null;
      user = null;
      OnUserChanged.emit(null);
      setTimeout(connectWebSocket, Math.min(Math.pow(2, reconnect++) * SECOND, 16 * SECOND));
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
