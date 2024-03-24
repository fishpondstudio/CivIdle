import { Building } from "../definitions/BuildingDefinitions";
import { Resource } from "../definitions/ResourceDefinitions";
import { HOUR } from "./Helper";

export enum ChatAttributes {
   None = 0,
   Mod = 1 << 0,
   Announce = 1 << 1,
}

export interface IChat {
   name: string;
   message: string;
   time: number;
   flag: string;
   level: AccountLevel;
   attr: ChatAttributes;
   channel: ChatChannel;
}

export enum MessageType {
   Chat = 0,
   RPC = 1,
   Welcome = 2,
   Trade = 3,
   Map = 4,
   PendingClaim = 5,
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
   lastGameTick: number;
}

export interface ITrade extends IAddTradeRequest {
   id: string;
   status: TradeStatus;
   fromId: string;
   fillById?: string;
}

export interface IClientTrade extends ITrade {
   from: string;
   fromFlag: string;
   fromLevel: AccountLevel;
   fillBy?: string;
   fillByFlag?: string;
   fillByLevel?: AccountLevel;
}

export interface ITradeMessage extends IMessage {
   type: MessageType.Trade;
   upsert?: IClientTrade[];
   remove?: string[];
}

export interface IMapMessage extends IMessage {
   type: MessageType.Map;
   upsert?: Record<string, IClientMapEntry>;
   remove?: string[];
}

export interface IPendingClaimMessage extends IMessage {
   type: MessageType.PendingClaim;
   claims: Record<string, number>;
}

export interface IAddTradeRequest {
   buyResource: Resource;
   buyAmount: number;
   sellResource: Resource;
   sellAmount: number;
}

export enum PendingClaimFlag {
   None = 0,
   Tariff = 1 << 0,
}

export interface IPendingClaim {
   id: string;
   resource: Resource;
   amount: number;
   fillBy: string;
   flag: PendingClaimFlag;
}

export interface IFillTradeRequest {
   id: string;
   amount: number;
   path: string[];
   seaTileCost: number;
}

export type TradeStatus = "open" | "filled" | "closed" | "cancelled";

export interface IPoint {
   x: number;
   y: number;
}

export type AllMessageTypes =
   | IChatMessage
   | IRPCMessage
   | IWelcomeMessage
   | ITradeMessage
   | IMapMessage
   | IPendingClaimMessage;

export interface IEmpireValue {
   value: number;
   time: number;
   tick: number;
}

export interface ITradeValue {
   value: number;
   time: number;
}

export interface IUser {
   userId: string;
   handle: string;
   token: string | null;
   lastDisconnectAt: number;
   lastHeartbeatAt: number;
   lastGameTick: number;
   totalPlayTime: number;
   empireValues: IEmpireValue[];
   tradeValues: ITradeValue[];
   level: AccountLevel;
   isMod: boolean;
   flag: string;
   ip: string;
}

export interface IMapEntry {
   userId: string;
   tariffRate: number;
   createdAt: number;
}

export interface IClientMapEntry extends IMapEntry {
   flag: string;
   level: AccountLevel;
   lastSeenAt: number;
   handle: string;
}

export interface ISlowModeConfig {
   until: number;
   minInterval: number;
   lastChatAt: number;
}

export enum BanFlag {
   None = 0,
   Completely = 1 << 0,
   TribuneOnly = 1 << 1,
   NoRename = 1 << 2,
}

export interface IVotedBoost extends IClientVotedBoost {
   votes: Record<string, number>;
}

export interface IClientVotedBoost {
   options: IVotedBoostOption[];
   voted: number;
}

export interface IGetVotedBoostResponse {
   id: number;
   current: IClientVotedBoost;
   next: IClientVotedBoost;
}

export enum VotedBoostType {
   Multipliers = 0,
}

export interface IVotedBoostOption {
   buildings: Building[];
   type: VotedBoostType;
}

export const DB: {
   chat: IChat[];
   users: Record<string, IUser>;
   trades: Record<string, ITrade>;
   pendingClaims: Record<string, IPendingClaim[]>;
   map: Record<string, IMapEntry>;
   muteList: Record<string, number>;
   slowList: Record<string, ISlowModeConfig>;
   banList: Record<string, BanFlag>;
   greatPeopleRecovery: Record<string, number>;
   votedBoosts: Record<number, IVotedBoost>;
} = {
   chat: [],
   users: {},
   trades: {},
   map: {},
   pendingClaims: {},
   muteList: {},
   slowList: {},
   banList: {},
   greatPeopleRecovery: {},
   votedBoosts: {},
};

export const MoveTileCooldown = 4 * HOUR;
// export const MoveTileCooldown = 0;

export const MAP_MAX_X = 200;
export const MAP_MAX_Y = 100;

export const ChatChannels = {
   en: "English",
   zh: "中文",
   de: "Deutsch",
   ru: "Русский",
   fr: "Français",
   kr: "한국어",
} as const;

export type ChatChannel = keyof typeof ChatChannels;

export enum AccountLevel {
   Tribune = 0,
   Quaestor = 1,
   Aedile = 2,
   Praetor = 3,
   Consul = 4,
}

export const TradeTileReservationDays: Record<AccountLevel, number> = {
   [AccountLevel.Tribune]: 1,
   [AccountLevel.Quaestor]: 7,
   [AccountLevel.Aedile]: 14,
   [AccountLevel.Praetor]: 21,
   [AccountLevel.Consul]: 28,
};

export const ChatMaxChars: Record<AccountLevel, number> = {
   [AccountLevel.Tribune]: 200,
   [AccountLevel.Quaestor]: 800,
   [AccountLevel.Aedile]: 800,
   [AccountLevel.Praetor]: 800,
   [AccountLevel.Consul]: 800,
};

export enum ServerWSErrorCode {
   Ok = 0,
   BadRequest = 3000,
   InvalidTicket = 3001,
   NotAllowed = 3002,
}
