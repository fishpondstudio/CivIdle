import type { Advisor } from "../definitions/AdvisorDefinitions";
import type { Building } from "../definitions/BuildingDefinitions";
import type { City } from "../definitions/CityDefinitions";
import type { GreatPerson } from "../definitions/GreatPersonDefinitions";
import type { Resource } from "../definitions/ResourceDefinitions";
import type { Tech, TechAge } from "../definitions/TechDefinitions";
import type { Upgrade } from "../definitions/UpgradeDefinitions";
import { CZ } from "../languages/cz";
import { DE } from "../languages/de";
import { EN } from "../languages/en";
import { ES } from "../languages/es";
import { FR } from "../languages/fr";
import { KR } from "../languages/kr";
import { NL } from "../languages/nl";
import { PT_BR } from "../languages/pt-BR";
import { RU } from "../languages/ru";
import { TR } from "../languages/tr";
import { ZH_CN } from "../languages/zh-CN";
import { ZH_TW } from "../languages/zh-TW";
import type { ChatChannel } from "../utilities/Database";
import { forEach, uuid4, type Tile } from "../utilities/Helper";
import type { PartialSet, PartialTabulate } from "../utilities/TypeDefinitions";
import { L, t } from "../utilities/i18n";
import { SAVE_FILE_VERSION } from "./Constants";
import { getGameOptions, notifyGameOptionsUpdate } from "./GameStateLogic";
import type { IShortcutConfig, Shortcut } from "./Shortcut";
import type { IBuildingData, ITileData } from "./Tile";

export interface IValueTracker {
   accumulated: number;
   history: number[];
}

export enum ValueToTrack {
   EmpireValue = 0,
}

export enum GameStateFlags {
   None = 0,
   HasDemolishedBuilding = 1 << 0,
   HasUsedTimeWarp = 1 << 1,
   HasThreeAllies = 1 << 2,
}

export class GameState {
   id = uuid4();
   city: City = "Rome";
   unlockedTech: PartialSet<Tech> = {};
   unlockedUpgrades: PartialSet<Upgrade> = {};
   tiles: Map<Tile, ITileData> = new Map();
   tick = 0;
   seconds = 0;
   greatPeople: PartialTabulate<GreatPerson> = {};
   // greatPeopleChoices: GreatPeopleChoice[] = [];
   greatPeopleChoicesV2: GreatPeopleChoiceV2[] = [];
   transportId = 0;
   lastPriceUpdated = 0;
   isOffline = false;
   rebirthed = false;
   festival = false;
   tradeValue = 0;
   favoriteTiles: Set<Tile> = new Set();
   claimedGreatPeople = 0;
   valueTrackers = new Map<ValueToTrack, IValueTracker>();
   speedUp = 1;
   pinStatPanel = false;
   adaptiveGreatPeople = new Map<GreatPerson, Building>();
   flags = GameStateFlags.None;
   lastClientTickAt = 0;
   clientOfflineSec = 0;
}

export type GreatPeopleChoice = GreatPerson[];

export interface GreatPeopleChoiceV2 {
   choices: GreatPerson[];
   amount: number;
}

export class SavedGame {
   current = new GameState();
   options = new GameOptions();
}

const DefaultThemeColors = {
   InactiveBuildingAlpha: 0.5,
   TransportIndicatorAlpha: 0.5,
   ResearchBackground: "#1e2328",
   ResearchLockedColor: "#666666",
   ResearchUnlockedColor: "#ffffff",
   ResearchHighlightColor: "#ffff99",
   BuildingStatusIconAlpha: 1,
   SpinnerAlpha: 0.5,
};

export function resetThemeColor() {
   getGameOptions().themeColors = { ...DefaultThemeColors };
   notifyGameOptionsUpdate();
}

export function resetThemeBuildingColors() {
   getGameOptions().buildingColors = {};
   notifyGameOptionsUpdate();
}

export function resetThemeResourceColors() {
   getGameOptions().resourceColors = {};
   notifyGameOptionsUpdate();
}

