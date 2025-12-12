import type { Building } from "../definitions/BuildingDefinitions";
import {
   BuildingShowLevel,
   BuildingSpecial,
   IgnoreBuildingUpgradeValue,
   UpgradableWorldWonders,
   WonderCostBase,
} from "../definitions/BuildingDefinitions";
import type { City } from "../definitions/CityDefinitions";
import type { GreatPerson } from "../definitions/GreatPersonDefinitions";
import type { IUnlockableMultipliers } from "../definitions/ITechDefinition";
import { NoPrice, NoStorage, type Deposit, type Material } from "../definitions/MaterialDefinitions";
import type { Religion } from "../definitions/ReligionDefinitions";
import type { Tradition } from "../definitions/TraditionDefinitions";
import {
   clamp,
   forEach,
   hasFlag,
   isEmpty,
   isNullOrUndefined,
   keysOf,
   mReduceOf,
   mapOf,
   mapSafeAdd,
   pointToTile,
   reduceOf,
   safeAdd,
   shuffle,
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
import { MANAGED_IMPORT_RANGE, MAX_PETRA_SPEED_UP } from "./Constants";
import { GameFeature, hasFeature } from "./FeatureLogic";
import type { GameOptions, GameState } from "./GameState";
import { getGameState } from "./GameStateLogic";
import {
   getBuildingIO,
   getBuildingsByType,
   getGlobalMultipliers,
   getGrid,
   getXyBuildings,
} from "./IntraTickCache";
import { LogicResult } from "./LogicResult";
import { getGreatPersonTotalLevel, getUpgradeCostFib } from "./RebirthLogic";
import { getBuildingsThatProduce, getResourcesValue } from "./ResourceLogic";
import { getAgeForTech, getBuildingUnlockTech, getCurrentAge } from "./TechLogic";
import {
   AllMultiplierTypes,
   GlobalMultiplierNames,
   MultiplierTypeDesc,
   NotProducingReason,
   Tick,
   type Multiplier,
   type MultiplierWithSource,
} from "./TickLogic";
import {
   BuildingInputMode,
   DEFAULT_STOCKPILE_CAPACITY,
   DEFAULT_STOCKPILE_MAX,
   PRIORITY_MAX,
   PRIORITY_MIN,
   ResourceImportOptions,
   type IBuildingData,
   type ICentrePompidouBuildingData,
   type IHaveTypeAndLevel,
   type IMarketBuildingData,
   type IResourceImportBuildingData,
   type ITileData,
} from "./Tile";
import { Transports, type ITransportationDataV2 } from "./Transports";
import { completeTransport } from "./Update";

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

export function forEachMultiplier(
   xy: Tile,
   func: (m: MultiplierWithSource) => void,
   stableOnly: boolean,
   gs: GameState,
): void {
   Tick.current.tileMultipliers.get(xy)?.forEach((m) => {
      if (stableOnly && m.unstable) return;
      func(m);
   });
   const b = gs.tiles.get(xy)?.building;
   if (b) {
      Tick.current.buildingMultipliers.get(b.type)?.forEach((m) => {
         if (stableOnly && m.unstable) return;
         func(m);
      });
   }
   AllMultiplierTypes.forEach((type) => {
      getGlobalMultipliers(type).forEach((m) => {
         if (stableOnly && m.unstable) return;
         func(m);
      });
   });
}

export function getMultipliersFor(xy: Tile, stableOnly: boolean, gs: GameState): MultiplierWithSource[] {
   const result: MultiplierWithSource[] = [];
   forEachMultiplier(xy, (m) => result.push(m), stableOnly, gs);
   return result;
}

export enum IOFlags {
   None = 0,
   Capacity = 1 << 0,
   Multiplier = 1 << 1,
   StableOnly = 1 << 2,
   IgnoreLevelBoost = 1 << 3,
   TheoreticalLevelBoost = 1 << 4,
   TotalUsedBits = 5,
}

export function hasEnoughResources(a: PartialTabulate<Material>, b: PartialTabulate<Material>): boolean {
   let res: Material;
   for (res in b) {
      if ((a[res] ?? 0) < (b[res] ?? 0)) {
         return false;
      }
   }
   return true;
}

export function deductResources(
   a: PartialTabulate<Material>,
   b: PartialTabulate<Material>,
): PartialTabulate<Material> {
   let res: Material;
   for (res in b) {
      if (!a[res]) {
         a[res] = 0;
      } else if (a[res]! < b[res]!) {
         console.warn(`Not enough ${res} when trying to deduct`, b, "from", a);
         a[res] = 0;
      } else {
         // biome-ignore lint/suspicious/noExtraNonNullAssertion: <explanation>
         a[res]! -= b[res]!;
      }
   }
   return a;
}

export function filterTransportable(resources: PartialTabulate<Material>): PartialTabulate<Material> {
   const result: PartialTabulate<Material> = {};
   let res: Material;
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
      forEach(
         getBuildingIO(xy, "input", IOFlags.Multiplier | IOFlags.StableOnly | IOFlags.IgnoreLevelBoost, gs),
         (k, v) => {
            if (!NoPrice[k]) result.rawOutput += v;
         },
      );
      forEach(
         getBuildingIO(xy, "output", IOFlags.Multiplier | IOFlags.StableOnly | IOFlags.IgnoreLevelBoost, gs),
         (k, v) => {
            if (!NoPrice[k]) result.rawOutput += v;
         },
      );
   }
   result.multiplier = totalMultiplierFor(xy, "worker", 1, false, gs);
   result.output = Math.ceil(result.rawOutput / result.multiplier);
   return result;
}

