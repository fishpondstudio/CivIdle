import type { Building } from "../definitions/BuildingDefinitions";
import type { IUnlockable } from "../definitions/ITechDefinition";
import { NoPrice, NoStorage, type Resource } from "../definitions/ResourceDefinitions";
import type { Tech } from "../definitions/TechDefinitions";
import type { Grid } from "../utilities/Grid";
import {
   HOUR,
   clamp,
   filterInPlace,
   filterOf,
   forEach,
   hasFlag,
   isEmpty,
   isNullOrUndefined,
   keysOf,
   mapSafeAdd,
   mapSafePush,
   pointToTile,
   safeAdd,
   shuffle,
   sizeOf,
   tileToPoint,
   type IPointData,
   type Tile,
} from "../utilities/Helper";
import { srand } from "../utilities/Random";
import { TypedEvent } from "../utilities/TypedEvent";
import { Vector2, v2 } from "../utilities/Vector2";
import { L, t } from "../utilities/i18n";
import {
   IOCalculation,
   addTransportation,
   canBeElectrified,
   deductResources,
   filterNonTransportable,
   filterTransportable,
   findSpecialBuilding,
   getAvailableResource,
   getAvailableWorkers,
   getBuilderCapacity,
   getBuildingCost,
   getBuildingValue,
   getCurrentPriority,
   getElectrificationEfficiency,
   getInputMode,
   getMarketBuyAmount,
   getMarketSellAmount,
   getMaxInputDistance,
   getPowerRequired,
   getResourceImportCapacity,
   getStockpileCapacity,
   getStockpileMax,
   getStorageFor,
   getStorageRequired,
   getWarehouseIdleCapacity,
   getWorkersFor,
   getWorkingBuilding,
   hasEnoughResources,
   hasRequiredDeposit,
   isNaturalWonder,
   isSpecialBuilding,
   isTransportable,
   totalMultiplierFor,
   useWorkers,
} from "./BuildingLogic";
import { Config } from "./Config";
import { MANAGED_IMPORT_RANGE } from "./Constants";
import { GameFeature, hasFeature } from "./FeatureLogic";
import type { GameState, ITransportationDataV2 } from "./GameState";
import { getGameState } from "./GameStateLogic";
import {
   getBuildingIO,
   getBuildingsByType,
   getFuelByTarget,
   getGrid,
   getStorageFullBuildings,
   getXyBuildings,
   unlockedResources,
} from "./IntraTickCache";
import { calculateEmpireValue } from "./RebirthLogic";
import { getAmountInTransit } from "./ResourceLogic";
import type { IBuildingResource, Multiplier } from "./TickLogic";
import { NotProducingReason, Tick } from "./TickLogic";
import {
   BuildingInputMode,
   MarketOptions,
   ResourceImportOptions,
   SuspendedInput,
   WarehouseOptions,
   type IBuildingData,
   type IMarketBuildingData,
   type IResourceImportBuildingData,
   type ITileData,
   type IWarehouseBuildingData,
} from "./Tile";

export const OnPriceUpdated = new TypedEvent<GameState>();
export const OnBuildingComplete = new TypedEvent<Tile>();
export const OnTechUnlocked = new TypedEvent<Tech>();
export const OnBuildingProductionComplete = new TypedEvent<{ xy: Tile; offline: boolean }>();
export const RequestFloater = new TypedEvent<{ xy: Tile; amount: number }>();
export const RequestChooseGreatPerson = new TypedEvent<{ permanent: boolean }>();

export function tickUnlockable(td: IUnlockable, source: string, gs: GameState): void {
   td.unlockBuilding?.forEach((b) => {
      Tick.next.unlockedBuildings.add(b);
   });
   forEach(td.buildingMultiplier, (k, v) => {
      addMultiplier(k, v, source);
   });
   forEach(td.globalMultiplier, (k, v) => {
      Tick.next.globalMultipliers[k].push({ value: v, source });
   });
   td.tick?.(gs);
}

