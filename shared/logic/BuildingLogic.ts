import type { Building } from "../definitions/BuildingDefinitions";
import { BuildingSpecial } from "../definitions/BuildingDefinitions";
import { NoStorage, type Resource } from "../definitions/ResourceDefinitions";
import {
   clamp,
   forEach,
   isEmpty,
   isNullOrUndefined,
   keysOf,
   mReduceOf,
   mapSafeAdd,
   mapSafePush,
   reduceOf,
   safeAdd,
   sizeOf,
   sum,
   tileToPoint,
   type Tile,
} from "../utilities/Helper";
import { srand } from "../utilities/Random";
import type { PartialTabulate } from "../utilities/TypeDefinitions";
import { TypedEvent } from "../utilities/TypedEvent";
import { L, t } from "../utilities/i18n";
import { Config } from "./Config";
import { GameFeature, hasFeature } from "./FeatureLogic";
import { type GameState } from "./GameState";
import { getGameState } from "./GameStateLogic";
import { getBuildingIO, getBuildingsByType, getGrid, getXyBuildings } from "./IntraTickCache";
import { getBuildingsThatProduce, getResourcesValue } from "./ResourceLogic";
import { getAgeForTech, getBuildingUnlockTech } from "./TechLogic";
import { Tick, type Multiplier, type MultiplierWithSource } from "./TickLogic";
import {
   DEFAULT_STOCKPILE_CAPACITY,
   DEFAULT_STOCKPILE_MAX,
   getConstructionPriority,
   getProductionPriority,
   getUpgradePriority,
   type IBuildingData,
   type IHaveTypeAndLevel,
   type IResourceImportBuildingData,
   type IWarehouseBuildingData,
} from "./Tile";

export function totalMultiplierFor(xy: Tile, type: keyof Multiplier, base: number, gs: GameState): number {
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
   xy: Tile,
   func: (m: MultiplierWithSource) => void,
   gs: GameState,
): MultiplierWithSource[] {
   const result: MultiplierWithSource[] = [];
   const b = gs.tiles.get(xy)?.building;
   Tick.current.tileMultipliers.get(xy)?.forEach((m) => func(m));
   if (b) {
      Tick.current.buildingMultipliers.get(b.type)?.forEach((m) => func(m));
   }
   Tick.current.globalMultipliers.storage.forEach((m) => func({ storage: m.value, source: m.source }));
   return result;
}

export function getMultipliersFor(xy: Tile, gs: GameState): MultiplierWithSource[] {
   const result: MultiplierWithSource[] = [];
   forEachMultiplier(xy, (m) => result.push(m), gs);
   return result;
}

export enum IOCalculation {
   None = 0,
   Capacity = 1 << 0,
   Multiplier = 1 << 1,
   MultiplierExcludeElectrification = 1 << 2,
   TotalUsedBits = 3,
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
   xy: Tile,
   filter: { include: Partial<Record<Resource, number>> } | { exclude: Partial<Record<Resource, number>> },
   gs: GameState,
): IWorkerRequirement {
   const result: IWorkerRequirement = {
      rawOutput: 0,
      multiplier: 1,
      output: 0,
   };
   const b = gs.tiles.get(xy)?.building;
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
   const buildingCount = mReduceOf(
      gs.tiles,
      (prev, _xy, tile) => prev + (tile.building?.type === k ? 1 : 0),
      0,
   );
   return buildingCount < (Config.Building[k].max ?? Infinity);
}

export function isTransportable(res: Resource): boolean {
   return !NoStorage[res];
}

interface IStorageResult {
   base: number;
   multiplier: number;
   total: number;
   used: number;
}

// 1 hour
const STORAGE_TO_PRODUCTION = 3600;

