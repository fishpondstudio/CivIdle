import { Building, IBuildingDefinition } from "../definitions/BuildingDefinitions";
import { City } from "../definitions/CityDefinitions";
import { IResourceDefinition, Resource } from "../definitions/ResourceDefinitions";
import { PartialTabulate } from "../definitions/TypeDefinitions";
import { Singleton } from "../Global";
import { forEach, isEmpty, keysOf, reduceOf, safeAdd, safePush, sum } from "../utilities/Helper";
import { Textures } from "../utilities/SceneManager";
import { v2 } from "../utilities/Vector2";
import { GameState } from "./GameState";
import { Multiplier, MultiplierWithSource, Tick } from "./TickLogic";
import { IBuildingData, IHaveTypeAndLevel, IMarketBuildingData } from "./Tile";

export function getBuildingTexture(b: Building, textures: Textures, city: City) {
   return textures[`Building${b}_${city}`] ?? textures[`Building${b}`];
}

export function getTileTexture(r: Resource, textures: Textures) {
   return textures[`Tile${r}`];
}

export function totalMultiplierFor(xy: string, type: keyof Multiplier, gs: GameState): number {
   return 1 + sumMultipliers(getMultipliersFor(xy, gs), type);
}

function sumMultipliers(multipliers: Multiplier[], type: keyof Multiplier): number {
   return sum(multipliers, type);
}

export function getMultipliersFor(xy: string, gs: GameState): MultiplierWithSource[] {
   const result: MultiplierWithSource[] = [];
   const b = gs.tiles[xy].building;
   Tick.current.tileMultipliers[xy]?.forEach((m) => result.push(m));
   if (b) {
      Tick.current.buildingMultipliers[b.type]?.forEach((m) => result.push(m));
   }
   return result;
}

export type IOCalculations = Partial<Record<"capacity" | "multiplier", true>>;

