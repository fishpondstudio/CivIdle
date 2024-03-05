import type { Building } from "../definitions/BuildingDefinitions";
import type { IUnlockableDefinition } from "../definitions/ITechDefinition";
import { NoPrice, NoStorage, type Resource } from "../definitions/ResourceDefinitions";
import {
   HOUR,
   IPointData,
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
   safeAdd,
   shuffle,
   sizeOf,
   tileToPoint,
   type Tile,
} from "../utilities/Helper";
import { srand } from "../utilities/Random";
import { TypedEvent } from "../utilities/TypedEvent";
import { Vector2, v2 } from "../utilities/Vector2";
import { L, t } from "../utilities/i18n";
import {
   IOCalculation,
   addTransportation,
   applyDefaultSettings,
   canBeElectrified,
   deductResources,
   filterNonTransportable,
   filterTransportable,
   getAvailableResource,
   getAvailableWorkers,
   getBuilderCapacity,
   getBuildingCost,
   getBuildingValue,
   getCurrentPriority,
   getMarketBuyAmount,
   getPowerRequired,
   getStockpileMax,
   getStorageFor,
   getStorageRequired,
   getWarehouseIdleCapacity,
   getWorkersFor,
   hasEnoughResources,
   hasRequiredDeposit,
   isNaturalWonder,
   isSpecialBuilding,
   isTransportable,
   totalMultiplierFor,
   useWorkers,
} from "./BuildingLogic";
import { Config } from "./Config";
import { MARKET_DEFAULT_TRADE_COUNT } from "./Constants";
import { GameFeature, hasFeature } from "./FeatureLogic";
import { GameState, type ITransportationData } from "./GameState";
import { getGameState } from "./GameStateLogic";
import {
   getBuildingIO,
   getGrid,
   getSpecialBuildings,
   getStorageFullBuildings,
   getXyBuildings,
   unlockedResources,
} from "./IntraTickCache";
import { getAmountInTransit } from "./ResourceLogic";
import type { IBuildingResource, Multiplier } from "./TickLogic";
import { Tick } from "./TickLogic";
import {
   BuildingInputMode,
   IBuildingData,
   IMarketBuildingData,
   IResourceImportBuildingData,
   IWarehouseBuildingData,
   MarketOptions,
   WarehouseOptions,
} from "./Tile";

export const OnBuildingComplete = new TypedEvent<Tile>();
export const OnBuildingProductionComplete = new TypedEvent<{ xy: Tile; offline: boolean }>();
export const OnShowFloater = new TypedEvent<{ xy: Tile; amount: number }>();

export function tickTech(td: IUnlockableDefinition) {
   td.unlockBuilding?.forEach((b) => {
      Tick.next.unlockedBuildings.add(b);
   });
   forEach(td.buildingMultiplier, (k, v) => {
      addMultiplier(k, v, t(L.SourceResearch, { tech: td.name() }));
   });
   forEach(td.globalMultiplier, (k, v) => {
      Tick.next.globalMultipliers[k].push({
         value: v,
         source: t(L.SourceResearch, { tech: td.name() }),
      });
   });
}

export function tickTransports(gs: GameState) {
   const mahTile = Tick.current.specialBuildings.get("MausoleumAtHalicarnassus");
   const mah = mahTile ? getGrid(gs).xyToPosition(mahTile) : null;
   gs.transportation.forEach((queue) => {
      filterInPlace(queue, (transport) => {
         tickTransportation(transport, mah);
         // Has arrived!
         if (transport.ticksSpent >= transport.ticksRequired) {
            const building = gs.tiles.get(transport.toXy)?.building;
            if (building) {
               safeAdd(building.resources, transport.resource, transport.amount);
            }
            return false;
         }

         Tick.next.totalValue += NoPrice[transport.resource]
            ? 0
            : transport.amount * (Config.ResourcePrice[transport.resource] ?? 0);
         return true;
      });
   });
}

function tickTransportation(transport: ITransportationData, mah: IPointData | null) {
   // TODO: This needs to be double checked when fuel is implemented!
   if (isTransportable(transport.fuel)) {
      transport.ticksSpent++;
      transport.hasEnoughFuel = true;
      return;
   }

   transport.currentFuelAmount = transport.fuelAmount;
   if (mah) {
      const position = Vector2.lerp(
         transport.fromPosition,
         transport.toPosition,
         transport.ticksSpent / transport.ticksRequired,
      );
      if (v2(position).subtractSelf(mah).lengthSqr() <= 200 * 200) {
         transport.currentFuelAmount = 0;
      }
   }

   if (getAvailableWorkers(transport.fuel) >= transport.currentFuelAmount) {
      useWorkers(transport.fuel, transport.currentFuelAmount, null);
      transport.ticksSpent++;
      transport.hasEnoughFuel = true;
   } else {
      transport.hasEnoughFuel = false;
   }
}

