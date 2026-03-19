import type { Building } from "../definitions/BuildingDefinitions";
import { NoPrice, type Material } from "../definitions/MaterialDefinitions";
import { forEach, mapSafePush, type Tile } from "../utilities/Helper";
import type { RequireAtLeastOne } from "../utilities/Type";
import { TypedEvent } from "../utilities/TypedEvent";
import { $t, L } from "../utilities/i18n";
import { getBuildingValue } from "./BuildingLogic";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import type { calculateHappiness } from "./HappinessLogic";
import { getTypeBuildings } from "./IntraTickCache";
import type { IBuildingData, IResourceImportBuildingData, ITileData } from "./Tile";
import type { TileAndRes } from "./Update";

export interface IBuildingIndex {
   tile: Tile;
   amount: number;
   usedStoragePercentage: number;
}

export interface IResourceImportBuildingIndex {
   tile: Tile;
   building: IResourceImportBuildingData;
   usedStoragePercentage: number;
}

interface ITickData {
   _buildingMultipliers: Map<Building, MultiplierWithSource[]>;
   tileMultipliers: Map<Tile, MultiplierWithSource[]>;
   unlockedBuildings: Set<Building>;
   workersAvailable: Map<Material, number>;
   happiness: ReturnType<typeof calculateHappiness> | null;
   workersUsed: Map<Material, number>;
   workersAssignment: Map<Tile, number>;
   electrified: Map<Tile, number>;
   notEnoughPower: Set<Tile>;
   levelBoost: Map<Tile, LevelBoost[]>;
   resourcesByTile: Map<Material, IBuildingIndex[]>;
   storagePercentages: Map<Tile, number>;
   additionalProductions: { xy: Tile; res: Material; amount: number }[];
   additionalConsumptions: { xy: Tile; res: Material; amount: number }[];
   playerTradeBuildings: Map<Tile, IBuildingData>;
   resourceImportBuildings: Map<Tile, IResourceImportBuildingIndex>;
   globalMultipliers: GlobalMultipliers;
   notProducingReasons: Map<Tile, NotProducingReason>;
   specialBuildings: Map<Building, Required<ITileData>>;
   scienceProduced: Map<Tile, number>;
   powerGrid: Set<Tile>;
   powerPlants: Set<Tile>;
   powerBuildings: Set<Tile>;
   happinessExemptions: Set<Tile>;
   totalValue: number;
   totalBuildingValue: number;
   resourceAmount: Map<Material, number>;
   resourceValues: Map<Material, number>;
   buildingValues: Map<Building, number>;
   buildingValueByTile: Map<Tile, number>;
   resourceValueByTile: Map<Tile, number>;
   amountInTransit: Map<TileAndRes, number>;
   tick: number;
}

export function EmptyTickData(): ITickData {
   return {
      electrified: new Map(),
      notEnoughPower: new Set(),
      levelBoost: new Map(),
      _buildingMultipliers: new Map(),
      unlockedBuildings: new Set(),
      tileMultipliers: new Map(),
      workersAvailable: new Map(),
      workersUsed: new Map(),
      happiness: null,
      workersAssignment: new Map(),
      resourcesByTile: new Map(),
      storagePercentages: new Map(),
      globalMultipliers: new GlobalMultipliers(),
      notProducingReasons: new Map(),
      playerTradeBuildings: new Map(),
      resourceImportBuildings: new Map(),
      additionalProductions: [],
      additionalConsumptions: [],
      specialBuildings: new Map(),
      scienceProduced: new Map(),
      powerGrid: new Set(),
      powerPlants: new Set(),
      powerBuildings: new Set(),
      happinessExemptions: new Set(),
      totalValue: 0,
      totalBuildingValue: 0,
      resourceAmount: new Map(),
      resourceValues: new Map(),
      buildingValues: new Map(),
      buildingValueByTile: new Map(),
      resourceValueByTile: new Map(),
      amountInTransit: new Map(),
      tick: 0,
   };
}

