import type { Building } from "../definitions/BuildingDefinitions";
import { BuildingSpecial } from "../definitions/BuildingDefinitions";
import { Deposit, NoPrice, NoStorage, type Resource } from "../definitions/ResourceDefinitions";
import {
   clamp,
   forEach,
   hasFlag,
   isEmpty,
   isNullOrUndefined,
   keysOf,
   mReduceOf,
   mapSafeAdd,
   mapSafePush,
   pointToTile,
   reduceOf,
   safeAdd,
   sizeOf,
   sum,
   tileToPoint,
   type Tile,
} from "../utilities/Helper";
import { srand } from "../utilities/Random";
import type { PartialSet, PartialTabulate } from "../utilities/TypeDefinitions";
import { TypedEvent } from "../utilities/TypedEvent";
import { L, t } from "../utilities/i18n";
import { Config } from "./Config";
import { GameFeature, hasFeature } from "./FeatureLogic";
import { GameOptions, type GameState } from "./GameState";
import { getGameOptions, getGameState } from "./GameStateLogic";
import { getBuildingIO, getBuildingsByType, getGrid, getXyBuildings } from "./IntraTickCache";
import { getGreatPersonThisRunLevel, getUpgradeCostFib } from "./RebornLogic";
import { getBuildingsThatProduce, getResourcesValue } from "./ResourceLogic";
import { getAgeForTech, getBuildingUnlockTech } from "./TechLogic";
import { AllMultiplierTypes, Tick, type Multiplier, type MultiplierWithSource } from "./TickLogic";
import {
   BuildingInputMode,
   DEFAULT_STOCKPILE_CAPACITY,
   DEFAULT_STOCKPILE_MAX,
   IMarketBuildingData,
   PRIORITY_MAX,
   PRIORITY_MIN,
   ResourceImportOptions,
   type IBuildingData,
   type IHaveTypeAndLevel,
   type IResourceImportBuildingData,
   type IWarehouseBuildingData,
} from "./Tile";

export function totalMultiplierFor(
   xy: Tile,
   type: keyof Multiplier,
   base: number,
   stableOnly: boolean,
   gs: GameState,
): number {
   let result = base;
   forEachMultiplier(
      xy,
      (m) => {
         result += m[type] ?? 0;
      },
      stableOnly,
      gs,
   );
   return result;
}

function forEachMultiplier(
   xy: Tile,
   func: (m: MultiplierWithSource) => void,
   stableOnly: boolean,
   gs: GameState,
): MultiplierWithSource[] {
   const result: MultiplierWithSource[] = [];
   const b = gs.tiles.get(xy)?.building;
   Tick.current.tileMultipliers.get(xy)?.forEach((m) => {
      if (stableOnly && m.unstable) return;
      func(m);
   });
   if (b) {
      Tick.current.buildingMultipliers.get(b.type)?.forEach((m) => func(m));
   }
   AllMultiplierTypes.forEach((type) => {
      Tick.current.globalMultipliers[type].forEach((m) =>
         func({ [type]: m.value, source: m.source, unstable: false } as MultiplierWithSource),
      );
   });
   return result;
}

