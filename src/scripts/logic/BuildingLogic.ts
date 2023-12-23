import { Building, BuildingSpecial } from "../definitions/BuildingDefinitions";
import { City } from "../definitions/CityDefinitions";
import { IResourceDefinition, Resource } from "../definitions/ResourceDefinitions";
import { PartialTabulate } from "../definitions/TypeDefinitions";
import {
   clamp,
   forEach,
   isEmpty,
   isNullOrUndefined,
   keysOf,
   reduceOf,
   safeAdd,
   safePush,
   sum,
   xyToPoint,
} from "../utilities/Helper";
import { srand } from "../utilities/Random";
import { Textures } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";
import { Config } from "./Constants";
import { GameState } from "./GameState";
import { getBuildingIO, getBuildingsByType, getXyBuildings } from "./IntraTickCache";
import { getBuildingsThatProduce, getResourcesValue } from "./ResourceLogic";
import { getAgeForTech, getBuildingUnlockTech } from "./TechLogic";
import { Multiplier, MultiplierWithSource, NotProducingReason, Tick } from "./TickLogic";
import {
   IBuildingData,
   IHaveTypeAndLevel,
   IHaveTypeLevelAndStatus,
   IResourceImportBuildingData,
   IWarehouseBuildingData,
} from "./Tile";

export function getBuildingTexture(b: Building, textures: Textures, city: City) {
   return textures[`Building${b}_${city}`] ?? textures[`Building${b}`];
}

export function getNotProducingTexture(reason: NotProducingReason, textures: Textures) {
   switch (reason) {
      case "NotEnoughResources":
         return textures.NotEnoughResources;
      case "NotEnoughWorkers":
         return textures.NotEnoughWorkers;
      case "StorageFull":
         return textures.StorageFull;
      default:
         return textures.NotProducingGeneral;
   }
}

export function getTileTexture(r: Resource, textures: Textures) {
   return textures[`Tile${r}`];
}

export function totalMultiplierFor(xy: string, type: keyof Multiplier, base: number, gs: GameState): number {
   let result = base;
   forEachMultiplier(
      xy,
      (m) => {
         result += m[type] ?? 0;
      },
      gs,
   );
   return result;
}

function forEachMultiplier(
   xy: string,
   func: (m: MultiplierWithSource) => void,
   gs: GameState,
): MultiplierWithSource[] {
   const result: MultiplierWithSource[] = [];
   const b = gs.tiles[xy].building;
   Tick.current.tileMultipliers[xy]?.forEach((m) => func(m));
   if (b) {
      Tick.current.buildingMultipliers[b.type]?.forEach((m) => func(m));
   }
   return result;
}

export function getMultipliersFor(xy: string, gs: GameState): MultiplierWithSource[] {
   const result: MultiplierWithSource[] = [];
   forEachMultiplier(xy, (m) => result.push(m), gs);
   return result;
}

export enum IOCalculation {
   None = 0,
   Capacity = 1 << 0,
   Multiplier = 1 << 1,
}

export function hasEnoughResources(a: PartialTabulate<Resource>, b: PartialTabulate<Resource>): boolean {
   let res: Resource;
   for (res in b) {
      if ((a[res] ?? 0) < (b[res] ?? 0)) {
         return false;
      }
   }
   return true;
}

export function deductResources(
   a: PartialTabulate<Resource>,
   b: PartialTabulate<Resource>,
): PartialTabulate<Resource> {
   let res: Resource;
   for (res in b) {
      if (!a[res] || a[res]! < b[res]!) {
         console.warn(`Not enough ${res} when trying to deduct`, b, "from", a);
         a[res] = 0;
      } else {
         // biome-ignore lint/suspicious/noExtraNonNullAssertion: <explanation>
         a[res]! -= b[res]!;
      }
   }
   return a;
}

export function addResources(
   a: PartialTabulate<Resource>,
   b: PartialTabulate<Resource>,
): PartialTabulate<Resource> {
   let res: Resource;
   for (res in b) {
      safeAdd(a, res, b[res]!);
   }
   return a;
}

export function filterTransportable(resources: PartialTabulate<Resource>): PartialTabulate<Resource> {
   const result: PartialTabulate<Resource> = {};
   let res: Resource;
   for (res in resources) {
      if (isTransportable(res)) {
         result[res] = resources[res];
      }
   }
   return result;
}

interface IWorkerRequirement {
   rawOutput: number;
   multiplier: number;
   output: number;
}

