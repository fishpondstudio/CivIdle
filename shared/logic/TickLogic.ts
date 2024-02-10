import type { Building } from "../definitions/BuildingDefinitions";
import type { Resource } from "../definitions/ResourceDefinitions";
import { type Tile, forEach } from "../utilities/Helper";
import type { RequireAtLeastOne } from "../utilities/Type";
import type { PartialSet, PartialTabulate } from "../utilities/TypeDefinitions";
import { TypedEvent } from "../utilities/TypedEvent";
import { L, t } from "../utilities/i18n";
import { getBuildingValue } from "./BuildingLogic";
import { Config } from "./Config";
import { GameState } from "./GameState";
import type { calculateHappiness } from "./HappinessLogic";
import type { IBuildingData } from "./Tile";

interface ITickData {
   buildingMultipliers: Map<Building, MultiplierWithSource[]>;
   tileMultipliers: Map<Tile, MultiplierWithSource[]>;
   unlockedBuildings: PartialSet<Building>;
   workersAvailable: PartialTabulate<Resource>;
   happiness: ReturnType<typeof calculateHappiness> | null;
   workersUsed: PartialTabulate<Resource>;
   workersAssignment: Map<Tile, number>;
   electrified: Map<Tile, number>;
   resourcesByTile: Partial<Record<Resource, Tile[]>>;
   playerTradeBuildings: Map<Tile, IBuildingData>;
   globalMultipliers: GlobalMultipliers;
   notProducingReasons: Map<Tile, NotProducingReason>;
   autopilotBuildings: Map<Tile, IBuildingData>;
   specialBuildings: Partial<Record<Building, Tile>>;
   totalValue: number;
}

export function EmptyTickData(): ITickData {
   return {
      electrified: new Map(),
      buildingMultipliers: new Map(),
      unlockedBuildings: {},
      tileMultipliers: new Map(),
      workersAvailable: {},
      workersUsed: {},
      happiness: null,
      workersAssignment: new Map(),
      resourcesByTile: {},
      globalMultipliers: new GlobalMultipliers(),
      notProducingReasons: new Map(),
      autopilotBuildings: new Map(),
      playerTradeBuildings: new Map(),
      specialBuildings: {},
      totalValue: 0,
   };
}

export type NotProducingReason =
   | "NotEnoughResources"
   | "NotEnoughWorkers"
   | "StorageFull"
   | "TurnedOff"
   | "NotOnDeposit"
   | "NoActiveTransports";

export class GlobalMultipliers {
   sciencePerIdleWorker: IValueWithSource[] = [];
   sciencePerBusyWorker: IValueWithSource[] = [{ value: 1, source: t(L.BaseProduction) }];
   builderCapacity: IValueWithSource[] = [{ value: 1, source: t(L.BaseMultiplier) }];
   transportCapacity: IValueWithSource[] = [];
   happiness: IValueWithSource[] = [];
   storage: IValueWithSource[] = [];
}

export const GlobalMultiplierNames: Record<keyof GlobalMultipliers, () => string> = {
   sciencePerBusyWorker: () => t(L.ScienceFromBusyWorkers),
   sciencePerIdleWorker: () => t(L.ScienceFromIdleWorkers),
   builderCapacity: () => t(L.BuilderCapacity),
   happiness: () => t(L.Happiness),
   transportCapacity: () => t(L.TransportCapacity),
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
export type MultiplierWithSource = Multiplier & { source: string };

export type MultiplierType = keyof IMultiplier;
export const MultiplierTypeDesc: Record<MultiplierType, string> = {
   output: t(L.ProductionMultiplier),
   worker: t(L.WorkerMultiplier),
   storage: t(L.StorageMultiplier),
   input: t(L.ConsumptionMultiplier),
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
            if (Config.Resource[res].canPrice) {
               value += (Config.ResourcePrice[res] ?? 0) * amount;
            }
         });
      }
   });
   return value;
}