export function getMultipliersFor(xy: Tile, gs: GameState): MultiplierWithSource[] {
   const result: MultiplierWithSource[] = [];
   forEachMultiplier(xy, (m) => result.push(m), false, gs);
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

export function getWorkersFor(xy: Tile, gs: GameState): IWorkerRequirement {
   const result: IWorkerRequirement = {
      rawOutput: 0,
      multiplier: 1,
      output: 0,
   };
   const b = gs.tiles.get(xy)?.building;
   // Buildings that produce workers do not cost workers
   if (b && !Config.Building[b.type].output.Worker) {
      forEach(getBuildingIO(xy, "input", IOCalculation.MultiplierExcludeElectrification, gs), (k, v) => {
         if (!NoPrice[k]) result.rawOutput += v;
      });
      forEach(getBuildingIO(xy, "output", IOCalculation.MultiplierExcludeElectrification, gs), (k, v) => {
         if (!NoPrice[k]) result.rawOutput += v;
      });
      result.multiplier = totalMultiplierFor(xy, "worker", 1, false, gs);
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

export function getPetraBaseStorage(petra: IBuildingData): number {
   const HOUR = 60 * 60;
   return HOUR * petra.level;
}

// 1 hour
const STORAGE_TO_PRODUCTION = 3600;

export function getStorageFor(xy: Tile, gs: GameState): IStorageResult {
   const accumulate = (prev: number, k: Resource, v: number): number => {
      return isTransportable(k) ? prev + v : prev;
   };
   const building = gs.tiles.get(xy)?.building;
   const used = reduceOf(building?.resources, accumulate, 0);
   let multiplier = totalMultiplierFor(xy, "storage", 1, true, gs);

   let base = 0;

   switch (building?.type) {
      case "Market": {
         base = building.level * STORAGE_TO_PRODUCTION * 10;
         break;
      }
      case "Caravansary": {
         base = getResourceImportCapacity(building, 1) * STORAGE_TO_PRODUCTION;
         break;
      }
      case "Warehouse": {
         base = getResourceImportCapacity(building, 1) * STORAGE_TO_PRODUCTION * 10;
         break;
      }
      case "Petra": {
         const HOUR = 60 * 60;
         base = getPetraBaseStorage(building);
         base +=
            HOUR * Config.GreatPerson.Zenobia.value(getGreatPersonThisRunLevel(gs.greatPeople.Zenobia ?? 0));
         base += HOUR * Config.GreatPerson.Zenobia.value(getGameOptions().greatPeople.Zenobia?.level ?? 0);
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
   mapSafeAdd(Tick.next.workersUsed, res, amount);
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
   // Normally we read from Tick.current. But this is special - because we want to know if we have enough
   // workers left - Tick.next has that information.
   const workersUsed = Tick.next.workersUsed.get(res) ?? 0;
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
   const workersBeforeHappiness = Math.floor(Tick.current.workersAvailable.get("Worker") ?? 0);
   const happinessPercentage = Tick.current.happiness?.workerPercentage ?? 1;
   const workersAfterHappiness = Math.floor(workersBeforeHappiness * happinessPercentage);
   const workersBusy = Tick.current.workersUsed.get("Worker") ?? 0;
   const sciencePerIdleWorker = sum(Tick.current.globalMultipliers.sciencePerIdleWorker, "value");
   // Because of the worker double buffer, this might be negative. We need to clamp this because we don't
   // want negative science
   const scienceFromIdleWorkers =
      sciencePerIdleWorker * clamp(workersAfterHappiness - workersBusy, 0, Infinity);

   const sciencePerBusyWorker = sum(Tick.current.globalMultipliers.sciencePerBusyWorker, "value");
   const scienceFromBusyWorkers = sciencePerBusyWorker * workersBusy;
   const scienceFromWorkers = scienceFromBusyWorkers + scienceFromIdleWorkers;

   return {
      workersBeforeHappiness,
      happinessPercentage,
      workersAfterHappiness,
      workersBusy,
      scienceFromBusyWorkers,
      sciencePerBusyWorker,
      scienceFromIdleWorkers,
      sciencePerIdleWorker,
      scienceFromWorkers,
   };
}

export function getScienceFromBuildings() {
   return mReduceOf(
      Tick.next.scienceProduced,
      (prev, _, value) => {
         return prev + value;
      },
      0,
   );
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
         300 +
            10 * Math.pow(ageIdx, 3) * Math.pow(techIdx, 2) +
            (100 * Math.pow(5, ageIdx) * Math.pow(1.5, techIdx)) / Math.pow(techIdx, 2),
      );

      keysOf(cost).forEach((res) => {
         const price = Config.ResourcePrice[res] ?? 1;
         cost[res] = (multiplier * cost[res]!) / price;
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

export function getWonderBaseBuilderCapacity(type: Building): number {
   console.assert(isWorldWonder(type), "This only works for World Wonders!");
   const tech = getBuildingUnlockTech(type);
   const totalAmount = reduceOf(getBuildingCost({ type, level: 0 }), (prev, res, value) => prev + value, 0);
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
   const capacity = totalAmount / (500 * (Math.pow(ageIdx, 1.5) + 3) + 50 * Math.pow(techIdx, 1.5));
   return capacity;
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

export function getCurrentPriority(building: IBuildingData, gs: GameState): number {
   if (!hasFeature(GameFeature.BuildingProductionPriority, gs)) {
      return PRIORITY_MIN;
   }

   building.constructionPriority = clamp(building.constructionPriority, PRIORITY_MIN, PRIORITY_MAX);
   building.productionPriority = clamp(building.productionPriority, PRIORITY_MIN, PRIORITY_MAX);

   switch (building.status) {
      case "building":
      case "upgrading":
         return building.constructionPriority;
      case "completed":
         return building.productionPriority;
      default:
         return PRIORITY_MIN;
   }
}

export function getInputMode(building: IBuildingData, gs: GameState): BuildingInputMode {
   if (!hasFeature(GameFeature.BuildingInputMode, gs)) {
      return BuildingInputMode.Distance;
   }
   return building.inputMode;
}

export function getMaxInputDistance(building: IBuildingData, gs: GameState): number {
   if (!hasFeature(GameFeature.BuildingInputMode, gs)) {
      return Infinity;
   }
   return building.maxInputDistance;
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

function levelToNext(b: IBuildingData, x: number) {
   const l = Math.ceil(b.level / x) * x - b.level;
   return l > 0 ? l : x;
}

export function getBuildingUpgradeLevels(b: IBuildingData): number[] {
   return [1, levelToNext(b, 5), levelToNext(b, 10)];
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

export function isHeadquarters(building?: Building): boolean {
   if (!building) {
      return false;
   }
   return Config.Building[building].special === BuildingSpecial.HQ;
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

export function getResourceImportCapacity(building: IHaveTypeAndLevel, multiplier: number): number {
   return multiplier * building.level * 10;
}

export function getWarehouseIdleCapacity(xy: Tile, gs: GameState): number {
   const building = gs.tiles.get(xy)?.building;
   if (building?.type !== "Warehouse") return 0;
   const warehouse = building as IWarehouseBuildingData;
   return (
      getResourceImportCapacity(warehouse, totalMultiplierFor(xy, "output", 1, false, gs)) -
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
      sum(Tick.current.globalMultipliers.builderCapacity, "value") +
      totalMultiplierFor(xy, "worker", 0, false, gs);
   let baseCapacity = clamp(building.level, 1, Infinity);

   if (isWorldWonder(building.type)) {
      baseCapacity = getWonderBaseBuilderCapacity(building.type);
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

export function getMarketBaseSellAmount(sellResource: Resource, buyResource: Resource): number {
   return (
      Math.sqrt((Config.ResourcePrice[sellResource] ?? 0) * (Config.ResourcePrice[buyResource] ?? 0)) /
      (Config.ResourcePrice[sellResource] ?? 1)
   );
}

export function getMarketSellAmount(sellResource: Resource, xy: Tile, gs: GameState): number {
   const building = gs.tiles.get(xy)?.building;
   if (!building || !("availableResources" in building)) return 0;
   const market = building as IMarketBuildingData;
   const buyResource = market.availableResources[sellResource];
   if (!buyResource) return 0;
   return (
      building.level *
      getMarketBaseSellAmount(sellResource, buyResource) *
      totalMultiplierFor(xy, "output", 1, false, gs)
   );
}

export function getMarketBuyAmount(
   sellResource: Resource,
   sellAmount: number,
   buyResource: Resource,
   xy: Tile,
   gs: GameState,
): number {
   const rand = srand(gs.lastPriceUpdated + xy + sellResource);
   const fluctuation =
      1 +
      (1 + (Config.ResourceTier[buyResource] ?? 0) - (Config.ResourceTier[sellResource] ?? 0)) * rand() * 0.1;
   return (
      ((Config.ResourcePrice[sellResource] ?? 0) * sellAmount * fluctuation) /
      (Config.ResourcePrice[buyResource] ?? 0)
   );
}

export function getAvailableResource(sourceXy: Tile, destXy: Tile, res: Resource, gs: GameState): number {
   const building = getXyBuildings(gs).get(sourceXy);

   if (!building) {
      return 0;
   }

   if (!building.resources[res]) {
      return 0;
   }

   if ("resourceImports" in building) {
      const ri = building as IResourceImportBuildingData;

      if (
         building.type === getXyBuildings(gs).get(destXy)?.type &&
         !hasFlag(ri.resourceImportOptions, ResourceImportOptions.ExportToSameType)
      ) {
         return 0;
      }
      const resourceImport = ri.resourceImports[res];
      if (resourceImport && !hasFlag(ri.resourceImportOptions, ResourceImportOptions.ExportBelowCap)) {
         return clamp((building.resources[res] ?? 0) - (resourceImport.cap ?? 0), 0, Infinity);
      }

      return building.resources[res] ?? 0;
   }

   const input = getBuildingIO(sourceXy, "input", IOCalculation.Capacity | IOCalculation.Multiplier, gs);
   if (input[res]) {
      return clamp(
         building.resources[res]! -
            (getStockpileMax(building) + getStockpileCapacity(building)) * input[res]!,
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

export function getPowerRequired(building: IBuildingData): number {
   if (building.electrification <= 0) {
      return 0;
   }
   if (Config.Building[building.type].power) {
      return Math.round(getUpgradeCostFib(building.electrification) * 10);
   }
   return Math.round(Math.pow(2, building.electrification - 1) * 10);
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

export function hasRequiredDeposit(
   deposits: PartialSet<Deposit> | undefined,
   xy: Tile,
   gs: GameState,
): boolean {
   if (!deposits || sizeOf(deposits) === 0) return true;
   const tiles: Tile[] = [xy];

   if (Tick.current.specialBuildings.has("SaintBasilsCathedral")) {
      for (const point of getGrid(gs).getNeighbors(tileToPoint(xy))) {
         tiles.push(pointToTile(point));
      }
   }

   let deposit: Deposit;
   for (deposit in deposits) {
      if (!hasDepositOnAnyTile(deposit, tiles, gs)) {
         return false;
      }
   }

   return true;
}

export function hasEnoughResource(xy: Tile, res: Resource, amount: number, gs: GameState): boolean {
   const resources = gs.tiles.get(xy)?.building?.resources;
   if (!resources) {
      return false;
   }
   return (resources[res] ?? 0) >= amount;
}

export function hasEnoughStorage(xy: Tile, amount: number, gs: GameState): boolean {
   const storage = getStorageFor(xy, gs);
   return storage.total - storage.used >= amount;
}

export function getCompletedBuilding(xy: Tile, gs: GameState): IBuildingData | null {
   const tile = gs.tiles.get(xy);
   if (!tile || !tile.building || tile.building.status === "building") return null;
   return tile.building;
}

function hasDepositOnAnyTile(deposit: Deposit, tiles: Tile[], gs: GameState): boolean {
   for (const xy of tiles) {
      if (gs.tiles.get(xy)?.deposit[deposit]) {
         return true;
      }
   }
   return false;
}

export function getBuildingThatExtract(d: Deposit): Building | null {
   let b: Building;
   for (b in Config.Building) {
      const building = Config.Building[b];
      if (building.deposit?.[d]) {
         return b;
      }
   }
   return null;
}

export function getExtraVisionRange(): number {
   return Tick.current.specialBuildings.has("GreatMosqueOfSamarra") ? 1 : 0;
}

export function applyBuildingDefaults(building: IBuildingData, options: GameOptions): IBuildingData {
   const defaults = options.buildingDefaults[building.type];

   if (defaults) {
      forEach(defaults, (k, v) => {
         if (isNullOrUndefined(v)) {
            delete defaults[k];
         }
      });
   }

   const toApply = defaults ? { ...defaults } : {};

   if (isNullOrUndefined(toApply.stockpileCapacity)) {
      toApply.stockpileCapacity = options.defaultStockpileCapacity;
   }
   if (isNullOrUndefined(toApply.stockpileMax)) {
      toApply.stockpileMax = options.defaultStockpileMax;
   }
   if (isNullOrUndefined(toApply.constructionPriority)) {
      toApply.constructionPriority = options.defaultConstructionPriority;
   }
   if (isNullOrUndefined(toApply.productionPriority)) {
      toApply.productionPriority = options.defaultProductionPriority;
   }
   return Object.assign(building, toApply);
}

export function shouldAlwaysShowBuildingOptions(building: IBuildingData): boolean {
   return "resourceImports" in building || "sellResources" in building;
}

export function isBuildingWellStocked(xy: Tile, gs: GameState): boolean {
   const building = gs.tiles.get(xy)?.building;
   if (!building) {
      return false;
   }
   return (
      !isSpecialBuilding(building.type) &&
      building.status === "completed" &&
      (!Tick.current.notProducingReasons.has(xy) ||
         Tick.current.notProducingReasons.get(xy) === "StorageFull" ||
         Tick.current.notProducingReasons.get(xy) === "NotEnoughWorkers")
   );
}

export function getElectrificationEfficiency(b: Building) {
   if (Config.Building[b].power) {
      return 0.5;
   }
   return 1;
}