export function tickTiles(gs: GameState, offline: boolean) {
   Array.from(getXyBuildings(gs).entries())
      .sort(([_a, buildingA], [_b, buildingB]) => {
         if (hasFeature(GameFeature.BuildingProductionPriority, gs)) {
            const diff = getCurrentPriority(buildingB) - getCurrentPriority(buildingA);
            if (diff !== 0) {
               return diff;
            }
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

   if (!hasFeature(GameFeature.BuildingInputMode, gs)) {
      building.maxInputDistance = Infinity;
      building.inputMode = BuildingInputMode.Distance;
   }

   Tick.next.totalValue += getBuildingValue(building);

   if (building.status === "building" || building.status === "upgrading") {
      const cost = getBuildingCost(building);
      const { total } = getBuilderCapacity(building, xy, gs);
      building.disabledInput.forEach((res) => {
         if (!cost[res]) {
            building.disabledInput.delete(res);
         }
      });
      const enabledResourceCount = sizeOf(cost) - building.disabledInput.size;
      const builderCapacityPerResource = enabledResourceCount > 0 ? total / enabledResourceCount : 0;

      // Construction / Upgrade is paused!
      if (builderCapacityPerResource <= 0) {
         return;
      }

      let completed = true;

      forEach(cost, (res, amount) => {
         const amountArrived = building.resources[res] ?? 0;
         // Already full
         if (amountArrived >= amount) {
            building.disabledInput.add(res);
            // continue;
            return false;
         }
         // Will be full
         const amountLeft = amount - getAmountInTransit(xy, res, gs) - amountArrived;
         if (amountLeft <= 0) {
            completed = false;
            // continue;
            return false;
         }

         completed = false;
         if (building.disabledInput.has(res)) {
            return false;
         }
         // Each transportation costs 1 worker, and deliver Total (=Builder Capacity x Multiplier) resources
         transportResource(
            res,
            clamp(amountLeft, 0, builderCapacityPerResource),
            builderCapacityPerResource,
            xy,
            gs,
            building.inputMode,
            defaultTransportFilter(building),
         );
      });

      if (completed) {
         building.level++;
         forEach(cost, (res, amount) => {
            safeAdd(building.resources, res, -amount);
         });
         building.disabledInput.clear();
         if (building.status === "building") {
            building.status = building.desiredLevel > building.level ? "upgrading" : "completed";
            applyDefaultSettings(building, gs);
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
         Tick.next.totalValue += NoPrice[res] ? 0 : (Config.ResourcePrice[res] ?? 0) * amount;
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
   }

   if (isSpecialBuilding(building.type)) {
      Tick.next.specialBuildings.set(building.type, xy);
   }

   // Tabulate resources before we early return //////////////////////////////////////////////////////////////
   const { total, used } = getStorageFor(xy, gs);

   forEach(building.resources, (res, amount) => {
      if (!Number.isFinite(amount) || amount <= 0) {
         return;
      }
      Tick.next.totalValue += NoPrice[res] ? 0 : (Config.ResourcePrice[res] ?? 0) * amount;
      mapSafePush(Tick.next.resourcesByTile, res, {
         tile: xy,
         amount,
         totalStorage: total,
         usedStorage: used,
      });
   });

   // Return early for buildings that are not working ////////////////////////////////////////////////////////
   if (!hasRequiredDeposit(Config.Building[building.type].deposit, xy, gs)) {
      Tick.next.notProducingReasons.set(xy, "NotOnDeposit");
      return;
   }

   if (building.capacity <= 0) {
      Tick.next.notProducingReasons.set(xy, "TurnedOff");
      return;
   }
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   const input = filterTransportable(
      getBuildingIO(xy, "input", IOCalculation.Multiplier | IOCalculation.Capacity, gs),
   );
   const output = getBuildingIO(xy, "output", IOCalculation.Multiplier | IOCalculation.Capacity, gs);
   const worker = getWorkersFor(xy, { exclude: { Worker: 1 } }, gs);
   const inputWorkerCapacity = totalMultiplierFor(xy, "worker", 1, gs);

   //////////////////////////////////////////////////
   // Transport
   //////////////////////////////////////////////////

   let hasTransported = false;

   forEach(input, (res, rawAmount) => {
      const amount = rawAmount * building.stockpileCapacity;
      if (amount <= 0) {
         return;
      }
      if (used + getStorageRequired({ [res]: amount }) > total) {
         return;
      }

      let maxAmount = getStockpileMax(building) * rawAmount;
      if ("resourceImports" in building) {
         const ri = building as IResourceImportBuildingData;
         maxAmount = ri.resourceImports[res]?.cap ?? 0;
      }

      if ((building.resources[res] ?? 0) + getAmountInTransit(xy, res, gs) > maxAmount) {
         return;
      }

      let inputMode = building.inputMode;

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
         defaultTransportFilter(building),
      );
      hasTransported = true;
   });

   // If a building is a resourceImport type but has not transported, we consider it not working
   if ("resourceImports" in building && !hasTransported) {
      Tick.next.notProducingReasons.set(xy, "NoActiveTransports");
   }

   //////////////////////////////////////////////////
   // Production
   //////////////////////////////////////////////////

   if (building.type === "Market") {
      const market = building as IMarketBuildingData;
      let totalBought = 0;
      forEach(market.sellResources, (res) => {
         const amount = clamp(
            building.capacity * building.level * totalMultiplierFor(xy, "output", 1, gs),
            0,
            building.resources[res] ?? 0,
         );
         const buyResource = market.availableResources[res]!;
         const buyAmount = getMarketBuyAmount(res, amount, buyResource, xy, gs);
         if (used - amount + buyAmount > total) {
            Tick.next.notProducingReasons.set(xy, "StorageFull");
            return;
         }
         safeAdd(building.resources, res, -amount);
         safeAdd(building.resources, buyResource, buyAmount);
         totalBought += buyAmount;
      });
      if (totalBought > 0) {
         OnShowFloater.emit({ xy, amount: totalBought });
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

   const hasEnoughStorage =
      isEmpty(output) ||
      used + getStorageRequired(output) + getStorageRequired(input) * building.stockpileCapacity <= total;
   const hasEnoughWorker = getAvailableWorkers("Worker") >= worker.output;
   const hasEnoughInput = hasEnoughResources(building.resources, input);

   if (!hasEnoughWorker) {
      Tick.next.notProducingReasons.set(xy, "NotEnoughWorkers");
      return;
   }

   if (!hasEnoughInput) {
      Tick.next.notProducingReasons.set(xy, "NotEnoughResources");
      return;
   }

   if (!hasEnoughStorage) {
      const nonTransportables = filterNonTransportable(output);
      if (sizeOf(nonTransportables) > 0) {
         const worker = getWorkersFor(
            xy,
            { include: filterOf(nonTransportables, (k) => k !== "Worker") },
            gs,
         );
         useWorkers("Worker", worker.output, xy);
         deductResources(building.resources, input);
         forEach(nonTransportables, (res, amount) => {
            mapSafeAdd(Tick.next.workersAvailable, res, amount);
         });
         if (!isEmpty(filterTransportable(output))) {
            Tick.next.notProducingReasons.set(xy, "StorageFull");
         }
      } else {
         Tick.next.notProducingReasons.set(xy, "StorageFull");
      }
      return;
   }

   if (
      hasFeature(GameFeature.Electricity, gs) &&
      canBeElectrified(building.type) &&
      building.electrification > 0
   ) {
      building.electrification = clamp(building.electrification, 0, building.level);
      const requiredPower = getPowerRequired(building.electrification);
      if (getAvailableWorkers("Power") >= requiredPower) {
         useWorkers("Power", requiredPower, xy);
         mapSafePush(Tick.next.tileMultipliers, xy, {
            source: t(L.Electrification),
            input: building.electrification,
            output: building.electrification,
         });
         Tick.next.electrified.set(xy, building.electrification);
      }
   }

   useWorkers("Worker", worker.output, xy);
   deductResources(building.resources, input);
   forEach(output, (res, v) => {
      if (isTransportable(res)) {
         if (res === "Science") {
            safeAdd(getSpecialBuildings(gs).Headquarter.building.resources, res, v);
         } else {
            safeAdd(building.resources, res, v);
         }
         OnShowFloater.emit({ xy, amount: v });
      } else {
         mapSafeAdd(Tick.next.workersAvailable, res, v);
      }
   });
   OnBuildingProductionComplete.emit({ xy, offline });
}

function tickWarehouseAutopilot(warehouse: IWarehouseBuildingData, xy: Tile, gs: GameState): void {
   let capacity = getWarehouseIdleCapacity(warehouse);
   const workerCapacity = totalMultiplierFor(xy, "worker", 1, gs);
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
            if (resourceFilter.size > 0) {
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

function defaultTransportFilter(building: IBuildingData): TransportFilterFunc {
   return (source: IBuildingResource, dest: Tile) => {
      const grid = getGrid(getGameState());
      const maxDistance = building.maxInputDistance;
      if (maxDistance === Infinity) {
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
            transportCapacity = Infinity;
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

export function addMultiplier(k: Building, multiplier: Multiplier, source: string) {
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
   }
   const resources = filterOf(unlockedResources(gs), (res) => !NoPrice[res] && !NoStorage[res]);
   getXyBuildings(gs).forEach((building, xy) => {
      if (building.type === "Market" && building.status === "completed") {
         const market = building as IMarketBuildingData;
         const tradeCount = market.level + MARKET_DEFAULT_TRADE_COUNT;
         if (sizeOf(market.availableResources) !== tradeCount || forceUpdatePrice) {
            const seed = `${priceId},${xy}`;
            const buy = shuffle(keysOf(resources), srand(seed));
            const sell = shuffle(keysOf(resources), srand(seed)).slice(0, tradeCount);
            market.availableResources = {};
            let idx = 0;
            for (const res of sell) {
               while (buy[idx % buy.length] === res) {
                  idx++;
               }
               market.availableResources[res] = buy[idx % buy.length];
            }
         }
         if (forceUpdatePrice && hasFlag(market.marketOptions, MarketOptions.ClearAfterUpdate)) {
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