export const ThemeColorNames: Record<keyof typeof DefaultThemeColors, () => string> = {
   ResearchBackground: () => t(L.ThemeColorResearchBackground),
   InactiveBuildingAlpha: () => t(L.ThemeInactiveBuildingAlpha),
   TransportIndicatorAlpha: () => t(L.ThemeTransportIndicatorAlpha),
   ResearchLockedColor: () => t(L.ThemeResearchLockedColor),
   ResearchUnlockedColor: () => t(L.ThemeResearchUnlockedColor),
   ResearchHighlightColor: () => t(L.ThemeResearchHighlightColor),
   BuildingStatusIconAlpha: () => t(L.ThemeBuildingStatusIconAlpha),
   SpinnerAlpha: () => t(L.ThemeSpinnerAlpha),
};

export const ExtraTileInfoTypes = {
   None: () => t(L.ExtraTileInfoTypeNone),
   EmpireValue: () => t(L.ExtraTileInfoTypeEmpireValue),
   StoragePercentage: () => t(L.ExtraTileInfoTypeStoragePercentage),
} as const;

export const TileTextures = [
   "Tile1",
   "Tile14",
   "Tile2",
   "Tile3",
   "Tile4",
   "Tile5",
   "Tile6",
   "Tile7",
   "Tile8",
   "Tile15",
   "Tile16",
   "Tile9",
   "Tile10",
   "Tile11",
   "Tile12",
   "Tile13",
] as const;
export type TileTexture = (typeof TileTextures)[number];
export const DarkTileTextures: Partial<Record<TileTexture, true>> = {
   Tile1: true,
   Tile2: true,
   Tile3: true,
   Tile4: true,
   Tile5: true,
   Tile6: true,
   Tile7: true,
   Tile8: true,
   Tile14: true,
   Tile15: true,
   Tile16: true,
};
export const PremiumTileTextures: Partial<Record<TileTexture, true>> = {
   Tile3: true,
   Tile4: true,
   Tile5: true,
   Tile6: true,
   Tile7: true,
   Tile8: true,
   Tile10: true,
   Tile11: true,
   Tile12: true,
   Tile13: true,
   Tile15: true,
   Tile16: true,
};

export const SpinnerTextures = [
   "Spinner1",
   "Spinner2",
   "Spinner3",
   "Spinner4",
   "Spinner5",
   "Spinner6",
   "Spinner7",
   "Spinner8",
   "Spinner9",
] as const;
export type SpinnerTexture = (typeof SpinnerTextures)[number];

export const PremiumSpinnerTextures: Partial<Record<SpinnerTexture, true>> = {
   Spinner3: true,
   Spinner4: true,
   Spinner5: true,
   Spinner6: true,
   Spinner7: true,
   Spinner8: true,
   Spinner9: true,
};

export function getTextColor(): number {
   return DarkTileTextures[getGameOptions().tileTexture] ? 0xffffff : 0x666666;
}

export const CursorOptions = {
   OldFashioned: () => t(L.CursorOldFashioned),
   BigOldFashioned: () => t(L.CursorBigOldFashioned),
   System: () => t(L.CursorSystem),
} as const;

export type ExtraTileInfoType = keyof typeof ExtraTileInfoTypes;
export type CursorOption = keyof typeof CursorOptions;

