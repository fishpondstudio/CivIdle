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
   keysOf,
   mapSafePush,
   pointToTile,
   safeAdd,
   safePush,
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
   addResources,
   addTransportation,
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
   getMarketPrice,
   getPowerRequired,
   getStockpileMax,
   getStorageFor,
   getStorageRequired,
   getWarehouseIdleCapacity,
   getWorkersFor,
   hasEnoughResources,
   isNaturalWonder,
   isSpecialBuilding,
   isTransportable,
   totalMultiplierFor,
   useWorkers,
} from "./BuildingLogic";
import { Config } from "./Config";
import { GameFeature, hasFeature } from "./FeatureLogic";
import { GameState, type ITransportationData } from "./GameState";
import { getGameOptions } from "./GameStateLogic";
import {
   getBuildingIO,
   getGrid,
   getSpecialBuildings,
   getStorageFullBuildings,
   getXyBuildings,
   unlockedResources,
} from "./IntraTickCache";
import { getAmountInTransit } from "./ResourceLogic";
import type { Multiplier } from "./TickLogic";
import { Tick } from "./TickLogic";
import type {
   IBuildingData,
   IMarketBuildingData,
   IResourceImportBuildingData,
   IWarehouseBuildingData,
} from "./Tile";
import { MarketOptions, WarehouseOptions } from "./Tile";

export const OnBuildingComplete = new TypedEvent<Tile>();
export const OnBuildingProductionComplete = new TypedEvent<{ xy: Tile; offline: boolean }>();
export const OnShowFloater = new TypedEvent<{ xy: Tile; amount: number }>();