export function checkBuildingMax(k: Building, gs: GameState): boolean {
   const buildingCount = mReduceOf(
      gs.tiles,
      (prev, _xy, tile) => prev + (tile.building?.type === k ? 1 : 0),
      0,
   );
   return buildingCount < (Config.Building[k].max ?? Number.POSITIVE_INFINITY);
}

export function isTransportable(res: Material): boolean {
   return !NoStorage[res] && !NoPrice[res];
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

export function getMaxWarpSpeed(gs: GameState): number {
   const status = findSpecialBuilding("Petra", gs)?.building.status;
   return status === "completed" || status === "upgrading" ? MAX_PETRA_SPEED_UP : 2;
}

export function getMaxWarpStorage(gs: GameState): number {
   const HOUR = 60 * 60;
   let storage = 4 * HOUR;
   const petra = findSpecialBuilding("Petra", gs);
   if (petra) {
      // Petra level based warp
      storage += getPetraBaseStorage(petra.building);
      // Zenobia level based warp
      storage += HOUR * getWonderExtraLevel("Petra");
      // Fuji warp
      const fuji = findSpecialBuilding("MountFuji", gs);
      if (fuji && getGrid(gs).distanceTile(fuji.tile, petra.tile) <= 1) {
         storage += HOUR * 8;
      }
   }
   return storage;
}

// 1 hour
const STORAGE_TO_PRODUCTION = 3600;

export function getStorageFor(xy: Tile, gs: GameState): IStorageResult {
   const accumulate = (prev: number, k: Material, v: number): number => {
      return NoStorage[k] ? prev : prev + v;
   };
   const building = gs.tiles.get(xy)?.building;
   let used = reduceOf(building?.resources, accumulate, 0);
   let multiplier = totalMultiplierFor(xy, "storage", 1, true, gs);

   let base = 0;

   switch (building?.type) {
      case "Market": {
         base =
            building.level * getResourceImportBuildingBaseStorageMultiplier(gs) * STORAGE_TO_PRODUCTION * 10;
         break;
      }
      case "Caravansary": {
         base =
            getResourceImportCapacity(building, 0, 1) *
            getResourceImportBuildingBaseStorageMultiplier(gs) *
            STORAGE_TO_PRODUCTION;
         break;
      }
      case "Warehouse": {
         base =
            getResourceImportCapacity(building, 0, 1) *
            getResourceImportBuildingBaseStorageMultiplier(gs) *
            STORAGE_TO_PRODUCTION *
            10;
         break;
      }
      case "Petra": {
         const hq = findSpecialBuilding("Headquarter", gs);
         if (hq) {
            base = getMaxWarpStorage(gs);
            used = hq.building.resources.Warp ?? 0;
         }
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
                  getBuildingIO(
                     xy,
                     "input",
                     IOFlags.Multiplier | IOFlags.StableOnly | IOFlags.IgnoreLevelBoost,
                     gs,
                  ),
                  accumulate,
                  0,
               ) +
            STORAGE_TO_PRODUCTION *
               reduceOf(
                  getBuildingIO(
                     xy,
                     "output",
                     IOFlags.Multiplier | IOFlags.StableOnly | IOFlags.IgnoreLevelBoost,
                     gs,
                  ),
                  accumulate,
                  0,
               );
         break;
      }
   }
   return { base, multiplier, total: base * multiplier, used };
}

