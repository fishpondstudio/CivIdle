import type { Building } from "../definitions/BuildingDefinitions";
import type { IUnlockable } from "../definitions/ITechDefinition";
import { NoPrice, NoStorage, type Resource } from "../definitions/ResourceDefinitions";
import type { Tech } from "../definitions/TechDefinitions";
import type { AccountLevel } from "../utilities/Database";
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
   tileToHash,
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
   getResourceImportIdleCapacity,
   getStockpileCapacity,
   getStockpileMax,
   getStorageFor,
   getStorageRequired,
   getTotalBuildingCost,
   getWorkersFor,
   getWorkingBuilding,
   hasEnoughResources,
   hasRequiredDeposit,
   isNaturalWonder,
   isSpecialBuilding,
   isTransportable,
   isWorldWonder,
   totalMultiplierFor,
   useWorkers,
} from "./BuildingLogic";
import { Config } from "./Config";
import { MANAGED_IMPORT_RANGE } from "./Constants";
import { GameFeature, hasFeature } from "./FeatureLogic";
import type { GameState, ITransportationDataV2 } from "./GameState";
import { getGameOptions } from "./GameStateLogic";
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
import type { MultiplierWithStability } from "./TickLogic";
import { NotProducingReason, Tick } from "./TickLogic";
import {
   BuildingInputMode,
   MarketOptions,
   ResourceImportOptions,
   SuspendedInput,
   WarehouseOptions,
   type IBuildingData,
   type ICloneBuildingData,
   type IMarketBuildingData,
   type IResourceImportBuildingData,
   type ITileData,
   type IWarehouseBuildingData,
} from "./Tile";

export const OnPriceUpdated = new TypedEvent<GameState>();
export const OnBuildingComplete = new TypedEvent<Tile>();
export const OnBuildingOrUpgradeComplete = new TypedEvent<Tile>();
export const OnTechUnlocked = new TypedEvent<Tech>();
export const OnBuildingProductionComplete = new TypedEvent<{ xy: Tile; offline: boolean }>();
export const RequestFloater = new TypedEvent<{ xy: Tile; amount: number }>();
export const RequestChooseGreatPerson = new TypedEvent<{ permanent: boolean }>();
export const OnEligibleAccountRankUpdated = new TypedEvent<AccountLevel>();

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
            if (building.type === "CloneFactory") {
               const clone = building as ICloneBuildingData;
               clone.transportedAmount += transport.amount;
            }
         }
         return false;
      }

      const ev = calculateEmpireValue(transport.resource, transport.amount);
      mapSafeAdd(Tick.next.resourceValues, transport.resource, ev);
      mapSafeAdd(
         Tick.next.amountInTransit,
         hashTileAndRes(transport.toXy, transport.resource),
         transport.amount,
      );
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

export function getSortedTiles(gs: GameState): [Tile, IBuildingData][] {
   return Array.from(getXyBuildings(gs)).sort(([_a, buildingA], [_b, buildingB]) => {
      const diff = getCurrentPriority(buildingB, gs) - getCurrentPriority(buildingA, gs);
      if (diff !== 0) {
         return diff;
      }
      // Low tiers have higher priority
      const tier = (Config.BuildingTier[buildingA.type] ?? 0) - (Config.BuildingTier[buildingB.type] ?? 0);
      return tier;
   });
}

const resourceSet = new Set<Resource>();