export function tickTransports(gs: GameState): void {
   const mahTile = Tick.current.specialBuildings.get("MausoleumAtHalicarnassus");
   const grid = getGrid(gs);
   const mahPos = mahTile ? grid.xyToPosition(mahTile.tile) : null;
   filterInPlace(gs.transportationV2, (transport) => {
      // Has arrived!
      if (tickTransportation(transport, grid, mahPos)) {
         const building = gs.tiles.get(transport.toXy)?.building;
         if (building) {
            safeAdd(building.resources, transport.resource, transport.amount);
         }
         return false;
      }

      const ev = calculateEmpireValue(transport.resource, transport.amount);
      mapSafeAdd(Tick.next.resourceValues, transport.resource, ev);
      Tick.next.totalValue += ev;
      return true;
   });
}

const _positionCache: IPointData = { x: 0, y: 0 };

function tickTransportation(transport: ITransportationDataV2, grid: Grid, mah: IPointData | null): boolean {
   const fromPosition = grid.xyToPosition(transport.fromXy);
   const toPosition = grid.xyToPosition(transport.toXy);
   const totalTick = grid.distanceTile(transport.fromXy, transport.toXy);

   // TODO: This needs to be double checked when fuel is implemented!
   if (isTransportable(transport.fuel)) {
      transport.ticksSpent++;
      transport.hasEnoughFuel = true;
      return transport.ticksSpent >= totalTick;
   }

   transport.fuelCurrentTick = transport.fuelPerTick;
   if (mah) {
      Vector2.lerp(fromPosition, toPosition, transport.ticksSpent / totalTick, _positionCache);
      if (v2(_positionCache).subtractSelf(mah).lengthSqr() <= 200 * 200) {
         transport.fuelCurrentTick = 0;
      }
   }

   if (getAvailableWorkers(transport.fuel) >= transport.fuelCurrentTick) {
      useWorkers(transport.fuel, transport.fuelCurrentTick, null);
      mapSafeAdd(getFuelByTarget(), transport.toXy, transport.fuelCurrentTick);
      transport.ticksSpent++;
      transport.hasEnoughFuel = true;
   } else {
      transport.hasEnoughFuel = false;
   }

   return transport.ticksSpent >= totalTick;
}

// This needs to be called after tickTiles
export function tickPower(gs: GameState): void {
   const grid = getGrid(gs);
   console.assert(Tick.next.powerGrid.size === 0);

   Tick.next.powerPlants.forEach((tile) => {
      for (const point of grid.getNeighbors(tileToPoint(tile))) {
         Tick.next.powerGrid.add(pointToTile(point));
      }
   });

   let size = 0;
   do {
      size = Tick.next.powerGrid.size;
      Tick.next.powerBuildings.forEach((tile) => {
         if (Tick.next.powerGrid.has(tile)) {
            for (const point of grid.getNeighbors(tileToPoint(tile))) {
               Tick.next.powerGrid.add(pointToTile(point));
            }
         }
      });
   } while (size !== Tick.next.powerGrid.size);
}

export function tickTiles(gs: GameState, offline: boolean): void {
   Array.from(getXyBuildings(gs).entries())
      .sort(([_a, buildingA], [_b, buildingB]) => {
         const diff = getCurrentPriority(buildingB, gs) - getCurrentPriority(buildingA, gs);
         if (diff !== 0) {
            return diff;
         }
         return (Config.BuildingTier[buildingA.type] ?? 0) - (Config.BuildingTier[buildingB.type] ?? 0);
      })
      .forEach(([tile, _]) => tickTile(tile, gs, offline));
}