export function getWorkersFor(
   xy: string,
   filter: { include: Partial<Record<Resource, number>> } | { exclude: Partial<Record<Resource, number>> },
   gs: GameState,
): IWorkerRequirement {
   const result: IWorkerRequirement = {
      rawOutput: 0,
      multiplier: 1,
      output: 0,
   };
   const b = gs.tiles[xy].building;
   if (b) {
      forEach(getBuildingIO(xy, "output", IOCalculation.Capacity, gs), (k, v) => {
         if ("include" in filter && k in filter.include) {
            result.rawOutput += v;
            return;
         }
         if ("exclude" in filter && !(k in filter.exclude)) {
            result.rawOutput += v;
         }
      });
      result.multiplier = totalMultiplierFor(xy, "worker", 1, gs);
   }
   result.output = Math.ceil(result.rawOutput / result.multiplier);
   return result;
}

export function checkBuildingMax(k: Building, gs: GameState): boolean {
   const buildingCount = reduceOf(
      gs.tiles,
      (prev, _xy, tile) => prev + (tile.building?.type === k ? 1 : 0),
      0,
   );
   return buildingCount < (Tick.current.buildings[k].max ?? Infinity);
}

export function isTransportable(res: Resource) {
   return Tick.current.resources[res].canStore;
}

interface IStorageResult {
   base: number;
   multiplier: number;
   total: number;
   used: number;
}

// 1 hour
const STORAGE_TO_PRODUCTION = 3600;

export function getStorageFor(xy: string, gs: GameState): IStorageResult {
   const accumulate = (prev: number, k: Resource, v: number): number => {
      return isTransportable(k) ? prev + v : prev;
   };
   const building = gs.tiles[xy].building;
   const used = reduceOf(building?.resources, accumulate, 0);
   let multiplier = totalMultiplierFor(xy, "storage", 1, gs);

   let base = 0;

   switch (building?.type) {
      case "Caravansary": {
         base = building.level * STORAGE_TO_PRODUCTION * 10;
         break;
      }
      case "Market": {
         base = building.level * STORAGE_TO_PRODUCTION * 10;
         break;
      }
      case "Warehouse": {
         base = building.level * STORAGE_TO_PRODUCTION * 100;

         break;
      }
      case "Petra": {
         base = 60 * 60 * building.level; // 1 hour
         multiplier = 1;
         break;
      }
      case "StPetersBasilica": {
         let count = 0;
         getBuildingsThatProduce("Faith").forEach((b) => {
            forEach(getBuildingsByType(b, gs), (xy, tile) => {
               count += tile.building.level;
            });
         });
         base = count * ST_PETERS_STORAGE_MULTIPLIER;
         break;
      }
      default: {
         base =
            60 * reduceOf(getBuildingIO(xy, "input", IOCalculation.Multiplier, gs), accumulate, 0) +
            STORAGE_TO_PRODUCTION *
               reduceOf(getBuildingIO(xy, "output", IOCalculation.Multiplier, gs), accumulate, 0);
         break;
      }
   }
   return { base, multiplier, total: base * multiplier, used };
}

export function getStorageRequired(res: PartialTabulate<Resource>): number {
   let result = 0;
   forEach(res, (k, v) => {
      if (isTransportable(k)) {
         result += v;
      }
   });
   return result;
}

export function addWorkers(res: Resource, amount: number): void {
   safeAdd(Tick.next.workersAvailable, res, amount);
}

export function useWorkers(res: Resource, amount: number, xy: string | null): void {
   if (Tick.current.resources[res].canStore) {
      console.error("`useWorkers` can only be called with non-transportable resource!");
      return;
   }
   safeAdd(Tick.current.workersUsed, res, amount);
   if (xy) {
      safeAdd(Tick.current.workersAssignment, xy, amount);
   }
}

export function getAvailableWorkers(res: Resource): number {
   if (!Tick.current.workersAvailable[res]) {
      Tick.current.workersAvailable[res] = 0;
   }
   if (!Tick.current.workersUsed[res]) {
      Tick.current.workersUsed[res] = 0;
   }
   return (
      Math.floor(Tick.current.workersAvailable[res]! * (Tick.current.happiness?.workerPercentage ?? 1)) -
      Tick.current.workersUsed[res]!
   );
}

// export function hasEnoughWorkers(res: Resource, amount: number): boolean {
//    if (!Tick.current.workersAvailable[res]) {
//       Tick.current.workersAvailable[res] = 0;
//    }
//    if (!Tick.current.workersUsed[res]) {
//       Tick.current.workersUsed[res] = 0;
//    }
//    return (
//       Math.floor(Tick.current.workersAvailable[res]! * (Tick.current.happiness?.workerPercentage ?? 1)) >=
//       Tick.current.workersUsed[res]! + amount
//    );
// }

export function getResourceName(r: Resource): string {
   return Tick.current.resources[r].name();
}

export function getBuildingName(xy: string, gs: GameState): string {
   const type = gs.tiles[xy].building?.type;
   if (!type) {
      return "";
   }
   return Tick.current.buildings[type].name();
}

