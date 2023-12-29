import { Building } from "../definitions/BuildingDefinitions";
import { Resource } from "../definitions/ResourceDefinitions";
import { PartialSet, PartialTabulate } from "../definitions/TypeDefinitions";
import { IPointArray } from "../utilities/Helper";
import { makeObservableHook } from "../utilities/Hook";
import { RequireAtLeastOne } from "../utilities/Type";
import { TypedEvent } from "../utilities/TypedEvent";
import { L, t } from "../utilities/i18n";
import { calculateHappiness } from "./HappinessLogic";
import { IBuildingData } from "./Tile";

interface ITickData {
   buildingMultipliers: Partial<Record<Building, MultiplierWithSource[]>>;
   tileMultipliers: Partial<Record<string, MultiplierWithSource[]>>;
   unlockedBuildings: PartialSet<Building>;
   workersAvailable: PartialTabulate<Resource>;
   happiness: ReturnType<typeof calculateHappiness> | null;
   workersUsed: PartialTabulate<Resource>;
   workersAssignment: Record<string, number>;
   electrified: Record<string, number>;
   resourcesByXy: Partial<Record<Resource, string[]>>;
   resourcesByGrid: Partial<Record<Resource, IPointArray[]>>;
   playerTradeBuildings: Record<string, IBuildingData>;
   globalMultipliers: GlobalMultipliers;
   notProducingReasons: Record<string, NotProducingReason>;
   specialBuildings: Partial<Record<Building, string>>;
   totalValue: number;
}

export type NotProducingReason =
   | "NotEnoughResources"
   | "NotEnoughWorkers"
   | "StorageFull"
   | "TurnedOff"
   | "NotOnDeposit"
   | "NoActiveTransports";

export function EmptyTickData(): ITickData {
   return {
      electrified: {},
      buildingMultipliers: {},
      unlockedBuildings: {},
      tileMultipliers: {},
      workersAvailable: {},
      workersUsed: {},
      happiness: null,
      workersAssignment: {},
      resourcesByXy: {},
      resourcesByGrid: {},
      globalMultipliers: new GlobalMultipliers(),
      notProducingReasons: {},
      playerTradeBuildings: {},
      specialBuildings: {},
      totalValue: 0,
   };
}

export class GlobalMultipliers {
   sciencePerIdleWorker: IValueWithSource[] = [];
   sciencePerBusyWorker: IValueWithSource[] = [{ value: 1, source: t(L.BaseProduction) }];
   builderCapacity: IValueWithSource[] = [{ value: 1, source: t(L.BaseMultiplier) }];
   transportCapacity: IValueWithSource[] = [];
   happiness: IValueWithSource[] = [];
}

export const GlobalMultiplierNames: Record<keyof GlobalMultipliers, () => string> = {
   sciencePerBusyWorker: () => t(L.ScienceFromBusyWorkers),
   sciencePerIdleWorker: () => t(L.ScienceFromIdleWorkers),
   builderCapacity: () => t(L.BuilderCapacity),
   happiness: () => t(L.Happiness),
   transportCapacity: () => t(L.TransportCapacity),
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
export const useCurrentTick = makeObservableHook(CurrentTickChanged, () => Tick.current);
