import type { Building } from "../definitions/BuildingDefinitions";
import type { City } from "../definitions/CityDefinitions";
import type { GreatPerson } from "../definitions/GreatPersonDefinitions";
import type { Resource } from "../definitions/ResourceDefinitions";
import type { Tech } from "../definitions/TechDefinitions";
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

export interface ITransportationData {
   id: number;
   fromXy: Tile;
   toXy: Tile;
   ticksRequired: number;
   ticksSpent: number;
   fromPosition: IPointData;
   toPosition: IPointData;
   resource: Resource;
   amount: number;
   fuel: Resource;
   fuelAmount: number;
   currentFuelAmount: number;
   hasEnoughFuel: boolean;
}

export class GameState {
   id = uuid4();
   city: City = "Rome";
   unlockedTech: PartialSet<Tech> = {};
   unlockedUpgrades: PartialSet<Upgrade> = {};
   tiles: Map<Tile, ITileData> = new Map();
   transportation: Map<Tile, ITransportationData[]> = new Map();
   tick = 0;
   greatPeople: PartialTabulate<GreatPerson> = {};
   greatPeopleChoices: GreatPeopleChoice[] = [];
   transportId = 0;
   lastPriceUpdated = 0;
   isOffline = false;
   rebirthed = false;
   favoriteTiles: Set<Tile> = new Set();
   claimedGreatPeople = 0;
}

export type GreatPeopleChoice = GreatPerson[];

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
   token: string | null = null;
   checksum: string | null = null;
   sidePanelWidth = 400;
   fontSizeScale = 1;
   cursor: CursorOption = "OldFashioned";
   version = SAVE_FILE_VERSION;
   buildingColors: Partial<Record<Building, string>> = {};
   resourceColors: Partial<Record<Resource, string>> = {};
   themeColors = { ...DefaultThemeColors };
   shortcuts: Partial<Record<Shortcut, IShortcutConfig>> = {};
   soundEffect = true;
   chatHideLatestMessage = false;
   chatChannels: Set<ChatChannel> = new Set(["en"]);
   useMirrorServer = false;
   resourceBarShowUncappedHappiness = false;
   resourceBarExcludeTurnedOffOrNoActiveTransport = false;
   resourceBarExcludeStorageFull = false;
   extraTileInfoType: ExtraTileInfoType = "EmpireValue";
   buildingDefaults: Partial<Record<Building, Partial<IBuildingData>>> = {};
   defaultProductionPriority = PRIORITY_MIN;
   defaultConstructionPriority = PRIORITY_MIN;
   defaultStockpileCapacity = 1;
   defaultStockpileMax = 5;
   defaultBuildingLevel = 1;
   // Should be wiped
   greatPeople: Partial<Record<GreatPerson, { level: number; amount: number }>> = {};
   greatPeopleChoices: GreatPeopleChoice[] = [];
   language: keyof typeof Languages = "en";
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
