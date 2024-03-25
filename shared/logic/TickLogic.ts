import type { Building } from "../definitions/BuildingDefinitions";
import { NoPrice, type Resource } from "../definitions/ResourceDefinitions";
import { forEach, type Tile } from "../utilities/Helper";
import type { RequireAtLeastOne } from "../utilities/Type";
import { TypedEvent } from "../utilities/TypedEvent";
import { L, t } from "../utilities/i18n";
import { getBuildingValue } from "./BuildingLogic";
import { Config } from "./Config";
import { GameState } from "./GameState";
import type { calculateHappiness } from "./HappinessLogic";
import type { IBuildingData } from "./Tile";

export interface IBuildingResource {
   tile: Tile;
   amount: number;
   totalStorage: number;
   usedStorage: number;
}

interface ITickData {
   buildingMultipliers: Map<Building, MultiplierWithSource[]>;
   tileMultipliers: Map<Tile, MultiplierWithSource[]>;
   unlockedBuildings: Set<Building>;
   workersAvailable: Map<Resource, number>;
   happiness: ReturnType<typeof calculateHappiness> | null;
   workersUsed: Map<Resource, number>;
   workersAssignment: Map<Tile, number>;
   electrified: Set<Tile>;
   resourcesByTile: Map<Resource, IBuildingResource[]>;
   playerTradeBuildings: Map<Tile, IBuildingData>;
   globalMultipliers: GlobalMultipliers;
   notProducingReasons: Map<Tile, NotProducingReason>;
   specialBuildings: Map<Building, Tile>;
   totalValue: number;
   scienceProduced: Map<Tile, number>;
   powerGrid: Set<Tile>;
   powerPlants: Set<Tile>;
   powerBuildings: Set<Tile>;
   happinessExemptions: Set<Tile>;
}

export function EmptyTickData(): ITickData {
   return {
      electrified: new Set(),
      buildingMultipliers: new Map(),
      unlockedBuildings: new Set(),
      tileMultipliers: new Map(),
      workersAvailable: new Map(),
      workersUsed: new Map(),
      happiness: null,
      workersAssignment: new Map(),
      resourcesByTile: new Map(),
      globalMultipliers: new GlobalMultipliers(),
      notProducingReasons: new Map(),
      playerTradeBuildings: new Map(),
      specialBuildings: new Map(),
      totalValue: 0,
      scienceProduced: new Map(),
      powerGrid: new Set(),
      powerPlants: new Set(),
      powerBuildings: new Set(),
      happinessExemptions: new Set(),
   };
}

export type NotProducingReason =
   | "NotEnoughResources"
   | "NotEnoughWorkers"
   | "StorageFull"
   | "TurnedOff"
   | "NotOnDeposit"
   | "NoActiveTransports"
   | "NoPower";

export class GlobalMultipliers {
   sciencePerIdleWorker: IValueWithSource[] = [];
   sciencePerBusyWorker: IValueWithSource[] = [{ value: 1, source: t(L.BaseProduction) }];
   builderCapacity: IValueWithSource[] = [{ value: 1, source: t(L.BaseMultiplier) }];
   transportCapacity: IValueWithSource[] = [];
   happiness: IValueWithSource[] = [];
   input: IValueWithSource[] = [];
   output: IValueWithSource[] = [];
   worker: IValueWithSource[] = [];
   storage: IValueWithSource[] = [];
}

export const GlobalMultiplierNames: Record<keyof GlobalMultipliers, () => string> = {
   sciencePerBusyWorker: () => t(L.ScienceFromBusyWorkers),
   sciencePerIdleWorker: () => t(L.ScienceFromIdleWorkers),
   builderCapacity: () => t(L.BuilderCapacity),
   happiness: () => t(L.Happiness),
   transportCapacity: () => t(L.TransportCapacity),
   input: () => t(L.ConsumptionMultiplier),
   output: () => t(L.ProductionMultiplier),
   worker: () => t(L.WorkerCapacityMultiplier),
   storage: () => t(L.StorageMultiplier),
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
   input: number;
   output: number;
   worker: number;
   storage: number;
}

export type Multiplier = RequireAtLeastOne<IMultiplier>;
export type MultiplierWithSource = Multiplier & { source: string; unstable?: boolean };

export const AllMultiplierTypes = ["input", "output", "worker", "storage"] satisfies (keyof IMultiplier)[];

export type MultiplierType = keyof IMultiplier;
export const MultiplierTypeDesc: Record<MultiplierType, () => string> = {
   output: () => t(L.ProductionMultiplier),
   worker: () => t(L.WorkerMultiplier),
   storage: () => t(L.StorageMultiplier),
   input: () => t(L.ConsumptionMultiplier),
};

export interface IValueWithSource {
   value: number;
   source: string;
}

export const CurrentTickChanged = new TypedEvent<ITickData>();

export function totalEmpireValue(gs: GameState): number {
   let value = 0;
   gs.tiles.forEach((tile) => {
      if (tile.building) {
         value += getBuildingValue(tile.building);
         forEach(tile.building.resources, (res, amount) => {
            if (!NoPrice[res]) {
               value += (Config.ResourcePrice[res] ?? 0) * amount;
            }
         });
      }
   });
   return value;
}