export enum NotProducingReason {
   None = 0,
   NotEnoughResources = 1,
   NotEnoughWorkers = 2,
   StorageFull = 3,
   TurnedOff = 4,
   NotOnDeposit = 5,
   NoActiveTransports = 6,
   NoPower = 7,
}

export class GlobalMultipliers {
   sciencePerIdleWorker: IValueWithSource[] = [];
   sciencePerBusyWorker: IValueWithSource[] = [{ value: 1, source: $t(L.BaseProduction) }];
   builderCapacity: IValueWithSource[] = [{ value: 1, source: $t(L.BaseMultiplier) }];
   transportCapacity: IValueWithSource[] = [];
   happiness: IValueWithSource[] = [];
   // These values are added to each tile.
   output: IValueWithSource[] = [];
   worker: IValueWithSource[] = [];
   storage: IValueWithSource[] = [];
   levelBoost: IValueWithSource[] = [];
}

export const GlobalMultiplierNames: Record<keyof GlobalMultipliers, () => string> = {
   sciencePerBusyWorker: () => $t(L.ScienceFromBusyWorkers),
   sciencePerIdleWorker: () => $t(L.ScienceFromIdleWorkers),
   builderCapacity: () => $t(L.BuilderCapacity),
   happiness: () => $t(L.Happiness),
   transportCapacity: () => $t(L.TransportCapacity),
   output: () => $t(L.ProductionMultiplier),
   worker: () => $t(L.WorkerCapacityMultiplier),
   storage: () => $t(L.StorageMultiplier),
   levelBoost: () => $t(L.LevelBoost),
};

export function freezeTickData(t: ITickData): ITickData {
   let key: keyof ITickData;
   for (key in t) {
      switch (key) {
         case "workersUsed":
            break;
         default:
            Object.freeze(t[key]);
            break;
      }
   }
   return Object.freeze(t);
}

export const Tick = {
   current: freezeTickData(EmptyTickData()),
   next: EmptyTickData(),
};

interface IMultiplier {
   output: number;
   worker: number;
   storage: number;
}

export type Multiplier = RequireAtLeastOne<IMultiplier>;
export type MultiplierWithStability = Multiplier & { unstable?: boolean };
export type MultiplierWithSource = Multiplier & { source: string; unstable?: boolean };
export type LevelBoost = { value: number; source: string };

export const AllMultiplierTypes = ["output", "worker", "storage"] satisfies (keyof IMultiplier)[];

export type MultiplierType = keyof IMultiplier;
export const MultiplierTypeDesc: Record<MultiplierType, () => string> = {
   output: () => $t(L.ProductionMultiplier),
   worker: () => $t(L.WorkerMultiplier),
   storage: () => $t(L.StorageMultiplier),
};

export interface IValueWithSource {
   value: number;
   source: string;
   unstable?: boolean;
}

export const CurrentTickChanged = new TypedEvent<ITickData>();

export function totalEmpireValue(gs: GameState): number {
   let value = 0;
   gs.tiles.forEach((tile) => {
      if (tile.building) {
         value += getBuildingValue(tile.building);
         forEach(tile.building.resources, (res, amount) => {
            if (!NoPrice[res]) {
               value += (Config.MaterialPrice[res] ?? 0) * amount;
            }
         });
      }
   });
   return value;
}

export function calculateCurrentTick(tick: ITickData, gs: GameState): void {
   getTypeBuildings(gs).forEach((buildings, type) => {
      const multipliers = tick._buildingMultipliers.get(type);
      const levelBoost = tick.globalMultipliers.levelBoost;
      buildings.forEach((building) => {
         multipliers?.forEach((m) => {
            mapSafePush(tick.tileMultipliers, building.tile, m);
         });
         levelBoost.forEach((m) => {
            mapSafePush(tick.levelBoost, building.tile, m);
         });
      });
   });
}