export function filterResource<T>(
   resources: Partial<Record<Resource, T>>,
   filter: Pick<IResourceDefinition, "canStore">,
): Partial<Record<Resource, T>> {
   const result: Partial<Record<Resource, T>> = {};
   let key: Resource;
   for (key in resources) {
      if (Tick.current.resources[key].canStore === filter.canStore) {
         result[key] = resources[key];
      }
   }
   return result;
}

export function getStockpileMax(b: IBuildingData) {
   return b.stockpileMax === 0 ? Infinity : b.stockpileMax;
}

export function addTransportation(
   resource: Resource,
   amount: number,
   fuelResource: Resource,
   fuelAmount: number,
   fromXy: string,
   toXy: string,
   gs: GameState,
): void {
   const fromGrid = xyToPoint(fromXy);
   const fromPosition = Singleton().grid.gridToPosition(fromGrid);
   const toGrid = xyToPoint(toXy);
   const toPosition = Singleton().grid.gridToPosition(toGrid);
   useWorkers(fuelResource, fuelAmount, null);
   safePush(gs.transportation, toXy, {
      id: ++gs.transportId,
      fromXy,
      toXy,
      fromPosition,
      toPosition,
      ticksRequired: Singleton().grid.distance(fromGrid.x, fromGrid.y, toGrid.x, toGrid.y),
      ticksSpent: 0,
      resource,
      amount,
      fuel: "Worker",
      fuelAmount,
      currentFuelAmount: fuelAmount,
      hasEnoughFuel: true,
   });
}

export function getScienceFromWorkers(gs: GameState) {
   const workersAvailable = Tick.current.workersAvailable.Worker ?? 0;
   const happinessPercentage = Tick.current.happiness?.workerPercentage ?? 1;
   const workersAvailableAfterHappiness = Math.floor(workersAvailable * happinessPercentage);
   const workersBusy = Tick.current.workersUsed.Worker ?? 0;
   const sciencePerIdleWorker = sum(Tick.current.globalMultipliers.sciencePerIdleWorker, "value");
   const scienceFromIdleWorkers = sciencePerIdleWorker * (workersAvailableAfterHappiness - workersBusy);

   const sciencePerBusyWorker = sum(Tick.current.globalMultipliers.sciencePerBusyWorker, "value");
   const scienceFromBusyWorkers = sciencePerBusyWorker * workersBusy;
   const scienceFromWorkers = scienceFromBusyWorkers + scienceFromIdleWorkers;

   return {
      workersAvailable,
      happinessPercentage,
      workersAvailableAfterHappiness,
      workersBusy,
      scienceFromBusyWorkers,
      sciencePerBusyWorker,
      scienceFromIdleWorkers,
      sciencePerIdleWorker,
      scienceFromWorkers,
   };
}

export function getBuildingCost(
   building: Pick<IBuildingData, "type" | "level" | "status">,
): PartialTabulate<Resource> {
   const type = building.type;
   const level = building.status === "building" ? 0 : building.level;
   let cost = { ...Tick.current.buildings[type].construction };
   if (isEmpty(cost)) {
      cost = { ...Tick.current.buildings[type].input } ?? {};
   }
   if (isEmpty(cost)) {
      return {};
   }
   let multiplier = 10;
   // This is a wonder, we apply the wonder multiplier here
   if (isWorldWonder(building.type)) {
      const tech = getBuildingUnlockTech(building.type);
      let techIdx = 0;
      let ageIdx = 0;
      if (tech) {
         techIdx = Config.Tech[tech].column;
         const a = getAgeForTech(tech);
         if (a) {
            const age = Config.TechAge[a];
            ageIdx = age.idx;
         }
      }
      multiplier = Math.round(10 + Math.pow(5, ageIdx) * Math.pow(1.5, techIdx));
   }

   keysOf(cost).forEach((res) => {
      cost[res] = Math.pow(1.5, level) * multiplier * cost[res]!;
   });
   return cost;
}

export function getTotalBuildingCost(
   building: Building,
   currentLevel: number,
   desiredLevel: number,
): PartialTabulate<Resource> {
   console.assert(currentLevel <= desiredLevel);
   const start: IHaveTypeLevelAndStatus = {
      type: building,
      level: currentLevel,
      status: currentLevel === 0 ? "building" : "upgrading",
   };
   const result: PartialTabulate<Resource> = {};
   while (start.level < desiredLevel) {
      const cost = getBuildingCost(start);
      forEach(cost, (res, amount) => safeAdd(result, res, amount));
      ++start.level;
   }
   return result;
}

export function getBuildingValue(building: IBuildingData): number {
   return getResourcesValue(getTotalBuildingCost(building.type, 0, building.level));
}

export function getTotalBuildingUpgrades(gs: GameState): number {
   let result = 0;
   forEach(gs.tiles, (xy, tile) => {
      if (tile.building) {
         if (!isSpecialBuilding(tile.building.type)) {
            result += tile.building.level;
         }
      }
   });
   return result;
}

