import type { Building } from "../definitions/BuildingDefinitions";
import type { City } from "../definitions/CityDefinitions";
import type { Material } from "../definitions/MaterialDefinitions";
import type { TechAge } from "../definitions/TechDefinitions";
import type { IHeartbeatData } from "../logic/GameStateLogic";
import { HOUR } from "./Helper";
import { L, t } from "./i18n";

export enum ChatAttributes {
   None = 0,
   Mod = 1 << 0,
   Announce = 1 << 1,
   Supporter = 1 << 2,
}

export interface IChat {
   name: string;
   message: string;
   time: number;
   flag: string;
   color: UserColors;
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
   now: number;
   platformInfo: IPlatformInfo;
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
   fromAttr: UserAttributes;
   fillBy?: string;
   fillByFlag?: string;
   fillByLevel?: AccountLevel;
   fillByAttr?: UserAttributes;
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
   buyResource: Material;
   buyAmount: number;
   sellResource: Material;
   sellAmount: number;
}

export enum PendingClaimFlag {
   None = 0,
   Tariff = 1 << 0,
}

export interface IPendingClaim {
   id: string;
   resource: Material;
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
   totalGreatPeopleLevel?: number;
}

export interface ITradeValue {
   value: number;
   time: number;
}

export enum UserAttributes {
   None = 0,
   Mod = 1 << 0,
   DLC1 = 1 << 1,
   DLC2 = 1 << 2,
   DLC3 = 1 << 3,
   DLC4 = 1 << 4,
   DLC5 = 1 << 5,
   Banned = 1 << 6,
   TribuneOnly = 1 << 7,
   DisableRename = 1 << 8,
   __Unused = 1 << 9,
   Suspicious = 1 << 10,
   Desynced = 1 << 11,
}

export enum UserColors {
   Default = 0,
   Green = 1,
   Turquoise = 2,
   Blue = 3,
   Purple = 4,
   Orange = 5,
   Red = 6,
   Pink = 7,
   Cyan = 8,
   DarkBlue = 9,
   SeaGreen = 10,
   Chocolate = 11,
   Flamingo = 12,
   Cinereous = 13,
   Glaucous = 14,
}

export enum TileType {
   Owned = 0,
   Occupied = 1,
}

export const UserColorsMapping = {
   [UserColors.Default]: undefined,
   [UserColors.Green]: "#00b894",
   [UserColors.Turquoise]: "#00cec9",
   [UserColors.Blue]: "#0984e3",
   [UserColors.Purple]: "#6c5ce7",
   [UserColors.Orange]: "#f0932b",
   [UserColors.Red]: "#d63031",
   [UserColors.Pink]: "#e84393",
   [UserColors.Cyan]: "#0abde3",
   [UserColors.DarkBlue]: "#124e89",
   [UserColors.SeaGreen]: "#2e8b57",
   [UserColors.Chocolate]: "#7b3f00",
   [UserColors.Flamingo]: "#ff7777",
   [UserColors.Cinereous]: "#98817b",
   [UserColors.Glaucous]: "#6082b6",
} as const satisfies Record<UserColors, string | undefined>;

export const UserColorsNames: Record<UserColors, () => string> = {
   [UserColors.Default]: () => t(L.ColorNone),
   [UserColors.Green]: () => t(L.ColorGreen),
   [UserColors.Turquoise]: () => t(L.ColorTurquoise),
   [UserColors.Blue]: () => t(L.ColorBlue),
   [UserColors.Purple]: () => t(L.ColorPurple),
   [UserColors.Orange]: () => t(L.ColorOrange),
   [UserColors.Red]: () => t(L.ColorRed),
   [UserColors.Pink]: () => t(L.ColorPink),
   [UserColors.Cyan]: () => t(L.ColorCyan),
   [UserColors.DarkBlue]: () => t(L.ColorDarkBlue),
   [UserColors.SeaGreen]: () => t(L.ColorSeaGreen),
   [UserColors.Chocolate]: () => t(L.ColorChocolate),
   [UserColors.Flamingo]: () => t(L.ColorFlamingo),
   [UserColors.Cinereous]: () => t(L.ColorCinereous),
   [UserColors.Glaucous]: () => t(L.ColorGlaucous),
};

