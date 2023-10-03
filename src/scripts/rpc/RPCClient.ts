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
   ITradeMessage,
   IUser,
   IWelcomeMessage,
} from "../../../server/src/Database";
import { MessageType } from "../../../server/src/Database";
import { ServerImpl } from "../../../server/src/Server";
import { getGameOptions, saveGame } from "../Global";
import { IClientTrade } from "../logic/PlayerTradeLogic";
import { forEach } from "../utilities/Helper";
import { makeObservableHook } from "../utilities/Hook";
import { TypedEvent } from "../utilities/TypedEvent";
import { isSteam, SteamClient, STEAM_APP_ID } from "./SteamClient";

const serverAddress = import.meta.env.DEV ? "ws://localhost:8000" : "wss://api.cividle.com";

let user: IUser | null = null;

export async function changeHandle(newHandle: string) {
   if (user) {
      await client.changeHandle(newHandle);
      user.handle = newHandle;
   }
}

export const OnUserChanged = new TypedEvent<IUser | null>();
export const OnChatMessage = new TypedEvent<IChat[]>();
export const OnTradeMessage = new TypedEvent<IClientTrade[]>();
export const OnPlayerMapChanged = new TypedEvent<Record<string, IMapEntry>>();
export const OnPlayerMapMessage = new TypedEvent<IMapMessage>();

let chatMessages: IChat[] = [];
const trades: Record<string, IClientTrade> = {};
const playerMap: Record<string, IMapEntry> = {};

export function getPlayerMap() {
   return playerMap;
}

let ws: WebSocket | null = null;
const steamWs: WebSocket | null = null;

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
export const useUser = makeObservableHook(OnUserChanged, () => user);

let reconnect = 0;
let requestId = 0;
// eslint-disable-next-line @typescript-eslint/ban-types
const rpcRequests: Record<number, { resolve: Function; reject: Function; time: number }> = {};

let steamTicket: string | null = null;

export async function connectWebSocket() {
   if (isSteam()) {
      if (!steamTicket) {
         steamTicket = await SteamClient.getAuthSessionTicket();
      }
      getGameOptions().id = `steam:${await SteamClient.getSteamId()}`;
      ws = new WebSocket(`${serverAddress}/?appId=${STEAM_APP_ID}&ticket=${steamTicket}&platform=steam`);
   } else {
      const token = getGameOptions().id + ":" + (getGameOptions().token ?? getGameOptions().id);
      ws = new WebSocket(`${serverAddress}/?platform=web&ticket=${token}`);
   }

   if (!ws) {
      return;
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
            getGameOptions().token = w.user.token;
            saveGame();
            break;
         case MessageType.Trade:
            const t = message as ITradeMessage;
            let hasPendingClaim = false;
            if (t.upsert) {
               t.upsert.forEach((trade) => {
                  if (trades[trade.id] && trades[trade.id].fromId == user?.userId) {
                     hasPendingClaim = true;
                  }
                  trades[trade.id] = trade as IClientTrade;
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
            console.log(trades);
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
            OnPlayerMapChanged.emit({ ...playerMap });
            OnPlayerMapMessage.emit(m);
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
