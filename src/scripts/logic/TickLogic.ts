import { Building, BuildingDefinitions } from "../definitions/BuildingDefinitions";
import { Resource, ResourceDefinitions } from "../definitions/ResourceDefinitions";
import { PartialSet, PartialTabulate } from "../definitions/TypeDefinitions";
import { L, t } from "../utilities/i18n";
import { RequireAtLeastOne } from "../utilities/Type";

interface ITickData {
   buildings: BuildingDefinitions;
   resources: ResourceDefinitions;
   buildingMultipliers: Partial<Record<Building, MultiplierWithSource[]>>;
   buildingModifiers: Partial<Record<Building, ModifierWithSource[]>>;
   tileMultipliers: Partial<Record<string, MultiplierWithSource[]>>;
   tileModifiers: Partial<Record<string, ModifierWithSource[]>>;
   unlockedBuildings: PartialSet<Building>;
   workersAvailable: PartialTabulate<Resource>;
   workersUsed: PartialTabulate<Resource>;
   workersAssignment: Record<string, number>;
   resourcesByBuilding: Partial<Record<Resource, string[]>>;
   globalMultipliers: GlobalMultipliers;
}

export function EmptyTickData(): ITickData {
   const buildings = new BuildingDefinitions();
   const resources = new ResourceDefinitions();
   return {
      buildings,
      resources,
      buildingMultipliers: {},
      buildingModifiers: {},
      unlockedBuildings: {},
      tileModifiers: {},
      tileMultipliers: {},
      workersAvailable: {},
      workersUsed: {},
      workersAssignment: {},
      resourcesByBuilding: {},
      globalMultipliers: new GlobalMultipliers(),
   };
}

export class GlobalMultipliers {
   sciencePerIdleWorker: IValueWithSource[] = [{ value: 1, source: t(L.BaseProduction) }];
   sciencePerBusyWorker: IValueWithSource[] = [{ value: 1, source: t(L.BaseProduction) }];
   builderCapacity: IValueWithSource[] = [{ value: 1, source: t(L.BaseProduction) }];
}

export const GlobalMultiplierNames: Record<keyof GlobalMultipliers, () => string> = {
   sciencePerBusyWorker: () => t(L.ScienceFromBusyWorkers),
   sciencePerIdleWorker: () => t(L.ScienceFromIdleWorkers),
   builderCapacity: () => t(L.BuilderCapacity),
};

export const Tick = {
   current: EmptyTickData(),
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

export interface IValueWithSource {
   value: number;
   source: string;
}

export interface IModifier {
   input?: PartialTabulate<Resource>;
   output: PartialTabulate<Resource>;
}

export type ModifierWithSource = IModifier & { source: string };