export function getStorageFor(xy: Tile, gs: GameState): IStorageResult {
   const accumulate = (prev: number, k: Resource, v: number): number => {
      return isTransportable(k) ? prev + v : prev;
   };
   const building = gs.tiles.get(xy)?.building;
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
            getBuildingsByType(b, gs)?.forEach((tile, xy) => {
               if (tile.building.status === "completed") {
                  count += tile.building.level;
               }
            });
         });
         base = count * ST_PETERS_STORAGE_MULTIPLIER;
         multiplier = 1;
         break;
      }
      default: {
         base =
            60 *
               reduceOf(
                  getBuildingIO(xy, "input", IOCalculation.MultiplierExcludeElectrification, gs),
                  accumulate,
                  0,
               ) +
            STORAGE_TO_PRODUCTION *
               reduceOf(
                  getBuildingIO(xy, "output", IOCalculation.MultiplierExcludeElectrification, gs),
                  accumulate,
                  0,
               );
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
   mapSafeAdd(Tick.next.workersAvailable, res, amount);
}

export function useWorkers(res: Resource, amount: number, xy: Tile | null): void {
   if (isTransportable(res)) {
      console.error("`useWorkers` can only be called with non-transportable resource!");
      return;
   }
   // Normally, we write to Tick.next and read from Tick.current. This is the only exception!
   mapSafeAdd(Tick.current.workersUsed, res, amount);
   if (isNullOrUndefined(xy)) {
      return;
   }
   switch (res) {
      case "Worker": {
         mapSafeAdd(Tick.next.workersAssignment, xy, amount);
         break;
      }
   }
}

export function getAvailableWorkers(res: Resource): number {
   const workersAvailable = Tick.current.workersAvailable.get(res) ?? 0;
   const workersUsed = Tick.current.workersUsed.get(res) ?? 0;
   let pct = 1;
   if (res === "Worker") {
      pct = Tick.current.happiness?.workerPercentage ?? 1;
   }
   return Math.floor(workersAvailable * pct) - workersUsed;
}

export function getResourceName(r: Resource): string {
   return Config.Resource[r].name();
}

export function getBuildingName(xy: Tile, gs: GameState): string {
   const type = gs.tiles.get(xy)?.building?.type;
   if (!type) {
      return "";
   }
   return Config.Building[type].name();
}

export function filterNonTransportable<T>(
   resources: Partial<Record<Resource, T>>,
): Partial<Record<Resource, T>> {
   const result: Partial<Record<Resource, T>> = {};
   let key: Resource;
   for (key in resources) {
      if (!isTransportable(key)) {
         result[key] = resources[key];
      }
   }
   return result;
}

export function getStockpileMax(b: IBuildingData) {
   if (hasFeature(GameFeature.BuildingStockpileMode, getGameState())) {
      return b.stockpileMax === 0 ? Infinity : b.stockpileMax;
   }
   return DEFAULT_STOCKPILE_MAX;
}

export function getStockpileCapacity(b: IBuildingData) {
   if (hasFeature(GameFeature.BuildingStockpileMode, getGameState())) {
      return b.stockpileCapacity;
   }
   return DEFAULT_STOCKPILE_CAPACITY;
}