export function transportAndConsumeResources(
   xy: Tile,
   result: IProduceResource[],
   gs: GameState,
   offline: boolean,
): void {
   const tile = gs.tiles.get(xy);
   if (!tile) {
      return;
   }
   const building = tile.building;
   if (!building) {
      return;
   }
   if (isNaturalWonder(building.type) && !tile.explored) {
      return;
   }

   const transportSourceCache = offline || getGameOptions().enableTransportSourceCache;

   if (!transportResource) {
      clearTransportSourceCache();
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

   // Tabulate resources before we early return
   // Note that `resourcesByTile` includes buildings that are "building" and "upgrading".
   // This is for cache purpose. We will filter them out when actually transporting resources
   const { total, used } = getStorageFor(xy, gs);
   const output = getBuildingIO(xy, "output", IOCalculation.Multiplier | IOCalculation.Capacity, gs);

   const isResourceImportBuilding = "resourceImports" in building;

   resourceSet.clear();
   forEach(building.resources, (res, amount) => {
      if (!Number.isFinite(amount)) {
         return;
      }

      if (amount === 0) {
         delete building.resources[res];
         return;
      }

      const rev = calculateEmpireValue(res, amount);
      Tick.next.totalValue += rev;
      mapSafeAdd(Tick.next.resourceValueByTile, xy, rev);
      mapSafeAdd(Tick.next.resourceValues, res, rev);

      // Resource in buildings that are not completed are not tabulated because technically it is not
      // usable by other buildings. This is an old behavior that is apparently desired
      if (building.status === "completed") {
         mapSafeAdd(Tick.next.resourceAmount, res, amount);
      }

      // We do not add Warehouse/Caravansary in `resourcesByTile`, because we need to consider as transport
      // sources anyway!
      if (!isResourceImportBuilding) {
         resourceSet.add(res);
         mapSafePush(Tick.next.resourcesByTile, res, {
            tile: xy,
            amount,
            usedStoragePercentage: total === 0 ? 1 : used / total,
         });
      }
   });

   // Here we add all output resources that are not already tabulated in the storage, for transport cache
   forEach(output, (res) => {
      if (resourceSet.has(res)) {
         return;
      }
      mapSafePush(Tick.next.resourcesByTile, res, {
         tile: xy,
         amount: 0,
         usedStoragePercentage: used / total,
      });
   });

   if (isResourceImportBuilding) {
      Tick.next.resourceImportBuildings.set(xy, {
         building: building as IResourceImportBuildingData,
         tile: xy,
         usedStoragePercentage: used / total,
      });
   }

   if (building.status === "building" || building.status === "upgrading") {
      const cost = getBuildingCost(building);
      const maxCost = getTotalBuildingCost(building, building.level, building.desiredLevel);
      const { total } = getBuilderCapacity(building, xy, gs);
      const toTransport = new Map<Resource, number>();
      let completed = true;
      forEach(cost, function checkConstructionUpgradeResources(res, amount) {
         const amountArrived = building.resources[res] ?? 0;
         const amountInTransit = getAmountInTransit(xy, res);
         const threshold = getGameOptions().greedyTransport ? (maxCost[res] ?? 0) : amount;
         if (completed && amountArrived < amount) {
            completed = false;
         }
         // Already full
         if (amountArrived >= threshold) {
            building.suspendedInput.set(res, SuspendedInput.AutoSuspended);
            return;
         }
         // Will be full
         const amountLeft = threshold - amountInTransit - amountArrived;
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
         toTransport.forEach(function transportConstructionUpgradeResources(amount, res) {
            // Each transportation costs 1 worker, and deliver Total (=Builder Capacity x Multiplier) resources
            transportResource(
               res,
               clamp(amount, 0, builderCapacityPerResource),
               builderCapacityPerResource,
               xy,
               gs,
               getInputMode(building, gs),
               transportSourceCache,
            );
         });
      }

      // This has to be here before the `if (completed)` block. Otherwise there will be a one tick flicker
      // when upgrade completes:
      if (building.status === "upgrading" && isWorldWonder(building.type)) {
         OnBuildingProductionComplete.emit({ xy, offline });
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
         OnBuildingOrUpgradeComplete.emit(xy);
         if (building.status === "upgrading" && building.level >= building.desiredLevel) {
            building.status = "completed";
         }
      }

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
   const worker = getWorkersFor(xy, gs);
   const inputWorkerCapacity = totalMultiplierFor(xy, "worker", 1, false, gs);

   //////////////////////////////////////////////////
   // Transport
   //////////////////////////////////////////////////

   let hasTransported = false;

   forEach(input, function forEachTransportResources(res, rawAmount) {
      let amount = rawAmount * getStockpileCapacity(building);
      if (amount <= 0) {
         return;
      }
      if (used + (isTransportable(res) ? amount : 0) > total) {
         return;
      }

      let maxAmount = getStockpileMax(building) * rawAmount;
      if ("resourceImports" in building) {
         const ri = building as IResourceImportBuildingData;
         amount = rawAmount;
         maxAmount = ri.resourceImports[res]?.cap ?? 0;
      }

      let availableAmount = building.resources[res] ?? 0;

      if (building.type === "CloneFactory") {
         const clone = building as ICloneBuildingData;
         availableAmount = Math.min(availableAmount, clone.transportedAmount);
      }

      if (availableAmount + getAmountInTransit(xy, res) > maxAmount) {
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

      transportResource(res, amount, inputWorkerCapacity, xy, gs, inputMode, transportSourceCache);
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
      forEach(market.sellResources, function marketProduction(sellResource) {
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
         result.push({ xy, resource: buyResource, amount: buyAmount });
         // safeAdd(building.resources, buyResource, buyAmount);
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
            tickWarehouseAutopilot(warehouse, xy, transportSourceCache, gs);
         }
      }
      return;
   }

   if (building.type === "CloneFactory") {
      const clone = building as ICloneBuildingData;
      const requiredAmount = input[clone.inputResource] ?? 0;
      const transportedAmount = Math.min(
         clone.transportedAmount,
         building.resources[clone.inputResource] ?? 0,
      );
      if (transportedAmount < requiredAmount) {
         Tick.next.notProducingReasons.set(xy, NotProducingReason.NotEnoughResources);
         return;
      }
      clone.transportedAmount -= requiredAmount;
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
                  // result.push({ xy, resource: res, amount });
                  safeAdd(storage, res, amount);
                  Tick.next.scienceProduced.set(xy, amount);
               }
            } else {
               if (res === "Power") {
                  Tick.next.powerPlants.add(xy);
               }
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
      let electrification = clamp(building.electrification, 0, building.level);
      if (gs.unlockedUpgrades.Liberalism5) {
         electrification *= 2;
      }
      const requiredPower = getPowerRequired(building);
      if (getAvailableWorkers("Power") >= requiredPower) {
         useWorkers("Power", requiredPower, xy);
         mapSafePush(Tick.next.tileMultipliers, xy, {
            source: t(L.Electrification),
            input: electrification * getElectrificationEfficiency(building.type),
            output: electrification,
            unstable: true,
         });
         Tick.next.electrified.add(xy);
      }
   }

   ////////// Production (when storage is NOT full)
   useWorkers("Worker", worker.output, xy);
   deductResources(building.resources, input);
   forEach(output, (res, v) => {
      if (res === "Power") {
         Tick.next.powerPlants.add(xy);
      }
      if (isTransportable(res)) {
         result.push({ xy, resource: res, amount: v });
         // safeAdd(building.resources, res, v);
         RequestFloater.emit({ xy, amount: v });
         return;
      }
      if (res === "Science") {
         const storage = Tick.current.specialBuildings.get("Headquarter")?.building.resources;
         if (storage) {
            // result.push({ xy, resource: res, amount: v });
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

function tickWarehouseAutopilot(
   warehouse: IWarehouseBuildingData,
   xy: Tile,
   transportSourceCache: boolean,
   gs: GameState,
): void {
   let capacity = getResourceImportIdleCapacity(xy, gs);
   if (capacity <= 0) {
      return;
   }
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
            transportSourceCache,
            [tile],
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

export type TileAndRes = number;

export function hashTileAndRes(xy: Tile, res: Resource): TileAndRes {
   return (tileToHash(xy) << 12) | Config.ResourceHash[res]!;
}

const _transportSourceCache = new Map<TileAndRes, Tile[]>();

export function clearTransportSourceCache(): void {
   _transportSourceCache.clear();
}

export function transportResource(
   res: Resource,
   amount: number,
   workerCapacity: number,
   targetXy: Tile,
   gs: GameState,
   mode: BuildingInputMode,
   transportSourceCache: boolean,
   sourcesOverride: Tile[] | undefined = undefined,
): number {
   let amountLeft = amount;
   const grid = getGrid(gs);
   const targetPoint = tileToPoint(targetXy);
   // We are out of workers, no need to run the expensive sorting!
   if (getAvailableWorkers("Worker") <= 0) {
      return amountLeft;
   }

   const targetBuilding = gs.tiles.get(targetXy)?.building;
   if (!targetBuilding) {
      return amountLeft;
   }
   // This cache needs to be cleared when:
   // 1) Building has changed (add, remove and move)
   // 2) [THIS IS NO LONGER TRUE] ~Building's max input distance has changed~
   // Also, we can only cache Distance Input Mode. We cannot cache Warehouse (due to Managed Mode)
   const cacheKey =
      transportSourceCache && mode === BuildingInputMode.Distance && !("resourceImports" in targetBuilding)
         ? hashTileAndRes(targetXy, res)
         : null;

   let sources: Tile[] | undefined;

   if (sourcesOverride) {
      sources = sourcesOverride;
   }

   if (!sources && cacheKey) {
      sources = _transportSourceCache.get(cacheKey);
   }

   if (!sources) {
      const candidates = Tick.current.resourcesByTile.get(res)?.slice() ?? [];
      // We need to add all Warehouse/Caravansary here, because it is excluded from `resourcesByTile`
      Tick.current.resourceImportBuildings.forEach((b, xy) => {
         candidates.push({
            tile: xy,
            amount: b.building.resources[res] ?? 0,
            usedStoragePercentage: b.usedStoragePercentage,
         });
      });

      candidates.sort((point1, point2) => {
         switch (mode) {
            case BuildingInputMode.Distance:
               return grid.distanceTile(point1.tile, targetXy) - grid.distanceTile(point2.tile, targetXy);
            case BuildingInputMode.Amount:
               return point2.amount - point1.amount;
            case BuildingInputMode.StoragePercentage:
               return point2.usedStoragePercentage - point1.usedStoragePercentage;
         }
      });

      sources = candidates.map((s) => s.tile);

      if (transportSourceCache && cacheKey && sources) {
         _transportSourceCache.set(cacheKey, sources);
      }
   }

   if (!sources) {
      return amountLeft;
   }

   for (let i = 0; i < sources.length; i++) {
      const from = sources[i];
      const sourceBuilding = gs.tiles.get(from)?.building;

      // Do all the filtering logic here (after cache), so that cache always have the most complete list)
      if (!sourceBuilding || sourceBuilding.status !== "completed" || from === targetXy) {
         continue;
      }
      if (
         targetBuilding?.type === "CloneFactory" &&
         targetBuilding?.status === "completed" &&
         !Config.Building[sourceBuilding.type].output[res]
      ) {
         continue;
      }

      const maxDistance = getMaxInputDistance(targetBuilding, gs);
      if (maxDistance !== Number.POSITIVE_INFINITY && grid.distanceTile(from, targetXy) > maxDistance) {
         continue;
      }

      const availableAmount = getAvailableResource(from, targetXy, res, gs);
      if (availableAmount <= 0) {
         continue;
      }

      let transportCapacity =
         workerCapacity +
         Tick.current.globalMultipliers.transportCapacity.reduce((prev, curr) => prev + curr.value, 0);

      const fromBuildingType = gs.tiles.get(from)?.building?.type;
      const toBuildingType = gs.tiles.get(targetXy)?.building?.type;

      if (fromBuildingType === "Warehouse" || toBuildingType === "Warehouse") {
         if (gs.unlockedUpgrades.Liberalism3) {
            transportCapacity = Number.POSITIVE_INFINITY;
         } else if (hasFeature(GameFeature.WarehouseUpgrade, gs)) {
            const point = tileToPoint(from);
            const distance = getGrid(gs).distance(point.x, point.y, targetPoint.x, targetPoint.y);
            if (distance <= 1) {
               transportCapacity = Number.POSITIVE_INFINITY;
            }
         }
      }

      if (toBuildingType && Config.Building[toBuildingType].output.Worker) {
         transportCapacity = Number.POSITIVE_INFINITY;
      }

      if (availableAmount >= amountLeft) {
         const fuelAmount = Math.ceil(amountLeft / transportCapacity);
         const fuelLeft = getAvailableWorkers("Worker");
         if (fuelLeft >= fuelAmount) {
            sourceBuilding.resources[res]! -= amountLeft;
            addTransportation(res, amountLeft, "Worker", fuelAmount, from, targetXy, gs);
            amountLeft = 0;
         } else if (fuelLeft > 0) {
            const amountAfterFuel = (amountLeft * fuelLeft) / fuelAmount;
            sourceBuilding.resources[res]! -= amountAfterFuel;
            addTransportation(res, amountAfterFuel, "Worker", fuelLeft, from, targetXy, gs);
            amountLeft -= amountAfterFuel;
         }
         // Here we return because either we've got all we need, or we run out of workers (no need to continue)
         return amountLeft;
      }
      const amountToTransport = availableAmount!;
      const fuelAmount = Math.ceil(amountToTransport / transportCapacity);
      const fuelLeft = getAvailableWorkers("Worker");
      if (fuelLeft >= fuelAmount) {
         sourceBuilding.resources[res]! -= amountToTransport;
         addTransportation(res, amountToTransport, "Worker", fuelAmount, from, targetXy, gs);
         amountLeft -= amountToTransport;
         // We continue here because the next source might have what we need
      } else if (fuelLeft > 0) {
         const amountAfterFuel = (amountToTransport * fuelLeft) / fuelAmount;
         sourceBuilding.resources[res]! -= amountAfterFuel;
         addTransportation(res, amountAfterFuel, "Worker", fuelLeft, from, targetXy, gs);
         amountLeft -= amountAfterFuel;
         // We return here because we run out of workers (no need to continue)
         return amountLeft;
      }
   }
   return amountLeft;
}

export function addMultiplier(k: Building, multiplier: MultiplierWithStability, source: string) {
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

export interface IProduceResource {
   xy: Tile;
   resource: Resource;
   amount: number;
}
