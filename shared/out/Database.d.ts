export interface IChat {
    name: string;
    message: string;
    time: number;
    flag: string;
    channel: ChatChannel;
}
export declare enum MessageType {
    Chat = 0,
    RPC = 1,
    Welcome = 2,
    Trade = 3,
    Map = 4
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
export interface IUser {
    userId: string;
    handle: string;
    authenticated: boolean;
    token: string | null;
    lastDisconnectAt: number;
    lastHeartbeatAt: number;
    totalPlayTime: number;
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
export declare function enrichMapEntry(entry: IMapEntry): IClientMapEntry;
export declare const DB: {
    chat: IChat[];
    users: Record<string, IUser>;
    trades: Record<string, ITrade>;
    pendingClaims: Record<string, IPendingClaim[]>;
    map: Record<string, IMapEntry>;
};
export declare const MoveTileCooldown: number;
export declare const MAP_MAX_X = 200;
export declare const MAP_MAX_Y = 100;
export declare const ChatChannels: {
    readonly en: "English";
    readonly zh: "中文";
    readonly de: "Deutsch";
    readonly ru: "Русский";
};
export type ChatChannel = keyof typeof ChatChannels;
export declare enum AccountLevels {
    Tribune = 0,
    Quaestor = 1,
    Aedile = 2,
    Praetor = 3,
    Consul = 4,
    Censor = 5,
    Dictator = 6
}
//# sourceMappingURL=Database.d.ts.map