export function getBuildingIO(
   xy: string,
   type: keyof Pick<IBuildingDefinition, "input" | "output">,
   options: IOCalculations,
   gs: GameState
): PartialTabulate<Resource> {
   const result: PartialTabulate<Resource> = {};
   const b = gs.tiles[xy].building;
   if (b) {
      const resources = { ...Tick.current.buildings[b.type][type] };
      if (b.type === "Market" && type === "input") {
         forEach((b as IMarketBuildingData).sellResources, (k) => {
            resources[k] = 1;
         });
      }
      forEach(resources, (k, v) => {
         let value = v * b.level;
         if (options.capacity) {
            value *= b.capacity;
         }
         if (options.multiplier) {
            value *= totalMultiplierFor(xy, type, gs);
         }
         safeAdd(result, k, value);
      });
   }
   return result;
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

export function deductResources(a: PartialTabulate<Resource>, b: PartialTabulate<Resource>): PartialTabulate<Resource> {
   let res: Resource;
   for (res in b) {
      if (!a[res] || a[res]! < b[res]!) {
         console.warn(`Not enough ${res} when trying to deduct`, b, "from", a);
         a[res] = 0;
      } else {
         a[res]! -= b[res]!;
      }
   }
   return a;
}

export function addResources(a: PartialTabulate<Resource>, b: PartialTabulate<Resource>): PartialTabulate<Resource> {
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
   filter: { include: Partial<Record<Resource, any>> } | { exclude: Partial<Record<Resource, any>> },
   gs: GameState
): IWorkerRequirement {
   const result: IWorkerRequirement = {
      rawOutput: 0,
      multiplier: 1,
      output: 0,
   };
   const b = gs.tiles[xy].building;
   if (b) {
      forEach(getBuildingIO(xy, "output", { capacity: true }, gs), (k, v) => {
         if ("include" in filter && k in filter.include) {
            result.rawOutput += v;
            return;
         }
         if ("exclude" in filter && !(k in filter.exclude)) {
            result.rawOutput += v;
         }
      });
      result.multiplier = totalMultiplierFor(xy, "worker", gs);
   }
   result.output = Math.ceil(result.rawOutput / result.multiplier);
   return result;
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

export function getStorageFor(xy: string, gs: GameState): IStorageResult {
   const accumulate = (prev: number, k: Resource, v: number): number => {
      return isTransportable(k) ? prev + v : prev;
   };
   const building = gs.tiles[xy].building;
   if (building?.type == "Market") {
      return { base: Infinity, multiplier: 1, total: Infinity, used: 0 };
   }

   const used = reduceOf(building?.resources, accumulate, 0);

   if (building?.type == "Caravansary") {
      return { base: building.level * 1000, multiplier: 1, total: building.level * 1000, used };
   }

   const base =
      100 * reduceOf(getBuildingIO(xy, "input", {}, gs), accumulate, 0) +
      1000 * reduceOf(getBuildingIO(xy, "output", {}, gs), accumulate, 0);
   const multiplier = totalMultiplierFor(xy, "storage", gs);

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

export function hasEnoughWorkers(res: Resource, amount: number): boolean {
   if (!Tick.current.workersAvailable[res]) {
      Tick.current.workersAvailable[res] = 0;
   }
   if (!Tick.current.workersUsed[res]) {
      Tick.current.workersUsed[res] = 0;
   }
   return Tick.current.workersAvailable[res]! >= Tick.current.workersUsed[res]! + amount;
}

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
   filter: Pick<IResourceDefinition, "canStore">
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

export function tryAddTransportation(
   resource: Resource,
   amount: number,
   fuelResource: Resource,
   fuelAmount: number,
   fromXy: string,
   toXy: string,
   gs: GameState
): boolean {
   if (!hasEnoughWorkers(fuelResource, fuelAmount)) {
      return false;
   }
   useWorkers(fuelResource, fuelAmount, null);
   const fromPosition = Singleton().grid.xyToPosition(fromXy);
   const toPosition = Singleton().grid.xyToPosition(toXy);
   safePush(gs.transportation, toXy, {
      id: ++gs.transportId,
      fromXy,
      toXy,
      fromPosition,
      toPosition,
      ticksRequired: Math.ceil(v2(fromPosition).subtract(toPosition).length() / 100),
      ticksSpent: 0,
      resource,
      amount,
      fuel: "Worker",
      fuelAmount,
      hasEnoughFuel: true,
   });
   return true;
}

export function getScienceFromWorkers(gs: GameState) {
   const workersAvailable = Tick.current.workersAvailable.Worker ?? 0;
   const workersBusy = Tick.current.workersUsed.Worker ?? 0;
   const sciencePerIdleWorker = sum(Tick.current.globalMultipliers.sciencePerIdleWorker, "value");
   const scienceFromIdleWorkers = sciencePerIdleWorker * (workersAvailable - workersBusy);

   const sciencePerBusyWorker = sum(Tick.current.globalMultipliers.sciencePerBusyWorker, "value");
   const scienceFromBusyWorkers = sciencePerBusyWorker * workersBusy;
   const scienceFromWorkers = scienceFromBusyWorkers + scienceFromIdleWorkers;

   return {
      workersAvailable,
      workersBusy,
      scienceFromBusyWorkers,
      sciencePerBusyWorker,
      scienceFromIdleWorkers,
      sciencePerIdleWorker,
      scienceFromWorkers,
   };
}

export function getBuildingCost(building: IHaveTypeAndLevel): PartialTabulate<Resource> {
   const type = building.type;
   let cost = { ...Tick.current.buildings[type].construction };
   if (isEmpty(cost)) {
      cost = { ...Tick.current.buildings[type].input } ?? {};
   }
   if (isEmpty(cost)) {
      console.error(`${type}: does not have 'input' or 'construction' defined`);
   }
   keysOf(cost).forEach((res) => {
      cost[res] = Math.pow(1.5, building.level - 1) * 10 * cost[res]!;
   });
   return cost;
}

export function getBuildingUpgradeCost(
   building: Building,
   fromLevel: number,
   toLevel: number
): PartialTabulate<Resource> {
   console.assert(fromLevel <= toLevel);
   const start: IHaveTypeAndLevel = { type: building, level: fromLevel };
   const result: PartialTabulate<Resource> = {};
   while (start.level < toLevel) {
      const cost = getBuildingCost(start);
      forEach(cost, (res, amount) => safeAdd(result, res, amount));
      start.level++;
   }
   return result;
}

export function getBuildingPercentage(xy: string, gs: GameState): number {
   const building = gs.tiles[xy]?.building;
   if (!building) {
      return 0;
   }
   if (building.status === "completed") {
      return 1;
   }
   const cost = getBuildingCost(building);
   let totalCost = 0;
   let inStorage = 0;
   forEach(cost, (res, amount) => {
      totalCost += amount;
      inStorage += building.resources[res] ?? 0;
   });
   return inStorage / totalCost;
}

export function getBuildingLevelLabel(b: IBuildingData): string {
   if (b.type === "Headquarter" || Tick.current.buildings[b.type].max === 1) {
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

export function isNaturalWonder(building: Building): boolean {
   return Tick.current.buildings[building].max === 0;
}

export function isWorldWonder(building: Building): boolean {
   return Tick.current.buildings[building].max === 1;
}

export function isWorldOrNaturalWonder(building: Building): boolean {
   return (Tick.current.buildings[building].max ?? Infinity) <= 1;
}

export function getWarehouseCapacity(building: IHaveTypeAndLevel): number {
   return building.level * 10;
}