function tickTile(xy: Tile, gs: GameState, offline: boolean): void {
   const tile = gs.tiles.get(xy)!;
   const building = tile.building!;
   if (isNaturalWonder(building.type) && !tile.explored) {
      return;
   }

   if (building.desiredLevel > building.level) {
      building.status = building.level > 0 ? "upgrading" : "building";
   } else {
      building.desiredLevel = building.level;
   }

   // The following code is wrong, but I keep it here to avoid making the same mistake again. Don't assume
   // wonders don't have levels. Some do! Like Petra!
   // if (isSpecialBuilding(building.type)) {
   //    building.level = clamp(building.level, 0, 1);
   //    building.desiredLevel = clamp(building.desiredLevel, 0, 1);
   // }

   const bev = getBuildingValue(building);
   mapSafeAdd(Tick.next.buildingValueByTile, xy, bev);
   mapSafeAdd(Tick.next.buildingValues, building.type, bev);
   Tick.next.totalValue += bev;

   if (building.status === "building" || building.status === "upgrading") {
      const cost = getBuildingCost(building);
      const { total } = getBuilderCapacity(building, xy, gs);

      const toTransport = new Map<Resource, number>();
      let completed = true;
      forEach(cost, (res, amount) => {
         const amountArrived = building.resources[res] ?? 0;
         // Already full
         if (amountArrived >= amount) {
            building.suspendedInput.set(res, SuspendedInput.AutoSuspended);
            return;
         }
         completed = false;
         // Will be full
         const amountLeft = amount - getAmountInTransit(xy, res, gs) - amountArrived;
         if (amountLeft <= 0) {
            return;
         }
         if (building.suspendedInput.get(res) === SuspendedInput.ManualSuspended) {
            return;
         }
         building.suspendedInput.delete(res);
         toTransport.set(res, amount);
      });

      if (toTransport.size > 0) {
         const builderCapacityPerResource = total / toTransport.size;
         toTransport.forEach((amount, res) => {
            // Each transportation costs 1 worker, and deliver Total (=Builder Capacity x Multiplier) resources
            transportResource(
               res,
               clamp(amount, 0, builderCapacityPerResource),
               builderCapacityPerResource,
               xy,
               gs,
               getInputMode(building, gs),
               defaultTransportFilter(building, gs),
            );
         });
      }

      if (completed) {
         building.level++;
         forEach(cost, (res, amount) => {
            safeAdd(building.resources, res, -amount);
         });
         building.suspendedInput.clear();
         if (building.status === "building") {
            building.status = building.desiredLevel > building.level ? "upgrading" : "completed";
            OnBuildingComplete.emit(xy);
         }
         if (building.status === "upgrading" && building.level >= building.desiredLevel) {
            building.status = "completed";
         }
      }

      forEach(building.resources, (res, amount) => {
         if (!Number.isFinite(amount) || amount <= 0) {
            return;
         }

         const rev = calculateEmpireValue(res, amount);
         Tick.next.totalValue += rev;
         mapSafeAdd(Tick.next.resourceValueByTile, xy, rev);
         mapSafeAdd(Tick.next.resourceValues, res, rev);
      });
      return;
   }

   if (gs.unlockedTech.Banking && building.level >= 10) {
      mapSafePush(Tick.next.tileMultipliers, xy, {
         storage: 1,
         source: t(L.SourceResearch, { tech: t(L.Banking) }),
      });
   }

   if (building.type === "Caravansary") {
      Tick.next.playerTradeBuildings.set(xy, building);
      if (hasFeature(GameFeature.WarehouseExtension, gs)) {
         for (const point of getGrid(gs).getNeighbors(tileToPoint(xy))) {
            const nxy = pointToTile(point);
            const b = gs.tiles.get(nxy)?.building;
            if (b?.type === "Warehouse" && b.status === "completed") {
               Tick.next.playerTradeBuildings.set(nxy, b);
            }
         }
      }
   }

   if ("resourceImports" in building) {
      const ri = building as IResourceImportBuildingData;
      if (hasFlag(ri.resourceImportOptions, ResourceImportOptions.ManagedImport)) {
         const storage = getStorageFor(xy, gs);
         const totalCapacity = getResourceImportCapacity(ri, totalMultiplierFor(xy, "output", 1, false, gs));

         const result = new Map<Resource, number>();
         let total = 0;
         for (const point of getGrid(gs).getRange(tileToPoint(xy), MANAGED_IMPORT_RANGE)) {
            const nxy = pointToTile(point);
            const b = getWorkingBuilding(nxy, gs);
            if (!b) continue;
            forEach(
               filterTransportable(
                  getBuildingIO(nxy, "output", IOCalculation.Capacity | IOCalculation.Multiplier, gs),
               ),
               (res, value) => {
                  mapSafeAdd(result, res, value);
                  total += value;
               },
            );
         }
         if (total > 0) {
            const averageStorage = storage.total / total;
            const averageCapacity = totalCapacity / total;
            ri.resourceImports = {};
            result.forEach((value, res) => {
               ri.resourceImports[res] = {
                  perCycle: Math.floor(averageCapacity * value),
                  cap: Math.floor(averageStorage * value),
               };
            });
         }
      }
   }

   if (isSpecialBuilding(building.type)) {
      Tick.next.specialBuildings.set(building.type, tile as Required<ITileData>);
   }

   // Tabulate resources before we early return //////////////////////////////////////////////////////////////
   const { total, used } = getStorageFor(xy, gs);

   forEach(building.resources, (res, amount) => {
      if (!Number.isFinite(amount) || amount <= 0) {
         return;
      }

      const rev = calculateEmpireValue(res, amount);
      Tick.next.totalValue += rev;
      mapSafeAdd(Tick.next.resourceValueByTile, xy, rev);
      mapSafeAdd(Tick.next.resourceValues, res, rev);
      mapSafeAdd(Tick.next.resourceAmount, res, amount);

      mapSafePush(Tick.next.resourcesByTile, res, {
         tile: xy,
         amount,
         totalStorage: total,
         usedStorage: used,
      });
   });

   // Tick.current.totalValue > 0 here is to check whether the tick is ready! Otherwise we get a split second
   // of wrong number
   if (Tick.current.totalValue > 0 && total > 0) {
      Tick.next.storagePercentages.set(xy, used / total);
   }

   // Return early for buildings that are not working ////////////////////////////////////////////////////////
   if (!hasRequiredDeposit(Config.Building[building.type].deposit, xy, gs)) {
      Tick.next.notProducingReasons.set(xy, NotProducingReason.NotOnDeposit);
      return;
   }

   if (building.capacity <= 0) {
      Tick.next.notProducingReasons.set(xy, NotProducingReason.TurnedOff);
      return;
   }
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   const input = filterTransportable(
      getBuildingIO(xy, "input", IOCalculation.Multiplier | IOCalculation.Capacity, gs),
   );
   const output = getBuildingIO(xy, "output", IOCalculation.Multiplier | IOCalculation.Capacity, gs);
   const worker = getWorkersFor(xy, gs);
   const inputWorkerCapacity = totalMultiplierFor(xy, "worker", 1, false, gs);

   //////////////////////////////////////////////////
   // Transport
   //////////////////////////////////////////////////

   let hasTransported = false;

   forEach(input, (res, rawAmount) => {
      let amount = rawAmount * getStockpileCapacity(building);
      if (amount <= 0) {
         return;
      }
      if (used + getStorageRequired({ [res]: amount }) > total) {
         return;
      }

      let maxAmount = getStockpileMax(building) * rawAmount;
      if ("resourceImports" in building) {
         const ri = building as IResourceImportBuildingData;
         amount = rawAmount;
         maxAmount = ri.resourceImports[res]?.cap ?? 0;
      }

      if ((building.resources[res] ?? 0) + getAmountInTransit(xy, res, gs) > maxAmount) {
         return;
      }

      let inputMode = getInputMode(building, gs);

      if ("resourceImports" in building) {
         const rib = building as IResourceImportBuildingData;
         const ri = rib.resourceImports[res];
         if (ri && !isNullOrUndefined(ri.inputMode)) {
            inputMode = ri.inputMode;
         }
      }

      transportResource(
         res,
         amount,
         inputWorkerCapacity,
         xy,
         gs,
         inputMode,
         defaultTransportFilter(building, gs),
      );
      hasTransported = true;
   });

   // If a building is a resourceImport type but has not transported, we consider it not working
   if ("resourceImports" in building && !hasTransported) {
      Tick.next.notProducingReasons.set(xy, NotProducingReason.NoActiveTransports);
   }

   //////////////////////////////////////////////////
   // Production
   //////////////////////////////////////////////////

   if (building.type === "Market") {
      const market = building as IMarketBuildingData;
      let totalBought = 0;
      forEach(market.sellResources, (sellResource) => {
         const buyResource = market.availableResources[sellResource];
         if (!buyResource) {
            delete market.sellResources[sellResource];
            return;
         }
         const sellAmount = clamp(
            building.capacity * getMarketSellAmount(sellResource, xy, gs),
            0,
            building.resources[sellResource] ?? 0,
         );
         const buyAmount = getMarketBuyAmount(sellResource, sellAmount, buyResource, xy, gs);
         if (used - sellAmount + buyAmount > total) {
            Tick.next.notProducingReasons.set(xy, NotProducingReason.StorageFull);
            return;
         }
         safeAdd(building.resources, sellResource, -sellAmount);
         safeAdd(building.resources, buyResource, buyAmount);
         totalBought += buyAmount;
      });
      if (totalBought > 0) {
         RequestFloater.emit({ xy, amount: totalBought });
         OnBuildingProductionComplete.emit({ xy, offline });
      }
      return;
   }

   if ("resourceImports" in building) {
      if (hasFeature(GameFeature.WarehouseUpgrade, gs) && "warehouseOptions" in building) {
         const warehouse = building as IWarehouseBuildingData;
         if (hasFlag(warehouse.warehouseOptions, WarehouseOptions.Autopilot)) {
            tickWarehouseAutopilot(warehouse, xy, gs);
         }
      }
      return;
   }

   ////////// Power
   const requiresPower = Config.Building[building.type].power;
   const hasPower = !requiresPower || Tick.current.powerGrid.has(xy);
   if (!hasPower) {
      Tick.next.notProducingReasons.set(xy, NotProducingReason.NoPower);
      return;
   }
   if (requiresPower) {
      Tick.next.powerBuildings.add(xy);
   }

   ////////// Worker
   const hasEnoughWorker = getAvailableWorkers("Worker") >= worker.output;
   if (!hasEnoughWorker) {
      Tick.next.notProducingReasons.set(xy, NotProducingReason.NotEnoughWorkers);
      return;
   }

   ////////// Input
   const hasEnoughInput = hasEnoughResources(building.resources, input);
   if (!hasEnoughInput) {
      Tick.next.notProducingReasons.set(xy, NotProducingReason.NotEnoughResources);
      return;
   }

   ////////// Storage + Partial Production (when storage is full)
   const hasEnoughStorage =
      isEmpty(output) ||
      used + getStorageRequired(output) + getStorageRequired(input) * getStockpileCapacity(building) <= total;
   if (!hasEnoughStorage) {
      const nonTransportables = filterNonTransportable(output);
      if (sizeOf(nonTransportables) > 0) {
         const worker = getWorkersFor(xy, gs);
         useWorkers("Worker", worker.output, xy);
         deductResources(building.resources, input);
         forEach(nonTransportables, (res, amount) => {
            if (res === "Science") {
               const storage = Tick.current.specialBuildings.get("Headquarter")?.building.resources;
               if (storage) {
                  RequestFloater.emit({ xy, amount });
                  safeAdd(storage, res, amount);
                  Tick.next.scienceProduced.set(xy, amount);
               }
            } else {
               if (res === "Power") Tick.next.powerPlants.add(xy);
               mapSafeAdd(Tick.next.workersAvailable, res, amount);
            }
         });
         if (!isEmpty(filterTransportable(output))) {
            Tick.next.notProducingReasons.set(xy, NotProducingReason.StorageFull);
         }
      } else {
         Tick.next.notProducingReasons.set(xy, NotProducingReason.StorageFull);
      }
      return;
   }

   ////////// Electrification
   if (
      hasFeature(GameFeature.Electricity, gs) &&
      canBeElectrified(building.type) &&
      building.electrification > 0
   ) {
      building.electrification = clamp(building.electrification, 0, building.level);
      const requiredPower = getPowerRequired(building);
      if (getAvailableWorkers("Power") >= requiredPower) {
         useWorkers("Power", requiredPower, xy);
         mapSafePush(Tick.next.tileMultipliers, xy, {
            source: t(L.Electrification),
            input: building.electrification * getElectrificationEfficiency(building.type),
            output: building.electrification,
            unstable: true,
         });
         Tick.next.electrified.add(xy);
      }
   }

   ////////// Production (when storage is NOT full)
   useWorkers("Worker", worker.output, xy);
   deductResources(building.resources, input);
   forEach(output, (res, v) => {
      if (res === "Power") Tick.next.powerPlants.add(xy);
      if (isTransportable(res)) {
         safeAdd(building.resources, res, v);
         RequestFloater.emit({ xy, amount: v });
         return;
      }
      if (res === "Science") {
         const storage = Tick.current.specialBuildings.get("Headquarter")?.building.resources;
         if (storage) {
            safeAdd(storage, res, v);
            Tick.next.scienceProduced.set(xy, v);
            RequestFloater.emit({ xy, amount: v });
         }
         return;
      }
      mapSafeAdd(Tick.next.workersAvailable, res, v);
   });
   OnBuildingProductionComplete.emit({ xy, offline });
}

