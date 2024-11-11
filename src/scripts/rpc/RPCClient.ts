import { Capacitor, registerPlugin } from "@capacitor/core";
import { decode, encode } from "@msgpack/msgpack";
import { CapacitorGameConnect } from "@openforge/capacitor-game-connect";
import type { ServerImpl } from "../../../server/src/Server";
import { addPetraOfflineTime } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { GOOGLE_PLAY_GAMES_CLIENT_ID } from "../../../shared/logic/Constants";
import { checksum, getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
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
import {
   AccountLevel,
   ChatAttributes,
   MessageType,
   ServerWSErrorCode,
} from "../../../shared/utilities/Database";
import { vacuumChat } from "../../../shared/utilities/DatabaseShared";
import { SECOND, clamp, forEach, hasFlag, uuid4 } from "../../../shared/utilities/Helper";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";
import { L, t } from "../../../shared/utilities/i18n";
import { saveGame } from "../Global";
import { getBuildNumber, getVersion } from "../logic/Version";
import { showToast } from "../ui/GlobalModal";
import { makeObservableHook } from "../utilities/Hook";
import { playBubble, playKaching } from "../visuals/Sound";
import { SteamClient, isSteam } from "./SteamClient";

let user: IUser | null = null;

export const OnUserChanged = new TypedEvent<IUser | null>();
export const OnChatMessage = new TypedEvent<LocalChat[]>();
export const OnTradeChanged = new TypedEvent<IClientTrade[]>();
export const OnPlayerMapChanged = new TypedEvent<Map<string, IClientMapEntry>>();
export const OnPlayerMapMessage = new TypedEvent<IMapMessage>();
export const OnNewPendingClaims = new TypedEvent<void>();

export interface PlayGamesPlugin {
   requestServerSideAccess: (opt: { clientId: string }) => Promise<{ serverAuthToken: string }>;
}

const PlayGames = registerPlugin<PlayGamesPlugin>("PlayGames");

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
         if (!ws || ws.readyState !== WebSocket.OPEN) {
            return reject("WebSocket is not ready yet");
         }
         const id = ++requestId;
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

function getServerAddress(): string {
   if (import.meta.env.DEV) {
      const url = new URLSearchParams(window.location.search);
      return url.get("server") ?? "ws://192.168.3.12:8000";
   }
   if (getGameOptions().useMirrorServer) {
      return "wss://api.cividle.com";
   }
   return "wss://de.cividle.com";
}

export function getTrades(): IClientTrade[] {
   return Array.from(trades.values()).filter((trade) => {
      if (Config.Resource[trade.buyResource] && Config.Resource[trade.sellResource]) {
         return true;
      }
      return false;
   });
}

export const usePlayerMap = makeObservableHook(OnPlayerMapChanged, () => playerMap);
export const useChatMessages = makeObservableHook(OnChatMessage, () => chatMessages);
export const useTrades = makeObservableHook(OnTradeChanged, getTrades);
export const useUser = makeObservableHook(OnUserChanged, getUser);

export function getUser(): IUser | null {
   return user;
}

export function isOnlineUser(): boolean {
   if (import.meta.env.DEV) {
      return true;
   }
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

export function clearSystemMessages(): void {
   chatMessages = chatMessages.filter((c) => "channel" in c);
   OnChatMessage.emit(chatMessages);
}

let reconnect = 0;
let requestId = 0;
// biome-ignore lint/complexity/noBannedTypes: <explanation>
const rpcRequests: Record<number, { resolve: Function; reject: Function; time: number }> = {};

let steamTicket: string | null = null;
let steamTicketTime = 0;

export async function connectWebSocket(): Promise<number> {
   const platform = Capacitor.getPlatform();
   if (isSteam()) {
      if (!steamTicket || Date.now() - steamTicketTime > 30 * SECOND) {
         steamTicket = await SteamClient.getAuthSessionTicket();
         steamTicketTime = Date.now();
      }
      const steamId = await SteamClient.getSteamId();
      if (!getGameOptions().userId) {
         getGameOptions().userId = `steam:${steamId}`;
      }
      const params = [
         `appId=${await SteamClient.getAppId()}`,
         `ticket=${steamTicket}`,
         "platform=steam",
         `steamId=${steamId}`,
         `userId=${getGameOptions().userId}`,
         `version=${getVersion()}`,
         `build=${getBuildNumber()}`,
         `gameId=${getGameState().id}`,
         `checksum=${checksum.expected}${checksum.actual}`,
      ];
      ws = new WebSocket(`${getServerAddress()}/?${params.join("&")}`);
   } else if (platform === "android") {
      const player = await CapacitorGameConnect.signIn();
      const token = await PlayGames.requestServerSideAccess({
         clientId: GOOGLE_PLAY_GAMES_CLIENT_ID,
      });
      const params = [
         `ticket=${token.serverAuthToken}`,
         "platform=android",
         `version=${getVersion()}`,
         `build=${getBuildNumber()}`,
         `userId=${getGameOptions().userId ?? ""}`,
         `gameId=${getGameState().id}`,
         `checksum=${checksum.expected}${checksum.actual}`,
      ];
      ws = new WebSocket(`${getServerAddress()}/?${params.join("&")}`);
   } else {
      if (!getGameOptions().userId) {
         getGameOptions().userId = `web:${uuid4()}`;
      }
      if (!getGameOptions().token) {
         getGameOptions().token = uuid4();
      }
      const token = `${getGameOptions().userId}:${getGameOptions().token}`;
      const params = [
         `ticket=${token}`,
         "platform=web",
         `version=${getVersion()}`,
         `build=${getBuildNumber()}`,
         `userId=${getGameOptions().userId}`,
         `gameId=${getGameState().id}`,
         `checksum=${checksum.expected}${checksum.actual}`,
      ];
      ws = new WebSocket(`${getServerAddress()}/?${params.join("&")}`);
   }

   if (!ws) {
      return Promise.reject("Failed to initialize WebSocket");
   }

   ws.binaryType = "arraybuffer";

   let resolve: ((v: number) => void) | null = null;

   const promise = new Promise<number>((resolve_) => {
      resolve = resolve_;
   });

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
                     user && m.message.toLowerCase().includes(` @${user.handle.toLowerCase()}`);
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
            const options = getGameOptions();
            options.token = user.token;
            if (!options.userId) {
               options.userId = user.userId;
            }
            saveGame().catch(console.error);
            OnUserChanged.emit({ ...user });
            const tick = getGameState().tick;
            const offlineTicks = clamp(w.lastGameTick + w.offlineTime - tick, 0, Number.POSITIVE_INFINITY);
            console.log(
               "[WelcomeMessage]",
               "CurrentTick:",
               tick,
               "OfflineTicks:",
               offlineTicks,
               "OfflineTime:",
               w.offlineTime,
               "User:",
               JSON.stringify(w),
            );
            resolve?.(Math.min(w.offlineTime, offlineTicks));
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
            OnTradeChanged.emit(getTrades());
            break;
         }
         case MessageType.Map: {
            const m = message as IMapMessage;
            OnPlayerMapMessage.emit(m);
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

   ws.onclose = (ev) => {
      ws = null;
      user = null;
      OnUserChanged.emit(null);
      console.log("WebSocket connection closed. Code:", ev.code);
      switch (ev.code) {
         case ServerWSErrorCode.BadRequest:
         case ServerWSErrorCode.NotAllowed:
            break;
         case ServerWSErrorCode.InvalidTicket:
            steamTicket = null;
            retryConnect();
            break;
         default:
            retryConnect();
            break;
      }
   };

   return promise;
}

function retryConnect() {
   setTimeout(
      () => connectWebSocket().then(convertOfflineTimeToWarp),
      Math.min(Math.pow(2, reconnect++) * SECOND, 16 * SECOND),
   );
}

export function convertOfflineTimeToWarp(offlineTime: number): void {
   console.log("[convertOfflineTimeToWarp] offlineTime:", offlineTime);
   if (offlineTime >= 60) {
      playBubble();
      showToast(t(L.PetraOfflineTimeReconciliation, { count: offlineTime }));
      addPetraOfflineTime(offlineTime, getGameState());
   }
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