export function addTransportation(
   resource: Resource,
   amount: number,
   fuelResource: Resource,
   fuelAmount: number,
   fromXy: Tile,
   toXy: Tile,
   gs: GameState,
): void {
   const fromGrid = tileToPoint(fromXy);
   const fromPosition = getGrid(gs).gridToPosition(fromGrid);
   const toGrid = tileToPoint(toXy);
   const toPosition = getGrid(gs).gridToPosition(toGrid);
   useWorkers(fuelResource, fuelAmount, null);
   mapSafePush(gs.transportation, toXy, {
      id: ++gs.transportId,
      fromXy,
      toXy,
      fromPosition,
      toPosition,
      ticksRequired: getGrid(gs).distance(fromGrid.x, fromGrid.y, toGrid.x, toGrid.y),
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
   const workersAvailable = Tick.current.workersAvailable.get("Worker") ?? 0;
   const happinessPercentage = Tick.current.happiness?.workerPercentage ?? 1;
   const workersAvailableAfterHappiness = Math.floor(workersAvailable * happinessPercentage);
   const workersBusy = Tick.current.workersUsed.get("Worker") ?? 0;
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

const buildingCostCache: Map<number, Readonly<PartialTabulate<Resource>>> = new Map();

export function getBuildingCost(building: Pick<IBuildingData, "type" | "level">): PartialTabulate<Resource> {
   const type = building.type;
   const level = building.level;
   const key = (Config.BuildingHash[building.type]! << 16) + level;
   const cached = buildingCostCache.get(key);
   if (cached) {
      return cached;
   }
   let cost = { ...Config.Building[type].construction };
   if (isEmpty(cost)) {
      cost = { ...Config.Building[type].input };
   }
   if (isEmpty(cost)) {
      return {};
   }

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
      const multiplier = Math.round(
         100 + 100 * Math.pow(techIdx, 2) + Math.pow(5, ageIdx) * Math.pow(1.5, techIdx),
      );

      keysOf(cost).forEach((res) => {
         const tier = Config.ResourceTier[res] ?? 1;
         const price = Config.ResourcePrice[res] ?? 1;
         cost[res] = (multiplier * cost[res]! * tier) / Math.pow(price, 0.9);
      });
   } else {
      const multiplier = 10;
      keysOf(cost).forEach((res) => {
         cost[res] = Math.pow(1.5, level) * multiplier * cost[res]!;
      });
   }
   buildingCostCache.set(key, Object.freeze(cost));
   return cost;
}

const totalBuildingCostCache: Map<number, Readonly<PartialTabulate<Resource>>> = new Map();

export function getTotalBuildingCost(
   building: Building,
   currentLevel: number,
   desiredLevel: number,
): PartialTabulate<Resource> {
   console.assert(currentLevel <= desiredLevel);
   const hash = (Config.BuildingHash[building]! << 22) + (currentLevel << 11) + desiredLevel;
   const cached = totalBuildingCostCache.get(hash);
   if (cached) {
      return cached;
   }
   const start: IHaveTypeAndLevel = {
      type: building,
      level: currentLevel,
   };
   const result: PartialTabulate<Resource> = {};
   while (start.level < desiredLevel) {
      const cost = getBuildingCost(start);
      forEach(cost, (res, amount) => safeAdd(result, res, amount));
      ++start.level;
   }
   totalBuildingCostCache.set(hash, Object.freeze(result));
   return result;
}

export function getBuildingValue(building: IBuildingData): number {
   return getResourcesValue(getTotalBuildingCost(building.type, 0, building.level));
}

export function getCurrentPriority(building: IBuildingData): number {
   switch (building.status) {
      case "building":
         return getConstructionPriority(building.priority);
      case "upgrading":
         return getUpgradePriority(building.priority);
      case "completed":
         return getProductionPriority(building.priority);
      default:
         return 0;
   }
}

export function getTotalBuildingUpgrades(gs: GameState): number {
   let result = 0;
   getXyBuildings(gs).forEach((building) => {
      if (!isSpecialBuilding(building.type)) {
         result += building.level;
      }
   });
   return result;
}

interface BuildingPercentageResult {
   percent: number;
   secondsLeft: number;
   cost: PartialTabulate<Resource>;
}

export function getBuildingPercentage(xy: Tile, gs: GameState): BuildingPercentageResult {
   const building = gs.tiles.get(xy)?.building;
   if (!building) {
      return { percent: 0, secondsLeft: Infinity, cost: {} };
   }
   if (building.status === "completed") {
      return { percent: 1, secondsLeft: 0, cost: {} };
   }
   const { total } = getBuilderCapacity(building, xy, gs);
   const cost = getBuildingCost(building);
   let totalCost = 0;
   let inStorage = 0;
   forEach(cost, (res, amount) => {
      totalCost += amount;
      inStorage += clamp(building.resources[res] ?? 0, 0, amount);
   });
   return { cost, percent: inStorage / totalCost, secondsLeft: Math.ceil((totalCost - inStorage) / total) };
}

export function getBuildingLevelLabel(b: IBuildingData): string {
   if (Config.Building[b.type].special === BuildingSpecial.HQ || isWorldOrNaturalWonder(b.type)) {
      return "";
   }
   return String(b.level);
}

export function levelToNext5s(b: IBuildingData) {
   const l = Math.ceil(b.level / 5) * 5 - b.level;
   return l > 0 ? l : 5;
}

export function levelToNext10s(b: IBuildingData) {
   const l = Math.ceil(b.level / 10) * 10 - b.level;
   return l > 0 ? l : 10;
}

export function getBuildingUpgradeLevels(b: IBuildingData): number[] {
   const next5s = levelToNext5s(b);
   const next10s = levelToNext10s(b);
   const levels = [1];
   if (!levels.includes(next5s)) {
      levels.push(next5s);
   }
   if (!levels.includes(next10s)) {
      levels.push(next10s);
   }
   return levels;
}

export function isSpecialBuilding(building?: Building): boolean {
   if (!building) {
      return false;
   }
   return !isNullOrUndefined(Config.Building[building].special);
}

export function isNaturalWonder(building?: Building): boolean {
   if (!building) {
      return false;
   }
   return Config.Building[building].special === BuildingSpecial.NaturalWonder;
}

export function isWorldWonder(building?: Building): boolean {
   if (!building) {
      return false;
   }
   return Config.Building[building].special === BuildingSpecial.WorldWonder;
}

export function isWorldOrNaturalWonder(building?: Building): boolean {
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
   xy: Tile,
   gs: GameState,
): { multiplier: number; base: number; total: number } {
   const builder =
      sum(Tick.current.globalMultipliers.builderCapacity, "value") + totalMultiplierFor(xy, "worker", 0, gs);
   let baseCapacity = clamp(building.level, 1, Infinity);

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
   getOptions: (b: IBuildingData) => Partial<T>,
   gs: GameState,
) {
   getBuildingsByType(building, gs)?.forEach((tile, xy) => {
      Object.assign(tile.building, getOptions(tile.building));
   });
}

export function getMarketPrice(resource: Resource, xy: Tile, gs: GameState): number {
   const rand = srand(gs.lastPriceUpdated + xy + resource);
   const fluctuation = 0.75 + rand() * 0.5;
   return (Config.ResourcePrice[resource] ?? 0) * fluctuation;
}

export function getAvailableResource(xy: Tile, res: Resource, gs: GameState): number {
   const building = getXyBuildings(gs).get(xy);

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

   if (!Config.Building[building.type].input[res]) {
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

export function exploreTile(xy: Tile, gs: GameState): void {
   const tile = gs.tiles.get(xy);
   if (tile && !tile.explored) {
      tile.explored = true;
      OnTileExplored.emit(xy);
   }
}

export const OnTileExplored = new TypedEvent<Tile>();

export const ST_PETERS_FAITH_MULTIPLIER = 0.01;
export const ST_PETERS_STORAGE_MULTIPLIER = 10 * 60 * 60;

export function getPowerRequired(electrification: number): number {
   return electrification <= 0 ? 0 : Math.round(Math.pow(2, electrification - 1) * 10);
}

export function canBeElectrified(b: Building): boolean {
   if (isSpecialBuilding(b)) {
      return false;
   }
   const output = Config.Building[b].output;
   if (sizeOf(output) <= 0) {
      return false;
   }
   let res: Resource;
   for (res in output) {
      if (NoStorage[res]) {
         return false;
      }
   }
   return true;
}

export const ElectrificationStatus = {
   NotActive: () => t(L.ElectrificationStatusNotActive),
   NoPower: () => t(L.ElectrificationStatusNoPower),
   Active: () => t(L.ElectrificationStatusActive),
} as const satisfies Record<string, () => string>;

export type ElectrificationStatus = keyof typeof ElectrificationStatus;

export function getElectrificationStatus(xy: Tile, gs: GameState): ElectrificationStatus {
   const building = gs.tiles.get(xy)?.building;
   if (!building || !canBeElectrified(building.type)) {
      return "NotActive";
   }
   if (building.electrification <= 0) {
      return "NotActive";
   }
   if (Tick.current.notProducingReasons.has(xy)) {
      return "NotActive";
   }
   if (Tick.current.electrified.has(xy)) {
      return "Active";
   }
   return "NoPower";
}