export function getBuildingPercentage(xy: string, cost: PartialTabulate<Resource>, gs: GameState): number {
   const building = gs.tiles[xy]?.building;
   if (!building) {
      return 0;
   }
   if (building.status === "completed") {
      return 1;
   }
   let totalCost = 0;
   let inStorage = 0;
   forEach(cost, (res, amount) => {
      totalCost += amount;
      inStorage += clamp(building.resources[res] ?? 0, 0, amount);
   });
   return inStorage / totalCost;
}

export function getBuildingLevelLabel(b: IBuildingData): string {
   if (Tick.current.buildings[b.type].special === BuildingSpecial.HQ || isWorldOrNaturalWonder(b.type)) {
      return "";
   }
   return String(b.level);
}

export function levelToNext10s(b: IBuildingData) {
   const l = Math.ceil(b.level / 10) * 10 - b.level;
   return l > 0 ? l : 10;
}

export function getBuildingUpgradeLevels(b: IBuildingData): number[] {
   const next10s = levelToNext10s(b);
   const levels = [1, 5];
   if (!levels.includes(next10s)) {
      levels.push(next10s);
   }
   return levels;
}

export function isSpecialBuilding(building: Building): boolean {
   return !isNullOrUndefined(Tick.current.buildings[building].special);
}

export function isNaturalWonder(building: Building): boolean {
   return Tick.current.buildings[building].special === BuildingSpecial.NaturalWonder;
}

export function isWorldWonder(building: Building): boolean {
   return Tick.current.buildings[building].special === BuildingSpecial.WorldWonder;
}

export function isWorldOrNaturalWonder(building: Building): boolean {
   return isNaturalWonder(building) || isWorldWonder(building);
}

export function getWarehouseCapacity(building: IHaveTypeAndLevel): number {
   return building.level * 10;
}

export function getWarehouseIdleCapacity(warehouse: IWarehouseBuildingData): number {
   return (
      getWarehouseCapacity(warehouse) -
      reduceOf(
         warehouse.resourceImports,
         (prev, k, v) => {
            return prev + v.perCycle;
         },
         0,
      )
   );
}

export function getBuilderCapacity(
   building: IHaveTypeAndLevel,
   xy: string,
   gs: GameState,
): { multiplier: number; base: number; total: number } {
   const builder =
      sum(Tick.current.globalMultipliers.builderCapacity, "value") + totalMultiplierFor(xy, "worker", 0, gs);
   let baseCapacity = building.level;

   if (isWorldWonder(building.type)) {
      const tech = getBuildingUnlockTech(building.type);
      let techIdx = 0;
      let ageIdx = 0;
      if (tech) {
         techIdx = Config.Tech[tech].column;
         const a = getAgeForTech(tech);
         if (a) {
            const age = Config.TechAge[a];
            ageIdx = age.idx;
         }
      }
      baseCapacity = Math.round(Math.pow(5, ageIdx) + techIdx * 2);
   }

   return { multiplier: builder, base: baseCapacity, total: builder * baseCapacity };
}

export function applyToAllBuildings<T extends IBuildingData>(
   building: Building,
   settings: Partial<T>,
   gs: GameState,
) {
   forEach(getBuildingsByType(building, gs), (xy, tile) => {
      Object.assign(tile.building, settings);
   });
}

export function getMarketPrice(resource: Resource, xy: string, gs: GameState): number {
   const rand = srand(gs.lastPriceUpdated + xy + resource);
   const fluctuation = 0.75 + rand() * 0.5;
   return (Config.ResourcePrice[resource] ?? 0) * fluctuation;
}

export function getAvailableResource(xy: string, res: Resource, gs: GameState): number {
   const building = getXyBuildings(gs)[xy];

   if (!building) {
      return 0;
   }

   if (!building.resources[res]) {
      return 0;
   }

   if ("resourceImports" in building) {
      const ri = building as IResourceImportBuildingData;
      if (ri.resourceImports[res]) {
         return clamp(building.resources[res]! - (ri.resourceImports[res]?.cap ?? 0), 0, Infinity);
      }
      return building.resources[res]!;
   }

   if (!Tick.current.buildings[building.type].input[res]) {
      return building.resources[res]!;
   }

   const input = getBuildingIO(xy, "input", IOCalculation.Capacity | IOCalculation.Multiplier, gs);
   if (input[res]) {
      return clamp(
         building.resources[res]! - (getStockpileMax(building) + building.stockpileCapacity) * input[res]!,
         0,
         Infinity,
      );
   }
   return building.resources[res]!;
}

export const ST_PETERS_FAITH_MULTIPLIER = 0.01;
export const ST_PETERS_STORAGE_MULTIPLIER = 10 * 60 * 60;