function tickWarehouseAutopilot(warehouse: IWarehouseBuildingData, xy: Tile, gs: GameState): void {
   let capacity = getWarehouseIdleCapacity(xy, gs);
   const workerCapacity = totalMultiplierFor(xy, "worker", 1, false, gs);
   const transportCapacity =
      workerCapacity +
      Tick.current.globalMultipliers.transportCapacity.reduce((prev, curr) => prev + curr.value, 0);

   // Not enough workers, capacity will be capped
   if (Math.ceil(capacity / transportCapacity) > getAvailableWorkers("Worker")) {
      capacity = getAvailableWorkers("Worker") * transportCapacity;
   }

   // Clamp capacity by available storage
   const { total, used } = getStorageFor(xy, gs);
   capacity = clamp(capacity, 0, total - used);

   if (capacity <= 0) {
      return;
   }

   const resourceFilter = new Set<Resource>();
   if (hasFlag(warehouse.warehouseOptions, WarehouseOptions.AutopilotRespectCap)) {
      forEach(warehouse.resourceImports, (res, ri) => {
         if ((warehouse.resources[res] ?? 0) < ri.cap) {
            resourceFilter.add(res);
         } else {
            resourceFilter.delete(res);
         }
      });
   }

   const result = getStorageFullBuildings().sort(
      (a, b) => getGrid(gs).distanceTile(a, xy) - getGrid(gs).distanceTile(b, xy),
   );

   for (const tile of result) {
      const building = gs.tiles.get(tile)?.building;
      if (!building || tile === xy) {
         continue;
      }
      const output = getBuildingIO(tile, "output", IOCalculation.None, gs);
      const candidates = keysOf(building.resources)
         .filter((r) => {
            if (hasFlag(warehouse.warehouseOptions, WarehouseOptions.AutopilotRespectCap)) {
               return resourceFilter.has(r) && output[r];
            }
            return output[r];
         })
         .sort((a, b) => (building.resources[b] ?? 0) - (building.resources[a] ?? 0));
      for (const res of candidates) {
         const capacityLeft = transportResource(
            res,
            capacity,
            workerCapacity,
            xy,
            gs,
            BuildingInputMode.Distance,
            (source, destTile) => {
               return source.tile === tile;
            },
         );
         if (capacityLeft < capacity) {
            Tick.next.notProducingReasons.delete(xy);
         }
         capacity = capacityLeft;
         if (capacity <= 0) {
            return;
         }
      }
   }
}

