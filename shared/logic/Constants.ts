import type { Building } from "../definitions/BuildingDefinitions";
import type { Material } from "../definitions/MaterialDefinitions";
import type { PartialTabulate } from "../utilities/TypeDefinitions";

export const SAVE_FILE_VERSION = 1;
export const SAVE_KEY = "CivIdle";
export const MAX_OFFLINE_PRODUCTION_SEC = 60 * 60 * 4;
export const SCIENCE_VALUE = 0.2;
export const TRADE_CANCEL_REFUND_PERCENT = 0.9;
export const MAX_CHAT_PER_CHANNEL = 200;
export const DISCORD_URL = "https://discord.com/invite/m5JWZtEKMZ";
export const BACKUP_RECOVERY_URL =
   "https://steamcommunity.com/app/2181940/discussions/0/7260435610010445264/";
export const ANTICHEAT_FAQ_URL = "https://steamcommunity.com/app/2181940/discussions/0/6629936675071563255/";
export const TRIBUNE_TRADE_VALUE_PER_MINUTE = 10000;
export const STEAM_PATCH_NOTES_URL = "https://store.steampowered.com/news/app/2181940";
export const SUPPORTER_PACK_URL = "https://store.steampowered.com/app/2788080/";
export const CROSS_PLATFORM_SAVE_URL = "https://store.steampowered.com/app/3399010/";
export const STEAM_GUIDE_URL = "https://steamcommunity.com/sharedfiles/filedetails/?id=3196523559";
export const RESTITUTOR_STEAM_URL = "https://store.steampowered.com/app/4431750/Restitutor_Empire_Restored/";
export const MAX_TARIFF_RATE = 0.1;
export const OXFORD_SCIENCE_PER_UPGRADE = 5;
export const MARKET_DEFAULT_TRADE_COUNT = 5;
export const MAX_EXPLORER = 10;
export const EXPLORER_SECONDS = 60;
export const MANAGED_IMPORT_RANGE = 2;
export const DISABLE_PLAYER_TRADES = false;
export const MAX_TELEPORT = 10;
export const TELEPORT_SECONDS = 60;
export const MAX_PETRA_SPEED_UP = 16;
export const FESTIVAL_CONVERSION_RATE = 100;
export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
export const GOOGLE_PLAY_GAMES_CLIENT_ID =
   "242227196074-u9201vdqd82p0o0hvfg2metk3gl5ocro.apps.googleusercontent.com";
export const TOWER_BRIDGE_GP_PER_CYCLE = 3600;
export const EAST_INDIA_COMPANY_BOOST_PER_EV = 2000;
export const TRADE_TILE_BONUS = 5;
export const TRADE_TILE_NEIGHBOR_BONUS = 1;
export const TRADE_TILE_ALLY_BONUS = 2;

export interface IRecipe {
   building: Building;
   input: PartialTabulate<Material>;
   output: PartialTabulate<Material>;
}
