import { HOUR } from "./Helper";

export interface IChat {
   name: string;
   message: string;
   time: number;
   flag: string;
   level: AccountLevel;
   channel: ChatChannel;
}

export enum MessageType {
   Chat = 0,
   RPC = 1,
   Welcome = 2,
   Trade = 3,
   Map = 4,
}

export interface IMessage {
   type: MessageType;
}

export interface IChatMessage extends IMessage {
   type: MessageType.Chat;
   flush?: true;
   chat: IChat[];
}

export interface IRPCMessage extends IMessage {
   type: MessageType.RPC;
   data: any;
}

export interface IWelcomeMessage extends IMessage {
   type: MessageType.Welcome;
   user: IUser;
   offlineTime: number;
}

export interface ITrade extends IAddTradeRequest {
   id: string;
   from: string;
   fromId: string;
   status: TradeStatus;
   fillBy?: string;
   fillById?: string;
}

export interface ITradeMessage extends IMessage {
   type: MessageType.Trade;
   upsert?: ITrade[];
   remove?: string[];
}

export interface IMapMessage extends IMessage {
   type: MessageType.Map;
   upsert?: Record<string, IClientMapEntry>;
   remove?: string[];
}

export interface IAddTradeRequest {
   buyResource: string;
   buyAmount: number;
   sellResource: string;
   sellAmount: number;
}

export interface IPendingClaim {
   id: string;
   resource: string;
   amount: number;
   fillBy: string;
}

export interface IFillTradeRequest {
   id: string;
   percent: number;
   path: string[];
}

export type TradeStatus = "open" | "filled" | "closed" | "cancelled";

export interface IPoint {
   x: number;
   y: number;
}

export type AllMessageTypes = IChatMessage | IRPCMessage | IWelcomeMessage | ITradeMessage | IMapMessage;

export interface IEmpireValue {
   value: number;
   time: number;
   tick: number;
}

export interface IUser {
   userId: string;
   handle: string;
   authenticated: boolean;
   token: string | null;
   lastDisconnectAt: number;
   lastHeartbeatAt: number;
   totalPlayTime: number;
   empireValues: IEmpireValue[];
   level: AccountLevel;
   flag: string;
}

export interface IMapEntry {
   userId: string;
   handle: string;
   tariffRate: number;
   createdAt: number;
}

export interface IClientMapEntry extends IMapEntry {
   flag: string;
   authenticated: boolean;
}

export function enrichMapEntry(entry: IMapEntry): IClientMapEntry {
   return {
      ...entry,
      flag: DB.users[entry.userId].flag,
      authenticated: DB.users[entry.userId].authenticated,
   };
}

export const DB: {
   chat: IChat[];
   users: Record<string, IUser>;
   trades: Record<string, ITrade>;
   pendingClaims: Record<string, IPendingClaim[]>;
   map: Record<string, IMapEntry>;
} = {
   chat: [],
   users: {},
   trades: {},
   map: {},
   pendingClaims: {},
};

export const MoveTileCooldown = 1 * HOUR;
// export const MoveTileCooldown = 0;

export const MAP_MAX_X = 200;
export const MAP_MAX_Y = 100;

export const ChatChannels = {
   en: "English",
   zh: "中文",
   de: "Deutsch",
   ru: "Русский",
} as const;

export type ChatChannel = keyof typeof ChatChannels;

export enum AccountLevel {
   Tribune = 0,
   Quaestor = 1,
   Aedile = 2,
   Praetor = 3,
   Consul = 4,
   Censor = 5,
   Dictator = 6,
}