export function tickTech(td: IUnlockableDefinition) {
   td.unlockBuilding?.forEach((b) => {
      Tick.next.unlockedBuildings[b] = true;
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

export function tickTransportations(gs: GameState) {
   const mah = Tick.current.specialBuildings.MausoleumAtHalicarnassus
      ? getGrid(gs).xyToPosition(Tick.current.specialBuildings.MausoleumAtHalicarnassus)
      : null;
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

function isBuildingOrUpgrading(b: IBuildingData): boolean {
   return b.status === "building" || b.status === "upgrading";
}

export function tickTiles(gs: GameState, offline: boolean) {
   Array.from(getXyBuildings(gs).entries())
      .sort(([a, buildingA], [b, buildingB]) => {
         const diff = getCurrentPriority(buildingB) - getCurrentPriority(buildingA);
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
   if (building.status === "paused") {
      return;
   }
   if (isNaturalWonder(building.type) && !tile.explored) {
      return;
   }

   if (building.desiredLevel > building.level) {
      building.status = "upgrading";
   } else {
      building.desiredLevel = building.level;
   }

   Tick.next.totalValue += getBuildingValue(building);

   forEach(building.resources, (res, amount) => {
      if (amount <= 0) {
         return;
      }
      Tick.next.totalValue += NoPrice[res] ? 0 : (Config.ResourcePrice[res] ?? 0) * amount;
      safePush(Tick.next.resourcesByTile, res, xy);
   });

   if (building.status === "building" || building.status === "upgrading") {
      const cost = getBuildingCost(building);
      let completed = true;
      forEach(cost, (res, amount) => {
         const { total } = getBuilderCapacity(building, xy, gs);
         const amountArrived = building.resources[res] ?? 0;
         if (amountArrived >= amount) {
            // continue;
            return false;
         }
         if (amountArrived + getAmountInTransit(xy, res, gs) >= amount) {
            completed = false;
            // continue;
            return false;
         }
         completed = false;
         // Each transportation costs 1 worker, and deliver Total (=Builder Capacity x Multiplier) resources
         if (getAvailableWorkers("Worker") >= 1) {
            Tick.next.notProducingReasons.delete(xy);
            useWorkers("Worker", 1, xy);
            transportResource(res, total, total, xy, gs);
            // break;
            return true;
         }
         Tick.next.notProducingReasons.set(xy, "NotEnoughWorkers");
      });
      if (completed) {
         building.level++;
         if (building.status === "building") {
            building.status = "completed";
            const defaults = getGameOptions().buildingDefaults[building.type];
            if (defaults) {
               Object.assign(building, defaults);
            }
            OnBuildingComplete.emit(xy);
         } else if (building.status === "upgrading" && building.level >= building.desiredLevel) {
            building.status = "completed";
         }
         forEach(cost, (res, amount) => {
            safeAdd(building.resources, res, -amount);
         });
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
   }

   if (isSpecialBuilding(building.type)) {
      Tick.next.specialBuildings[building.type] = xy;
   }

   const input = filterTransportable(
      getBuildingIO(xy, "input", IOCalculation.Multiplier | IOCalculation.Capacity, gs),
   );
   const output = getBuildingIO(xy, "output", IOCalculation.Multiplier | IOCalculation.Capacity, gs);

   const requiredDeposits = Config.Building[building.type].deposit;
   if (requiredDeposits) {
      let key: Resource;
      for (key in requiredDeposits) {
         if (!tile.deposit[key]) {
            Tick.next.notProducingReasons.set(xy, "NotOnDeposit");
            return;
         }
      }
   }

   if (building.capacity <= 0) {
      Tick.next.notProducingReasons.set(xy, "TurnedOff");
      return;
   }

   const worker = getWorkersFor(xy, { exclude: { Worker: 1 } }, gs);
   const inputWorkerCapacity = totalMultiplierFor(xy, "worker", 1, gs);
   const { total, used } = getStorageFor(xy, gs);

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

      transportResource(res, amount, inputWorkerCapacity, xy, gs);
      hasTransported = true;
   });

   if (hasFeature(GameFeature.WarehouseUpgrade, gs) && "warehouseOptions" in building) {
      const warehouse = building as IWarehouseBuildingData;
      if (hasFlag(warehouse.warehouseOptions, WarehouseOptions.Autopilot)) {
         hasTransported = tickWarehouseAutopilot(warehouse, xy, gs);
      }
   }

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
         const buyAmount = (amount * getMarketPrice(res, xy, gs)) / getMarketPrice(buyResource, xy, gs);
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
         addResources(Tick.next.workersAvailable, nonTransportables);
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
         safeAdd(Tick.next.workersAvailable, res, v);
      }
   });
   OnBuildingProductionComplete.emit({ xy, offline });
}

function tickWarehouseAutopilot(warehouse: IWarehouseBuildingData, xy: Tile, gs: GameState): boolean {
   let capacity = getWarehouseIdleCapacity(warehouse);
   let hasTransported = false;
   const transportCapacity =
      totalMultiplierFor(xy, "worker", 1, gs) +
      Tick.current.globalMultipliers.transportCapacity.reduce((prev, curr) => prev + curr.value, 0);

   // Not enough workers, capacity will be capped
   if (Math.ceil(capacity / transportCapacity) > getAvailableWorkers("Worker")) {
      capacity = getAvailableWorkers("Worker") * transportCapacity;
   }

   // Clamp capacity by available storage
   const { total, used } = getStorageFor(xy, gs);
   capacity = clamp(capacity, 0, total - used);

   if (capacity <= 0) {
      return false;
   }
   const me = tileToPoint(xy);
   const result = getStorageFullBuildings(gs).sort(
      (a, b) => getGrid(gs).distance(a.x, a.y, me.x, me.y) - getGrid(gs).distance(b.x, b.y, me.x, me.y),
   );
   const buildings = getXyBuildings(gs);
   for (let i = 0; i < result.length; i++) {
      const fromXy = pointToTile(result[i]);
      const building = buildings.get(fromXy);
      if (!building || fromXy === xy) {
         continue;
      }
      const resources = building.resources;
      const output = Config.Building[building.type].output;
      const candidates = keysOf(resources)
         .filter((r) => output[r])
         .sort((a, b) => resources[b]! - resources[a]!);
      for (let i = 0; i < candidates.length; i++) {
         const candidate = candidates[i];
         // Note: this is questionable. capacity are capped by transportCapacity first, without taking into account
         // the warehouse upgrade. This will result in less transports than it is. But fixing it is really complicated
         const upgradedTransportCapacity =
            getGrid(gs).distanceTile(fromXy, xy) <= 1 ? Infinity : Math.ceil(capacity / transportCapacity);
         if (resources[candidate]! >= capacity) {
            const workers = Math.ceil(capacity / upgradedTransportCapacity);
            useWorkers("Worker", workers, xy);
            resources[candidate]! -= capacity;
            addTransportation(candidate, capacity, "Worker", workers, fromXy, xy, gs);
            hasTransported = true;
            return hasTransported;
         }
         const amount = resources[candidate]!;
         const workers = Math.ceil(amount / upgradedTransportCapacity);
         useWorkers("Worker", workers, xy);
         resources[candidate]! -= amount;
         capacity -= amount;
         hasTransported = true;
         addTransportation(candidate, amount, "Worker", workers, fromXy, xy, gs);
      }
   }
   return hasTransported;
}

export function transportResource(
   res: Resource,
   amount: number,
   workerCapacity: number,
   targetXy: Tile,
   gs: GameState,
) {
   let amountLeft = amount;
   const grid = getGrid(gs);
   const targetPoint = tileToPoint(targetXy);
   // We are out of workers, no need to run the expensive sorting!
   if (getAvailableWorkers("Worker") <= 0) {
      return;
   }
   const sources = Tick.current.resourcesByTile[res]?.sort((point1, point2) => {
      return grid.distanceTile(point1, targetXy) - grid.distanceTile(point2, targetXy);
   });
   if (!sources) {
      return;
   }
   for (let i = 0; i < sources.length; i++) {
      const fromXy = sources[i];
      const point = tileToPoint(fromXy);
      const building = gs.tiles.get(fromXy)?.building;
      if (!building) {
         continue;
      }
      if (fromXy === targetXy) {
         continue;
      }

      const availableAmount = getAvailableResource(fromXy, res, gs);
      if (availableAmount <= 0) {
         continue;
      }

      let transportCapacity =
         workerCapacity +
         Tick.current.globalMultipliers.transportCapacity.reduce((prev, curr) => prev + curr.value, 0);

      if (
         hasFeature(GameFeature.WarehouseUpgrade, gs) &&
         (gs.tiles.get(fromXy)?.building?.type === "Warehouse" ||
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
            addTransportation(res, amountLeft, "Worker", fuelAmount, fromXy, targetXy, gs);
         } else if (fuelLeft > 0) {
            const amountAfterFuel = (amountLeft * fuelLeft) / fuelAmount;
            building.resources[res]! -= amountAfterFuel;
            addTransportation(res, amountAfterFuel, "Worker", fuelLeft, fromXy, targetXy, gs);
         }
         // Here we return because either we've got all we need, or we run out of workers (no need to continue)
         return;
      }
      const amountToTransport = availableAmount!;
      const fuelAmount = Math.ceil(amountToTransport / transportCapacity);
      const fuelLeft = getAvailableWorkers("Worker");
      if (fuelLeft >= fuelAmount) {
         amountLeft -= amountToTransport;
         building.resources[res]! -= amountToTransport;
         addTransportation(res, amountToTransport, "Worker", fuelAmount, fromXy, targetXy, gs);
         // We continue here because the next source might have what we need
      } else if (fuelLeft > 0) {
         const amountAfterFuel = (amountToTransport * fuelLeft) / fuelAmount;
         building.resources[res]! -= amountAfterFuel;
         addTransportation(res, amountAfterFuel, "Worker", fuelLeft, fromXy, targetXy, gs);
         // We return here because we run out of workers (no need to continue)
         return;
      }
   }
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
      if (building.type === "Market") {
         const market = building as IMarketBuildingData;
         if (!market.availableResources) {
            market.availableResources = {};
         }
         if (sizeOf(market.availableResources) <= 0 || forceUpdatePrice) {
            const seed = `${priceId},${xy}`;
            const sell = shuffle(keysOf(resources), srand(seed));
            const buy = shuffle(keysOf(resources), srand(seed));
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
         }
      }
   });
}