export class GameOptions {
   useModernUI = true;
   useMonospaceNumbers = true;
   userId: string | null = null;
   checksum: string | null = null;
   sidePanelWidth = 450;
   sidePanelWidthMobile = 400;
   fontSizeScale = 1;
   fontSizeScaleMobile = 0.9;
   cursor: CursorOption = "OldFashioned";
   version = SAVE_FILE_VERSION;
   showTransportArrow = true;
   scrollSensitivity = 1;
   buildingColors: Partial<Record<Building, string>> = {};
   resourceColors: Partial<Record<Resource, string>> = {};
   themeColors = { ...DefaultThemeColors };
   tileTexture: TileTexture = "Tile1";
   spinnerTexture: SpinnerTexture | null = "Spinner1";
   spinnerSpeed = 1;
   showFloaterText = true;
   shortcuts: Partial<Record<Shortcut, IShortcutConfig>> = {};
   soundEffect = true;
   tradeFilledSound = true;
   chatHideLatestMessage = false;
   chatChannels: Set<ChatChannel> = new Set(["en"]);
   enableTransportSourceCache = false;
   resourceBarShowUncappedHappiness = false;
   extraTileInfoType: ExtraTileInfoType = "StoragePercentage";
   buildingDefaults: Partial<Record<Building, Partial<IBuildingData>>> = {};
   defaultWorkerProductionPriority = 4;
   defaultProductionPriority = 3;
   defaultConstructionPriority = 2;
   defaultWonderConstructionPriority = 1;
   defaultStockpileCapacity = 2;
   defaultStockpileMax = 25;
   defaultElectrificationLevel = 0;
   defaultBuildingLevel = 1;
   porcelainTowerMaxPickPerRoll = false;
   greedyTransport = false;
   offlineProductionPercent = 0;
   rebirthInfo: RebirthInfo[] = [];
   greatPeople: Partial<Record<GreatPerson, { level: number; amount: number }>> = {};
   ageWisdom: PartialTabulate<TechAge> = {};
   greatPeopleChoicesV2: GreatPeopleChoiceV2[] = [];
   language: keyof typeof Languages = "en";
   disabledTutorials = new Set<Advisor>();
   buildNumber = 0;
   constructionGridView = false;
   useRightClickCopy = false;
   buildingStatusIconFollowBuildingColor = false;
   useScientificFormat = false;
   showTutorial = true;
   disabledTodos = new Set<string>();
   showWonderPopup = true;
   rankUpFlags = RankUpFlags.NotUpgraded;
   showNaturalWonderPopup = true;
   keepNewTradeWindowOpen = false;
   supporterPackPurchased = false;
   migrationFlags = MigrationFlags.None;
}

export enum RankUpFlags {
   Unset = 0,
   NotUpgraded = 1 << 0,
   Upgraded = 1 << 1,
}

export enum MigrationFlags {
   None = 0,
   ZenobiaMigrated = 1 << 0,
}

export enum RebirthFlags {
   None = 0,
   EasterBunny = 1 << 0,
}

export interface RebirthInfo {
   greatPeopleAtRebirth: number;
   greatPeopleThisRun: number;
   totalEmpireValue: number;
   totalTicks: number;
   totalSeconds: number;
   flags: RebirthFlags;
   city: City;
   time: number;
}

export const Languages = {
   en: EN,
   es: ES,
   cz: CZ,
   fr: FR,
   de: DE,
   kr: KR,
   nl: NL,
   pt_BR: PT_BR,
   ru: RU,
   tr: TR,
   zh_CN: ZH_CN,
   zh_TW: ZH_TW,
} as const;

export const LanguageToChatChannel: Record<keyof typeof Languages, ChatChannel> = {
   en: "en",
   es: "es",
   cz: "en",
   fr: "fr",
   de: "de",
   kr: "kr",
   nl: "en",
   pt_BR: "pt",
   ru: "ru",
   tr: "en",
   zh_CN: "zh",
   zh_TW: "zh",
} as const;

export const LanguageToSteamLanguage: Record<keyof typeof Languages, string> = {
   en: "english",
   es: "spanish",
   cz: "czech",
   fr: "french",
   de: "german",
   kr: "koreana",
   nl: "dutch",
   pt_BR: "brazilian",
   ru: "russian",
   tr: "turkish",
   zh_CN: "schinese",
   zh_TW: "tchinese",
} as const;

let translatePercentage = 1;

export function syncLanguage(l: Record<string, string>): void {
   let total = 0;
   let translated = 0;

   forEach(EN, (k, v) => {
      ++total;
      if (l[k] && l[k] !== v) {
         ++translated;
      }
   });

   translatePercentage = translated / total;

   Object.assign(L, l);
}

export function getTranslatedPercentage(): number {
   return translatePercentage;
}

const hours: number[] = [];
export function getTimeSeriesHour(gs: GameState): number[] {
   const hour = Math.floor(gs.tick / 3600);
   if (hours.length === hour) {
      return hours;
   }

   hours.length = 0;
   for (let i = 0; i < hour; i++) {
      hours.push(i);
   }
   return hours;
}