export interface IUser {
   userId: string;
   handle: string;
   token: string | null;
   lastDisconnectAt: number;
   lastHeartbeatAt: number;
   lastGameTick: number;
   totalPlayTime: number;
   color: UserColors;
   tradeValues: ITradeValue[];
   level: AccountLevel;
   flag: string;
   ip: string;
   attr: UserAttributes;
   lastGameId?: string;
   connectionRequest?: IConnectionRequest;
   saveOwner?: string;
   lastCheckInAt?: number;
   lastTradedAt: number;
   heartbeatData?: IHeartbeatData;
}

export interface IConnectionRequest {
   createdAt: number;
   passcode: string;
}

export interface IMapEntry {
   userId: string;
   tariffRate: number;
   createdAt: number;
   type: TileType;
}

export interface IClientMapEntry extends IMapEntry {
   attr: UserAttributes;
   flag: string;
   color: UserColors;
   level: AccountLevel;
   lastSeenAt: number;
   handle: string;
   city: City | undefined;
   techAge: TechAge | undefined;
}

export interface ISlowModeConfig {
   until: number;
   minInterval: number;
   lastChatAt: number;
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
   connectedUsers: Record<string, string>;
   trades: Record<string, ITrade>;
   pendingClaims: Record<string, IPendingClaim[]>;
   map: Record<string, IMapEntry>;
   muteList: Record<string, number>;
   slowList: Record<string, ISlowModeConfig>;
   greatPeopleRecovery: Record<string, number>;
   votedBoosts: Record<number, IVotedBoost>;
   buildHash: Record<string, string>;
} = {
   chat: [],
   users: {},
   connectedUsers: {},
   trades: {},
   map: {},
   pendingClaims: {},
   muteList: {},
   slowList: {},
   greatPeopleRecovery: {},
   votedBoosts: {},
   buildHash: {},
};

export const MoveTileCooldown = 12 * HOUR;
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
   jp: "日本語",
   es: "Español",
   pt: "Português",
} as const;

export type ChatChannel = keyof typeof ChatChannels;

export enum AccountLevel {
   Tribune = 0,
   Quaestor = 1,
   Aedile = 2,
   Praetor = 3,
   Consul = 4,
   Caesar = 5,
   Augustus = 6,
}

export enum Platform {
   None = 0,
   Steam = 1,
   iOS = 2,
   Android = 3,
}

export const TradeTileReservationDays: Record<AccountLevel, number> = {
   [AccountLevel.Tribune]: 1,
   [AccountLevel.Quaestor]: 3,
   [AccountLevel.Aedile]: 5,
   [AccountLevel.Praetor]: 7,
   [AccountLevel.Consul]: 9,
   [AccountLevel.Caesar]: 9,
   [AccountLevel.Augustus]: 9,
};

export const ChatMaxChars: Record<AccountLevel, number> = {
   [AccountLevel.Tribune]: 200,
   [AccountLevel.Quaestor]: 800,
   [AccountLevel.Aedile]: 800,
   [AccountLevel.Praetor]: 800,
   [AccountLevel.Consul]: 800,
   [AccountLevel.Caesar]: 800,
   [AccountLevel.Augustus]: 800,
};

export const AccountLevelPlayTime: Record<AccountLevel, number> = {
   [AccountLevel.Tribune]: 0,
   [AccountLevel.Quaestor]: 48 * HOUR,
   [AccountLevel.Aedile]: 200 * HOUR,
   [AccountLevel.Praetor]: 500 * HOUR,
   [AccountLevel.Consul]: 1000 * HOUR,
   [AccountLevel.Caesar]: 1500 * HOUR,
   [AccountLevel.Augustus]: 2000 * HOUR,
};

export const AccountLevelGreatPeopleLevel: Record<AccountLevel, number> = {
   [AccountLevel.Tribune]: 0,
   [AccountLevel.Quaestor]: 0,
   [AccountLevel.Aedile]: 200,
   [AccountLevel.Praetor]: 500,
   [AccountLevel.Consul]: 1000,
   [AccountLevel.Caesar]: 1500,
   [AccountLevel.Augustus]: 2000,
};

export enum ServerWSErrorCode {
   Ok = 0,
   BadRequest = 3000,
   InvalidTicket = 3001,
   NotAllowed = 3002,
   Background = 4000,
}

export interface IPlatformInfo {
   userId: string;
   originalUserId: string;
   connectedUserId: string | null;
}
