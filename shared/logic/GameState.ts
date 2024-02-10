import type { Building } from "../definitions/BuildingDefinitions";
import type { City } from "../definitions/CityDefinitions";
import type { GreatPerson } from "../definitions/GreatPersonDefinitions";
import type { Resource } from "../definitions/ResourceDefinitions";
import type { RomeProvince } from "../definitions/RomeProvinceDefinitions";
import type { Tech } from "../definitions/TechDefinitions";
import { EN } from "../languages/en";
import { RU } from "../languages/ru";
import type { ChatChannel } from "../utilities/Database";
import { IPointData, forEach, uuid4, type Tile } from "../utilities/Helper";
import type { PartialSet, PartialTabulate } from "../utilities/TypeDefinitions";
import { L, t } from "../utilities/i18n";
import { getGameOptions, notifyGameOptionsUpdate } from "./GameStateLogic";
import type { IShortcutConfig, Shortcut } from "./Shortcut";
import type { IBuildingData, ITileData } from "./Tile";

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
   city: City = "Rome";
   unlockedTech: PartialSet<Tech> = {};
   unlockedProvince: PartialSet<RomeProvince> = {};
   tiles: Map<Tile, ITileData> = new Map();
   transportation: Map<Tile, ITransportationData[]> = new Map();
   tick = 0;
   greatPeople: PartialTabulate<GreatPerson> = {};
   greatPeopleChoices: GreatPeopleChoice[] = [];
   transportId = 0;
   lastPriceUpdated = 0;
   isOffline = false;
}

export type GreatPeopleChoice = [GreatPerson, GreatPerson, GreatPerson];

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

export class GameOptions {
   useModernUI = true;
   id = uuid4();
   token: string | null = null;
   version = SAVE_FILE_VERSION;
   buildingColors: Partial<Record<Building, string>> = {};
   resourceColors: Partial<Record<Resource, string>> = {};
   themeColors = { ...DefaultThemeColors };
   shortcuts: Partial<Record<Shortcut, IShortcutConfig>> = {};
   soundEffect = true;
   buildingDefaults: Partial<Record<Building, Partial<IBuildingData>>> = {};
   defaultPriority = 0x010101;
   autopilotPercentage = 0.95;
   chatSendChannel: ChatChannel = "en";
   chatReceiveChannel: PartialSet<ChatChannel> = {};
   // Should be wiped
   greatPeople: Partial<Record<GreatPerson, { level: number; amount: number }>> = {};
   greatPeopleChoices: GreatPeopleChoice[] = [];
   language: keyof typeof Languages = "en";
}

export const Languages = {
   en: EN,
   ru: RU,
} as const;

export const SAVE_FILE_VERSION = 1;

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
