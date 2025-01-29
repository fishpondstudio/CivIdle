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
import { forEach, uuid4, type IPointData, type Tile } from "../utilities/Helper";
import type { PartialSet, PartialTabulate } from "../utilities/TypeDefinitions";
import { L, t } from "../utilities/i18n";
import { SAVE_FILE_VERSION } from "./Constants";
import { getGameOptions, notifyGameOptionsUpdate } from "./GameStateLogic";
import type { IShortcutConfig, Shortcut } from "./Shortcut";
import { PRIORITY_MIN, type IBuildingData, type ITileData } from "./Tile";

export interface ITransportationDataV2 {
   id: number;
   fromXy: Tile;
   fromPosition: IPointData;
   toXy: Tile;
   toPosition: IPointData;
   ticksSpent: number;
   ticksRequired: number;
   resource: Resource;
   amount: number;
   fuel: Resource;
   fuelPerTick: number;
   fuelCurrentTick: number;
   hasEnoughFuel: boolean;
}

export interface IValueTracker {
   accumulated: number;
   history: number[];
}

export enum ValueToTrack {
   EmpireValue = 0,
}

export class GameState {
   id = uuid4();
   city: City = "Rome";
   unlockedTech: PartialSet<Tech> = {};
   unlockedUpgrades: PartialSet<Upgrade> = {};
   tiles: Map<Tile, ITileData> = new Map();
   transportationV2: ITransportationDataV2[] = [];
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
   favoriteTiles: Set<Tile> = new Set();
   claimedGreatPeople = 0;
   valueTrackers = new Map<ValueToTrack, IValueTracker>();
   speedUp = 1;
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
   WorldBackground: "#1e2328",
   GridColor: "#ffffff",
   GridAlpha: 0.1,
   SelectedGridColor: "#ffff99",
   InactiveBuildingAlpha: 0.5,
   TransportIndicatorAlpha: 0.5,
   ResearchBackground: "#1e2328",
   ResearchLockedColor: "#666666",
   ResearchUnlockedColor: "#ffffff",
   ResearchHighlightColor: "#ffff99",
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
   WorldBackground: () => t(L.ThemeColorWorldBackground),
   ResearchBackground: () => t(L.ThemeColorResearchBackground),
   GridColor: () => t(L.ThemeColorGridColor),
   GridAlpha: () => t(L.ThemeColorGridAlpha),
   SelectedGridColor: () => t(L.ThemeSelectedGridColor),
   InactiveBuildingAlpha: () => t(L.ThemeInactiveBuildingAlpha),
   TransportIndicatorAlpha: () => t(L.ThemeTransportIndicatorAlpha),
   ResearchLockedColor: () => t(L.ThemeResearchLockedColor),
   ResearchUnlockedColor: () => t(L.ThemeResearchUnlockedColor),
   ResearchHighlightColor: () => t(L.ThemeResearchHighlightColor),
};

export const ExtraTileInfoTypes = {
   None: () => t(L.ExtraTileInfoTypeNone),
   EmpireValue: () => t(L.ExtraTileInfoTypeEmpireValue),
   StoragePercentage: () => t(L.ExtraTileInfoTypeStoragePercentage),
} as const;

export const CursorOptions = {
   OldFashioned: () => t(L.CursorOldFashioned),
   BigOldFashioned: () => t(L.CursorBigOldFashioned),
   System: () => t(L.CursorSystem),
} as const;

export type ExtraTileInfoType = keyof typeof ExtraTileInfoTypes;
export type CursorOption = keyof typeof CursorOptions;

export class GameOptions {
   useModernUI = true;
   userId: string | null = null;
   checksum: string | null = null;
   sidePanelWidth = 450;
   sidePanelWidthMobile = 450;
   fontSizeScale = 1;
   fontSizeScaleMobile = 1;
   cursor: CursorOption = "OldFashioned";
   version = SAVE_FILE_VERSION;
   showTransportArrow = true;
   scrollSensitivity = 1;
   buildingColors: Partial<Record<Building, string>> = {};
   resourceColors: Partial<Record<Resource, string>> = {};
   themeColors = { ...DefaultThemeColors };
   shortcuts: Partial<Record<Shortcut, IShortcutConfig>> = {};
   soundEffect = true;
   tradeFilledSound = true;
   chatHideLatestMessage = false;
   chatChannels: Set<ChatChannel> = new Set(["en"]);
   enableTransportSourceCache = false;
   resourceBarShowUncappedHappiness = false;
   resourceBarExcludeTurnedOffOrNoActiveTransport = false;
   resourceBarExcludeStorageFull = false;
   extraTileInfoType: ExtraTileInfoType = "StoragePercentage";
   buildingDefaults: Partial<Record<Building, Partial<IBuildingData>>> = {};
   defaultProductionPriority = PRIORITY_MIN;
   defaultConstructionPriority = PRIORITY_MIN;
   defaultStockpileCapacity = 1;
   defaultStockpileMax = 5;
   defaultBuildingLevel = 1;
   porcelainTowerMaxPickPerRoll = false;
   greedyTransport = false;
   offlineProductionPercent = 0;
   // Should be wiped
   greatPeople: Partial<Record<GreatPerson, { level: number; amount: number }>> = {};
   ageWisdom: PartialTabulate<TechAge> = {};
   greatPeopleChoicesV2: GreatPeopleChoiceV2[] = [];
   language: keyof typeof Languages = "en";
   disabledTutorials = new Set<Advisor>();
}

export const Languages: Record<string, Record<string, string>> = {
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