type TransportFilterFunc = (source: IBuildingResource, dest: Tile) => boolean;

function defaultTransportFilter(building: IBuildingData, gs: GameState): TransportFilterFunc {
   return (source: IBuildingResource, dest: Tile) => {
      const grid = getGrid(getGameState());
      const maxDistance = getMaxInputDistance(building, gs);
      if (maxDistance === Number.POSITIVE_INFINITY) {
         return true;
      }
      return grid.distanceTile(source.tile, dest) <= maxDistance;
   };
}

export function transportResource(
   res: Resource,
   amount: number,
   workerCapacity: number,
   targetXy: Tile,
   gs: GameState,
   mode: BuildingInputMode,
   filterFunc: TransportFilterFunc,
): number {
   let amountLeft = amount;
   const grid = getGrid(gs);
   const targetPoint = tileToPoint(targetXy);
   // We are out of workers, no need to run the expensive sorting!
   if (getAvailableWorkers("Worker") <= 0) {
      return amountLeft;
   }
   const sources = Tick.current.resourcesByTile
      .get(res)
      ?.filter((s) => filterFunc(s, targetXy))
      .sort((point1, point2) => {
         switch (mode) {
            case BuildingInputMode.Distance:
               return grid.distanceTile(point1.tile, targetXy) - grid.distanceTile(point2.tile, targetXy);
            case BuildingInputMode.Amount:
               return point2.amount - point1.amount;
            case BuildingInputMode.StoragePercentage:
               return point2.usedStorage / point2.totalStorage - point1.usedStorage / point1.totalStorage;
         }
      });
   if (!sources) {
      return amountLeft;
   }
   for (let i = 0; i < sources.length; i++) {
      const from = sources[i];
      const point = tileToPoint(from.tile);
      const building = gs.tiles.get(from.tile)?.building;
      if (!building) {
         continue;
      }
      if (from.tile === targetXy) {
         continue;
      }

      const availableAmount = getAvailableResource(from.tile, targetXy, res, gs);
      if (availableAmount <= 0) {
         continue;
      }

      let transportCapacity =
         workerCapacity +
         Tick.current.globalMultipliers.transportCapacity.reduce((prev, curr) => prev + curr.value, 0);

      if (
         hasFeature(GameFeature.WarehouseUpgrade, gs) &&
         (gs.tiles.get(from.tile)?.building?.type === "Warehouse" ||
            gs.tiles.get(targetXy)?.building?.type === "Warehouse")
      ) {
         const distance = getGrid(gs).distance(point.x, point.y, targetPoint.x, targetPoint.y);
         if (distance <= 1) {
            transportCapacity = Number.POSITIVE_INFINITY;
         }
      }

      if (availableAmount >= amountLeft) {
         const fuelAmount = Math.ceil(amountLeft / transportCapacity);
         const fuelLeft = getAvailableWorkers("Worker");
         if (fuelLeft >= fuelAmount) {
            building.resources[res]! -= amountLeft;
            from.amount -= amountLeft;
            from.usedStorage -= amountLeft;
            addTransportation(res, amountLeft, "Worker", fuelAmount, from.tile, targetXy, gs);
            amountLeft = 0;
         } else if (fuelLeft > 0) {
            const amountAfterFuel = (amountLeft * fuelLeft) / fuelAmount;
            building.resources[res]! -= amountAfterFuel;
            from.amount -= amountAfterFuel;
            from.usedStorage -= amountAfterFuel;
            addTransportation(res, amountAfterFuel, "Worker", fuelLeft, from.tile, targetXy, gs);
            amountLeft -= amountAfterFuel;
         }
         // Here we return because either we've got all we need, or we run out of workers (no need to continue)
         return amountLeft;
      }
      const amountToTransport = availableAmount!;
      const fuelAmount = Math.ceil(amountToTransport / transportCapacity);
      const fuelLeft = getAvailableWorkers("Worker");
      if (fuelLeft >= fuelAmount) {
         building.resources[res]! -= amountToTransport;
         from.amount -= amountToTransport;
         from.usedStorage -= amountToTransport;
         addTransportation(res, amountToTransport, "Worker", fuelAmount, from.tile, targetXy, gs);
         amountLeft -= amountToTransport;
         // We continue here because the next source might have what we need
      } else if (fuelLeft > 0) {
         const amountAfterFuel = (amountToTransport * fuelLeft) / fuelAmount;
         building.resources[res]! -= amountAfterFuel;
         from.amount -= amountAfterFuel;
         from.usedStorage -= amountAfterFuel;
         addTransportation(res, amountAfterFuel, "Worker", fuelLeft, from.tile, targetXy, gs);
         amountLeft -= amountAfterFuel;
         // We return here because we run out of workers (no need to continue)
         return amountLeft;
      }
   }
   return amountLeft;
}

