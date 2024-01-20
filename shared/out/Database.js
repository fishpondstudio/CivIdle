"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountLevels = exports.ChatChannels = exports.MAP_MAX_Y = exports.MAP_MAX_X = exports.MoveTileCooldown = exports.DB = exports.enrichMapEntry = exports.MessageType = void 0;
const Helper_1 = require("./Helper");
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Chat"] = 0] = "Chat";
    MessageType[MessageType["RPC"] = 1] = "RPC";
    MessageType[MessageType["Welcome"] = 2] = "Welcome";
    MessageType[MessageType["Trade"] = 3] = "Trade";
    MessageType[MessageType["Map"] = 4] = "Map";
})(MessageType || (exports.MessageType = MessageType = {}));
function enrichMapEntry(entry) {
    return Object.assign(Object.assign({}, entry), { flag: exports.DB.users[entry.userId].flag, authenticated: exports.DB.users[entry.userId].authenticated });
}
exports.enrichMapEntry = enrichMapEntry;
exports.DB = {
    chat: [],
    users: {},
    trades: {},
    map: {},
    pendingClaims: {},
};
exports.MoveTileCooldown = 1 * Helper_1.HOUR;
// export const MoveTileCooldown = 0;
exports.MAP_MAX_X = 200;
exports.MAP_MAX_Y = 100;
exports.ChatChannels = {
    en: "English",
    zh: "中文",
    de: "Deutsch",
    ru: "Русский",
};
var AccountLevels;
(function (AccountLevels) {
    AccountLevels[AccountLevels["Tribune"] = 0] = "Tribune";
    AccountLevels[AccountLevels["Quaestor"] = 1] = "Quaestor";
    AccountLevels[AccountLevels["Aedile"] = 2] = "Aedile";
    AccountLevels[AccountLevels["Praetor"] = 3] = "Praetor";
    AccountLevels[AccountLevels["Consul"] = 4] = "Consul";
    AccountLevels[AccountLevels["Censor"] = 5] = "Censor";
    AccountLevels[AccountLevels["Dictator"] = 6] = "Dictator";
})(AccountLevels || (exports.AccountLevels = AccountLevels = {}));