export function getStorageRequired(res: PartialTabulate<Material>): number {
   let result = 0;
   forEach(res, (k, v) => {
      if (isTransportable(k)) {
         result += v;
      }
   });
   return result;
}

export function addWorkers(res: Material, amount: number): void {
   mapSafeAdd(Tick.next.workersAvailable, res, amount);
}

export function useWorkers(res: Material, amount: number, xy: Tile | null): void {
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

export function getAvailableWorkers(res: Material): number {
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

export function getResourceName(r: Material): string {
   return Config.Material[r].name();
}

export function getBuildingName(xy: Tile, gs: GameState): string {
   const type = gs.tiles.get(xy)?.building?.type;
   if (!type) {
      return "";
   }
   return Config.Building[type].name();
}

export function filterNonTransportable<T>(
   resources: Partial<Record<Material, T>>,
): Partial<Record<Material, T>> {
   const result: Partial<Record<Material, T>> = {};
   let key: Material;
   for (key in resources) {
      if (!isTransportable(key)) {
         result[key] = resources[key];
      }
   }
   return result;
}

export function getStockpileMax(b: IBuildingData) {
   if (hasFeature(GameFeature.BuildingStockpileMode, getGameState())) {
      return b.stockpileMax === 0 ? Number.POSITIVE_INFINITY : b.stockpileMax;
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
   resource: Material,
   amount: number,
   fuelResource: Material,
   fuelPerTick: number,
   fromXy: Tile,
   toXy: Tile,
   immediate: boolean,
   gs: GameState,
): void {
   const grid = getGrid(gs);
   const fromPosition = grid.xyToPosition(fromXy);
   const toPosition = grid.xyToPosition(toXy);
   useWorkers(fuelResource, fuelPerTick, null);
   const transport: ITransportationDataV2 = {
      id: ++gs.transportId,
      fromXy,
      fromPosition,
      toXy,
      toPosition,
      ticksSpent: 0,
      ticksRequired: grid.distanceTile(fromXy, toXy),
      resource,
      amount,
      fuel: "Worker",
      fuelPerTick,
      fuelCurrentTick: fuelPerTick,
      hasEnoughFuel: true,
   };
   if (immediate) {
      const targetBuilding = gs.tiles.get(toXy)?.building;
      if (targetBuilding) {
         completeTransport(targetBuilding, resource, amount);
      }
   } else {
      Transports.push(transport);
   }
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
      sciencePerIdleWorker * clamp(workersAfterHappiness - workersBusy, 0, Number.POSITIVE_INFINITY);

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
      Tick.current.scienceProduced,
      (prev, _, value) => {
         return prev + value;
      },
      0,
   );
}

type BuildingCostInput = Pick<IBuildingData, "type" | "level"> & {
   tradition?: Tradition | null;
   religion?: Religion | null;
};

/**
 * Get the cost of a building
 * @param building. Level = 0 for construction cost. Level = 1 for cost of upgrading to level 1
 * @returns The cost of the building
 */
export function getBuildingCost(building: BuildingCostInput): PartialTabulate<Material> {
   const type = building.type;
   const level = building.level;
   let cost = { ...Config.Building[type].construction };
   if (isEmpty(cost)) {
      cost = { ...Config.Building[type].input };
   }
   if (isEmpty(cost)) {
      return {};
   }

   // This is a wonder, we apply the wonder multiplier here
   if (isWorldWonder(type)) {
      const multiplier = getWonderCostMultiplier(type);
      if (building.tradition && building.level > 0) {
         const unlockable = Config.Tradition[building.tradition].content[building.level];
         cost = structuredClone(Config.Upgrade[unlockable].requireResources);
         forEach(cost, (k, v) => {
            cost[k] = v * 100 * Math.pow(2, building.level);
         });
      }
      if (building.religion && building.level > 0) {
         const unlockable = Config.Religion[building.religion].content[building.level];
         cost = structuredClone(Config.Upgrade[unlockable].requireResources);
         forEach(cost, (k, v) => {
            cost[k] = v * 100 * Math.pow(2, building.level);
         });
      }
      keysOf(cost).forEach((res) => {
         const price = Config.MaterialPrice[res] ?? 1;
         cost[res] =
            (Math.pow(WonderCostBase[type] ?? 1.5, building.level) * multiplier * cost[res]!) / price;
      });
   } else {
      const multiplier = 10;
      keysOf(cost).forEach((res) => {
         cost[res] = Math.pow(1.5, level) * multiplier * cost[res]!;
      });
   }
   return cost;
}

const totalBuildingCostCache: Map<number, Readonly<PartialTabulate<Material>>> = new Map();

export function getTotalBuildingCost(
   building: Omit<BuildingCostInput, "level">,
   currentLevel: number,
   desiredLevel: number,
): PartialTabulate<Material> {
   console.assert(currentLevel <= desiredLevel);
   const hash = (Config.BuildingHash[building.type]! << 22) + (currentLevel << 11) + desiredLevel;
   const cached = totalBuildingCostCache.get(hash);
   if (cached) {
      return cached;
   }
   const start: BuildingCostInput = {
      type: building.type,
      level: currentLevel,
      tradition: building.tradition,
      religion: building.religion,
   };
   const result: PartialTabulate<Material> = {};
   while (start.level < desiredLevel) {
      const cost = getBuildingCost(start);
      forEach(cost, (res, amount) => safeAdd(result, res, amount));
      ++start.level;
   }
   totalBuildingCostCache.set(hash, Object.freeze(result));
   return result;
}

export function getWonderCostMultiplier(type: Building): number {
   const tech = getBuildingUnlockTech(type);
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
   return multiplier;
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

export function getBuildingValue(building: IBuildingData): number {
   let level = building.level;
   if (IgnoreBuildingUpgradeValue.has(building.type)) {
      level = 1;
   }
   return getResourcesValue(getTotalBuildingCost(building, 0, level));
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
      return Number.POSITIVE_INFINITY;
   }
   // Managed import rule does not apply when the building is being upgraded!
   if (building.status === "completed" && "resourceImports" in building) {
      const ri = building as IResourceImportBuildingData;
      if (hasFlag(ri.resourceImportOptions, ResourceImportOptions.ManagedImport)) {
         return MANAGED_IMPORT_RANGE;
      }
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
   cost: PartialTabulate<Material>;
}

export function getBuildingPercentage(xy: Tile, gs: GameState): BuildingPercentageResult {
   const building = gs.tiles.get(xy)?.building;
   if (!building) {
      return { percent: 0, secondsLeft: Number.POSITIVE_INFINITY, cost: {} };
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

export function getBuildingLevelLabel(xy: Tile, gs: GameState): string {
   const b = gs.tiles.get(xy)?.building;
   if (!b) {
      return "";
   }
   if (Config.Building[b.type].special === BuildingSpecial.HQ) {
      return "";
   }

   // We don't show level boost for wonders (as it does not apply to them), except for the Swiss Bank!
   if (isWorldOrNaturalWonder(b.type)) {
      if (b.type === "SwissBank") {
         // Swiss Bank is a special case, we show the level boost (below)
      } else if (b.type === "BranCastle") {
         return String(LogicResult.branCastleLevel);
      } else if (BuildingShowLevel.has(b.type)) {
         const extraLevel = getWonderExtraLevel(b.type);
         return extraLevel > 0 ? `${b.level}+${extraLevel}` : String(b.level);
      } else {
         return "";
      }
   }
   let levelBoost = 0;
   levelBoost += Tick.current.electrified.get(xy) ?? 0;
   Tick.current.levelBoost.get(xy)?.forEach((lb) => {
      levelBoost += lb.value;
   });
   if (levelBoost > 0) {
      return `${b.level}+${levelBoost}`;
   }
   return String(b.level);
}

function getNextLevel(currentLevel: number, x: number) {
   return (Math.floor(currentLevel / x) + 1) * x;
}

export function getUpgradeTargetLevels(b: IBuildingData): number[] {
   const next5 = getNextLevel(b.level, 5);
   return [b.level + 1, next5, next5 + 5, next5 + 10, next5 + 15];
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

export function isHeadquarter(building?: Building): boolean {
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

export function getResourceImportCapacity(
   building: IHaveTypeAndLevel,
   levelBoost: number,
   multiplier: number,
): number {
   return multiplier * (building.level + levelBoost) * 10;
}

export function getResourceImportIdleCapacity(xy: Tile, gs: GameState): number {
   const building = gs.tiles.get(xy)?.building;
   if (!building || !("resourceImports" in building)) {
      return 0;
   }
   const warehouse = building as IResourceImportBuildingData;
   return (
      getResourceImportCapacity(
         warehouse,
         totalLevelBoostFor(xy),
         totalMultiplierFor(xy, "output", 1, false, gs),
      ) -
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
   let baseCapacity = clamp(building.level, 1, Number.POSITIVE_INFINITY);

   if (isWorldWonder(building.type)) {
      baseCapacity *= getWonderBaseBuilderCapacity(building.type);
   }

   return { multiplier: builder, base: baseCapacity, total: builder * baseCapacity };
}

export function applyToAllBuildings<T extends IBuildingData>(
   building: Building,
   getOptions: (b: T) => Partial<T>,
   gs: GameState,
): number {
   let count = 0;
   getBuildingsByType(building, gs)?.forEach((tile, xy) => {
      Object.assign(tile.building, getOptions(tile.building as T));
      ++count;
   });
   return count;
}

export function getMarketBaseSellAmount(sellResource: Material, buyResource: Material): number {
   return (
      Math.sqrt((Config.MaterialPrice[sellResource] ?? 0) * (Config.MaterialPrice[buyResource] ?? 0)) /
      (Config.MaterialPrice[sellResource] ?? 1)
   );
}

export function getMarketSellAmount(sellResource: Material, xy: Tile, gs: GameState): number {
   const building = gs.tiles.get(xy)?.building;
   if (!building || !("availableResources" in building)) return 0;
   const market = building as IMarketBuildingData;
   const buyResource = market.availableResources[sellResource];
   if (!buyResource) return 0;
   let level = building.level;
   Tick.current.levelBoost.get(xy)?.forEach((lb) => {
      level += lb.value;
   });
   return (
      level *
      getMarketBaseSellAmount(sellResource, buyResource) *
      totalMultiplierFor(xy, "output", 1, false, gs)
   );
}

export function getMarketBuyAmount(
   sellResource: Material,
   sellAmount: number,
   buyResource: Material,
   xy: Tile,
   gs: GameState,
): number {
   const rand = srand(gs.lastPriceUpdated + xy + sellResource);
   const fluctuation =
      1 +
      (1 + (Config.MaterialTier[buyResource] ?? 0) - (Config.MaterialTier[sellResource] ?? 0)) * rand() * 0.1;
   return (
      ((Config.MaterialPrice[sellResource] ?? 0) * sellAmount * fluctuation) /
      (Config.MaterialPrice[buyResource] ?? 0)
   );
}

export function getAvailableResource(sourceXy: Tile, destXy: Tile, res: Material, gs: GameState): number {
   const building = getXyBuildings(gs).get(sourceXy);

   if (!building) {
      return 0;
   }

   const amountInStorage = building.resources[res];
   if (!amountInStorage) {
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
         return clamp(amountInStorage - (resourceImport.cap ?? 0), 0, Number.POSITIVE_INFINITY);
      }

      return amountInStorage;
   }

   const input = getBuildingIO(sourceXy, "input", IOFlags.Capacity | IOFlags.Multiplier, gs);
   const inputAmount = input[res];
   if (inputAmount) {
      // We reserve stockpile max + 1 cycle of capacity so that production does not flicker
      const reservedAmount = (getStockpileMax(building) + getStockpileCapacity(building)) * inputAmount;
      return clamp(amountInStorage - reservedAmount, 0, Number.POSITIVE_INFINITY);
   }

   return amountInStorage;
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

export function getPowerRequired(building: IBuildingData, gs: GameState): number {
   const level = getElectrificationLevel(building, gs);
   if (level <= 0) {
      return 0;
   }
   return Math.round(Math.pow(4, level));
}

export function getElectrificationLevel(building: IBuildingData, gs: GameState): number {
   if (!hasFeature(GameFeature.Electricity, gs) || !canBeElectrified(building.type)) {
      return 0;
   }
   return clamp(building.electrification, 0, building.level);
}

export function canBeElectrified(b: Building): boolean {
   if (b === "SwissBank") {
      return true;
   }
   if (isSpecialBuilding(b)) {
      return false;
   }
   if (b === "CloneFactory") {
      return true;
   }
   if (b === "CloneLab" && Tick.current.specialBuildings.has("OsakaCastle")) {
      return true;
   }
   const output = Config.Building[b].output;
   if (sizeOf(output) <= 0) {
      return false;
   }
   let res: Material;
   for (res in output) {
      if (res === "Science" && Tick.current.specialBuildings.has("OsakaCastle")) {
         continue;
      }
      if (NoStorage[res]) {
         return false;
      }
   }
   return true;
}

export const ElectrificationStatus = {
   NotActive: () => t(L.ElectrificationStatusNotActive),
   NoPower: () => t(L.ElectrificationStatusNoPowerV2),
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

export function hasEnoughResource(xy: Tile, res: Material, amount: number, gs: GameState): boolean {
   const resources = gs.tiles.get(xy)?.building?.resources;
   if (!resources) {
      return false;
   }
   return (resources[res] ?? 0) >= amount;
}

export function hasEnoughStorage(xy: Tile, amount: number, gs: GameState): boolean {
   const storage = getStorageFor(xy, gs);
   // Note: total - used can be negative! In this case, we clamp it so if the amount is zero,
   // we consider there IS enough storage
   return clamp(storage.total - storage.used, 0, Number.POSITIVE_INFINITY) >= amount;
}

export function getWorkingBuilding(xy: Tile, gs: GameState): IBuildingData | null {
   const tile = gs.tiles.get(xy);
   if (!tile || !tile.building || tile.building.status !== "completed" || tile.building.capacity <= 0) {
      return null;
   }
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
   if (isNullOrUndefined(toApply.electrification)) {
      toApply.electrification = options.defaultElectrificationLevel;
   }
   if (isNullOrUndefined(toApply.constructionPriority)) {
      if (isWorldWonder(building.type)) {
         toApply.constructionPriority = options.defaultWonderConstructionPriority;
      } else {
         toApply.constructionPriority = options.defaultConstructionPriority;
      }
   }
   if (isNullOrUndefined(toApply.productionPriority)) {
      if (!isSpecialBuilding(building.type) && Config.Building[building.type].output.Worker) {
         toApply.productionPriority = options.defaultWorkerProductionPriority;
      } else {
         toApply.productionPriority = options.defaultProductionPriority;
      }
   }

   if (!isSpecialBuilding(building.type)) {
      toApply.desiredLevel = options.defaultBuildingLevel;
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
         Tick.current.notProducingReasons.get(xy) === NotProducingReason.StorageFull ||
         Tick.current.notProducingReasons.get(xy) === NotProducingReason.NotEnoughWorkers)
   );
}

export function findSpecialBuilding(type: Building, gs: GameState): Required<ITileData> | null {
   if (!isSpecialBuilding(type)) return null;

   const result = Tick.current.specialBuildings.get(type);
   if (result) return result;

   for (const tile of gs.tiles.values()) {
      if (tile.building?.type === type) {
         return tile as Required<ITileData>;
      }
   }
   return null;
}

export function addPetraOfflineTime(time: number, gs: GameState): number {
   const hq = findSpecialBuilding("Headquarter", gs);
   if (!hq) {
      return 0;
   }
   const storage = getMaxWarpStorage(gs);
   if (!hq.building.resources.Warp) {
      hq.building.resources.Warp = 0;
   }
   const before = hq.building.resources.Warp;
   hq.building.resources.Warp += time;
   hq.building.resources.Warp = clamp(hq.building.resources.Warp, 0, storage);
   const after = hq.building.resources.Warp;
   console.log("[addPetraOfflineTime]: Before:", before, "After:", after);
   return after - before;
}

export function getYellowCraneTowerRange(xy: Tile, gs: GameState): number {
   const building = gs.tiles.get(xy)?.building;
   if (building?.type !== "YellowCraneTower") {
      return 0;
   }
   for (const point of getGrid(gs).getNeighbors(tileToPoint(xy))) {
      const neighbor = gs.tiles.get(pointToTile(point));
      if (neighbor?.explored && neighbor?.building?.type === "YangtzeRiver") {
         return 2;
      }
   }
   return 1;
}

export function getGreatWallRange(xy: Tile, gs: GameState): number {
   const building = gs.tiles.get(xy)?.building;
   if (building?.type !== "GreatWall") {
      return 0;
   }
   for (const point of getGrid(gs).getNeighbors(tileToPoint(xy))) {
      if (getWorkingBuilding(pointToTile(point), gs)?.type === "ForbiddenCity") {
         return 2;
      }
   }
   return 1;
}

export function getBuildingDescription(b: Building): string {
   const building = Config.Building[b];
   const desc = building.desc?.();
   if (desc) return desc;
   return [
      mapOf(building.input, (res, value) => `${Config.Material[res].name()} x${value}`).join(" + "),
      " => ",
      mapOf(building.output, (res, value) => `${Config.Material[res].name()} x${value}`).join(" + "),
   ].join("");
}

export function getMultipliersDescription(m: IUnlockableMultipliers): string {
   return mapOf(m.globalMultiplier, (key, value) => `+${value} ${GlobalMultiplierNames[key]()}`)
      .concat(
         mapOf(m.buildingMultiplier, (building, multipliers) =>
            mapOf(
               multipliers,
               (k, v) => `${Config.Building[building].name()} +${v} ${MultiplierTypeDesc[k]()}`,
            ),
         ).flat(),
      )
      .join(", ");
}

export function generateScienceFromFaith(xy: number, buildingType: Building, gs: GameState) {
   const hq = Tick.current.specialBuildings.get("Headquarter")?.building.resources;
   if (hq) {
      let total = 0;
      getBuildingsByType(buildingType, gs)?.forEach((tile, xy) => {
         if (tile.building?.status === "completed" && !Tick.current.notProducingReasons.has(xy)) {
            const output = getBuildingIO(xy, "output", IOFlags.Capacity | IOFlags.Multiplier, gs);
            total += output.Faith ?? 0;
         }
      });
      total *= 10;
      safeAdd(hq, "Science", total);
      Tick.next.additionalProductions.push({ xy, res: "Science", amount: total });
      Tick.next.scienceProduced.set(xy, total);
   }
}

export function getExplorerRange(gs: GameState): number {
   if (gs.unlockedTech.Democracy) {
      return 4;
   }
   if (gs.unlockedTech.Construction) {
      return 3;
   }
   if (gs.unlockedTech.Writing) {
      return 2;
   }
   return 1;
}

export function getUniqueWonders(currentCity: City): Building[] {
   const result: Building[] = [];
   forEach(Config.City, (city, def) => {
      if (city === currentCity) return;
      forEach(def.uniqueBuildings, (building, def) => {
         if (isWorldWonder(building)) {
            result.push(building);
         }
      });
   });

   return result;
}

export function getEastIndiaCompanyUpgradeCost(level: number): number {
   return Math.pow(2, level - 2) * 10_000_000_000_000;
}

export function getPompidou(gs: GameState): ICentrePompidouBuildingData | null {
   const pompidou = findSpecialBuilding("CentrePompidou", gs);
   if (pompidou && getCurrentAge(gs) === "InformationAge") {
      return pompidou.building as ICentrePompidouBuildingData;
   }
   return null;
}
export function getRandomEmptyTiles(count: number, gameState: GameState): Tile[] {
   const grid = getGrid(gameState);
   const xys = shuffle(Array.from(gameState.tiles.keys()));
   const result: Tile[] = [];
   for (let i = 0; i < xys.length; i++) {
      const xy = xys[i];
      const tile = gameState.tiles.get(xy);
      if (
         !tile ||
         tile.building ||
         !isEmpty(tile.deposit) ||
         tile.explored ||
         grid.isEdge(tileToPoint(xy), 3)
      ) {
         continue;
      }
      result.push(xy);
      if (result.length >= count) {
         break;
      }
   }
   return result;
}

export function getBuildingCity(building: Building): City | null {
   let result: City | null = null;
   forEach(Config.City, (city, def) => {
      if (def.uniqueBuildings[building]) {
         result = city;
         // break
         return true;
      }
      if (def.naturalWonders[building]) {
         result = city;
         return true;
      }
   });
   return result;
}

export function isFestival(building: Building, gs: GameState): boolean {
   if (!gs.festival) {
      return false;
   }
   const city = getBuildingCity(building);
   if (!city) {
      return true;
   }
   return city === gs.city;
}

export function totalLevelBoostFor(xy: Tile): number {
   let result = 0;
   Tick.current.levelBoost.get(xy)?.forEach((lb) => {
      result += lb.value;
   });
   return result;
}

export function getCathedralOfBrasiliaResources(
   xy: Tile,
   gs: GameState,
): { buildings: Set<Building>; input: Set<Material>; output: Set<Material>; unused: number } {
   const buildings = new Set<Building>();

   const grid = getGrid(gs);
   for (const point of grid.getRange(tileToPoint(xy), 2)) {
      const t = pointToTile(point);
      const building = gs.tiles.get(t)?.building;
      if (
         building &&
         t !== xy &&
         building.status === "completed" &&
         !Tick.current.notProducingReasons.has(t) &&
         (sizeOf(Config.Building[building.type].input) > 0 ||
            sizeOf(Config.Building[building.type].output) > 0)
      ) {
         buildings.add(building.type);
      }
   }

   const outputResources = new Set<Material>();
   const inputResources = new Set<Material>();

   for (const building of buildings) {
      const def = Config.Building[building];
      forEach(def.input, (res) => {
         inputResources.add(res);
      });
      forEach(def.output, (res) => {
         outputResources.add(res);
      });
   }

   let unusedResources = 0;

   for (const resource of outputResources) {
      if (!inputResources.has(resource)) {
         unusedResources++;
      }
   }

   return { buildings, input: inputResources, output: outputResources, unused: unusedResources };
}

const WonderToGreatPerson: Partial<Record<Building, GreatPerson>> = {
   InternationalSpaceStation: "WilliamShepherd",
   MarinaBaySands: "LeeKuanYew",
   PalmJumeirah: "EmmanuelleCharpentier",
   AldersonDisk: "DanAlderson",
   DysonSphere: "FreemanDyson",
   MatrioshkaBrain: "VeraRubin",
   RedFort: "AkbarTheGreat",
   Petra: "Zenobia",
   ItaipuDam: "Pele",
   CologneCathedral: "Beethoven",
   SydneyHarbourBridge: "JohnBradfield",
   Hermitage: "Tchaikovsky",
};

export function getWonderExtraLevel(building: Building): number {
   const greatPerson = WonderToGreatPerson[building];
   if (greatPerson) {
      return Math.floor(getGreatPersonTotalLevel(greatPerson));
   }
   return 0;
}

export function getWonderGreatPerson(building: Building): GreatPerson | undefined {
   return WonderToGreatPerson[building];
}

export function isBuildingUpgradable(building: Building): boolean {
   return !isSpecialBuilding(building) || UpgradableWorldWonders.has(building);
}

export function getBranCastleRequiredWorkers(level: number): number {
   return getUpgradeCostFib(level);
}

export function getResourceImportBuildingBaseStorageMultiplier(gs: GameState): number {
   let result = 1;
   if (gs.unlockedTech.Robotics) {
      ++result;
   }
   if (gs.unlockedTech.Globalization) {
      ++result;
   }
   if (gs.unlockedTech.Assembly) {
      ++result;
   }
   if (gs.unlockedTech.Railway) {
      ++result;
   }
   if (gs.unlockedTech.Enlightenment) {
      ++result;
   }
   return result;
}

export function saviorOnSpilledBloodProductionMultiplier(hour: number): number {
   return Math.floor(19 * (1 - Math.E ** ((Math.log(0.5) / 48) * hour))) + 1;
}