export function addMultiplier(k: Building, multiplier: Multiplier & { unstable?: boolean }, source: string) {
   let m = Tick.next.buildingMultipliers.get(k);
   if (m == null) {
      m = [];
   }
   m.push({ ...multiplier, source });
   Tick.next.buildingMultipliers.set(k, m);
}

function getPriceId() {
   return Math.floor(Date.now() / HOUR);
}

export function convertPriceIdToTime(priceId: number) {
   return priceId * HOUR;
}

export function tickPrice(gs: GameState) {
   const priceId = getPriceId();
   let forceUpdatePrice = false;
   if (gs.lastPriceUpdated !== priceId) {
      forceUpdatePrice = true;
      gs.lastPriceUpdated = priceId;
      OnPriceUpdated.emit(gs);
   }
   const resources = filterOf(unlockedResources(gs), (res) => !NoPrice[res] && !NoStorage[res]);
   const grandBazaar = findSpecialBuilding("GrandBazaar", gs);
   const grid = getGrid(gs);
   getBuildingsByType("Market", gs)?.forEach((tile, xy) => {
      const building = gs.tiles.get(xy)?.building;
      if (!building || building.type !== "Market") {
         return;
      }
      const market = building as IMarketBuildingData;
      if (forceUpdatePrice || sizeOf(market.availableResources) === 0) {
         const nextToGrandBazaar =
            grandBazaar?.building.status === "completed" && grid.distanceTile(grandBazaar.tile, xy) <= 1;
         const seed = nextToGrandBazaar ? `${priceId},${xy}` : `${priceId}`;
         const buy = shuffle(keysOf(resources), srand(seed));
         const sell = shuffle(keysOf(resources), srand(seed));
         market.availableResources = {};
         let idx = 0;
         for (const res of sell) {
            while (buy[idx % buy.length] === res) {
               idx++;
            }
            market.availableResources[res] = buy[idx % buy.length];
         }
         if (hasFlag(market.marketOptions, MarketOptions.ClearAfterUpdate)) {
            market.sellResources = {};
         } else {
            forEach(market.sellResources, (res) => {
               if (!market.availableResources[res]) {
                  delete market.sellResources[res];
               }
            });
         }
      }
   });
}
