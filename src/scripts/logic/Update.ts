import { Building } from "../definitions/BuildingDefinitions";
import { IUnlockableDefinition } from "../definitions/ITechDefinition";
import { Resource } from "../definitions/ResourceDefinitions";
import { getGameState, notifyGameStateUpdate, saveGame } from "../Global";
import { isSteam } from "../rpc/SteamClient";
import { WorldScene } from "../scenes/WorldScene";
import {
   clamp,
   filterOf,
   forEach,
   HOUR,
   isEmpty,
   keysOf,
   pointArrayToXy,
   round,
   safeAdd,
   safePush,
   shuffle,
   sizeOf,
   xyToPointArray,
} from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { srand } from "../utilities/Random";
import { Singleton } from "../utilities/Singleton";
import {
   addResources,
   addTransportation,
   deductResources,
   filterResource,
   filterTransportable,
   getAvailableWorkers,
   getBuilderCapacity,
   getBuildingCost,
   getMarketPrice,
   getScienceFromWorkers,
   getStockpileMax,
   getStorageFor,
   getStorageRequired,
   getWorkersFor,
   hasEnoughResources,
   IOCalculation,
   isNaturalWonder,
   isTransportable,
   totalMultiplierFor,
   useWorkers,
} from "./BuildingLogic";
import { Config } from "./Constants";
import { GameState } from "./GameState";
import { calculateHappiness } from "./HappinessLogic";
import { clearIntraTickCache, getBuildingIO, getXyBuildings, unlockedResources } from "./IntraTickCache";
import { onBuildingComplete, onBuildingProductionComplete } from "./LogicCallback";
import { getAmountInTransit } from "./ResourceLogic";
import { CurrentTickChanged, EmptyTickData, IModifier, Multiplier, Tick } from "./TickLogic";
import { IBuildingData, IMarketBuildingData, IResourceImportBuildingData } from "./Tile";

let timeSinceLastTick = 0;

export function tickEveryFrame(gs: GameState, dt: number) {
   timeSinceLastTick = Math.min(timeSinceLastTick + dt, 1);
   const worldScene = Singleton().sceneManager.getCurrent(WorldScene);
   if (worldScene) {
      for (const xy in gs.tiles) {
         const tile = gs.tiles[xy];
         if (tile.building != null) {
            worldScene.getTile(xy)?.update(gs, dt);
         }
      }
      worldScene.updateTransportVisual(gs, timeSinceLastTick);
   }
}

export function shouldTick(): boolean {
   return isSteam() || document.visibilityState === "visible";
}

export function tickEverySecond(gs: GameState, offline: boolean) {
   // We should always tick when offline
   if (!offline && !shouldTick()) {
      return;
   }
   timeSinceLastTick = 0;

   Tick.current = Tick.next;
   CurrentTickChanged.emit(Tick.current);
   Tick.next = EmptyTickData();
   clearIntraTickCache();

   forEach(gs.unlockedTech, (tech) => {
      tickTech(Config.Tech[tech]);
   });

   forEach(gs.greatPeople, (person, level) => {
      const greatPerson = Config.GreatPerson[person];
      greatPerson.tick(greatPerson, level);
   });

   forEach(Config.City[gs.city].buildingNameOverrides, (b, name) => {
      Tick.current.buildings[b].name = name;
      Tick.next.buildings[b].name = name;
   });

   tickPrice(gs);
   tickTransportation(gs);
   tickTiles(gs, offline);

   Tick.next.happiness = calculateHappiness(gs);
   const { scienceFromWorkers } = getScienceFromWorkers(gs);
   safeAdd(Singleton().buildings.Headquarter.building.resources, "Science", scienceFromWorkers);

   ++gs.tick;

   if (!offline) {
      notifyGameStateUpdate();
      if (gs.tick % 5 == 0) {
         saveGame();
      }
   }
}

function tickTech(td: IUnlockableDefinition) {
   td.unlockBuilding?.forEach((b) => {
      Tick.next.unlockedBuildings[b] = true;
   });
   forEach(td.buildingModifier, (k, v) => {
      addModifier(k, v, t(L.SourceResearch, { tech: td.name() }));
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

function tickTransportation(gs: GameState) {
   forEach(gs.transportation, (xy, queue) => {
      gs.transportation[xy] = queue.filter((transport) => {
         // TODO: This needs to be double checked when fuel is implemented!
         if (isTransportable(transport.fuel)) {
            transport.ticksSpent++;
            transport.hasEnoughFuel = true;
         } else {
            if (getAvailableWorkers(transport.fuel) >= transport.fuelAmount) {
               useWorkers(transport.fuel, transport.fuelAmount, null);
               transport.ticksSpent++;
               transport.hasEnoughFuel = true;
            } else {
               transport.hasEnoughFuel = false;
            }
         }
         // Has arrived!
         if (transport.ticksSpent >= transport.ticksRequired) {
            const building = gs.tiles[transport.toXy].building;
            if (building) {
               safeAdd(building.resources, transport.resource, transport.amount);
            }
            return false;
         }

         return true;
      });
   });
}

function isBuildingOrUpgrading(b: IBuildingData): boolean {
   return b.status === "building" || b.status === "upgrading";
}

function tickTiles(gs: GameState, offline: boolean) {
   keysOf(getXyBuildings(gs))
      .sort((a, b) => {
         const buildingA = gs.tiles[a].building!;
         const buildingB = gs.tiles[b].building!;
         if (isBuildingOrUpgrading(buildingA) && !isBuildingOrUpgrading(buildingB)) {
            return -1;
         }
         if (isBuildingOrUpgrading(buildingB) && !isBuildingOrUpgrading(buildingA)) {
            return 1;
         }
         const diff = gs.tiles[b].building!.priority - gs.tiles[a].building!.priority;
         if (diff !== 0) {
            return diff;
         }
         return (Config.BuildingTier[buildingA.type] ?? 0) - (Config.BuildingTier[buildingB.type] ?? 0);
      })
      .forEach((xy) => tickTile(xy, gs, offline));
}

function tickTile(xy: string, gs: GameState, offline: boolean): void {
   const tile = gs.tiles[xy];
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
            delete Tick.next.notProducingReasons[xy];
            useWorkers("Worker", 1, xy);
            transportResource(res, total, total, xy, gs);
            // break;
            return true;
         } else {
            Tick.next.notProducingReasons[xy] = "NotEnoughWorkers";
         }
      });
      if (completed) {
         if (building.status === "upgrading") {
            building.level++;
         }
         if (
            building.status === "building" ||
            (building.status === "upgrading" && building.level >= building.desiredLevel)
         ) {
            building.status = "completed";
         }
         forEach(cost, (res, amount) => {
            safeAdd(building.resources, res, -amount);
         });
         onBuildingComplete(xy, gs);
      }
      return;
   }

   if (building.type == "Caravansary") {
      Tick.next.playerTradeBuildings[xy] = building;
   }

   const input = filterTransportable(getBuildingIO(xy, "input", IOCalculation.Multiplier | IOCalculation.Capacity, gs));
   const output = getBuildingIO(xy, "output", IOCalculation.Multiplier | IOCalculation.Capacity, gs);

   forEach(building.resources, (res, amount) => {
      if (amount <= 0) {
         return;
      }
      if (input[res] && amount <= getStockpileMax(building) * input[res]!) {
         return;
      }
      if ("resourceImports" in building) {
         const ri = building as IResourceImportBuildingData;
         if (ri.resourceImports[res] && amount <= (ri.resourceImports[res]?.cap ?? 0)) {
            return;
         }
      }
      safePush(Tick.next.resourcesByXy, res, xy);
      safePush(Tick.next.resourcesByGrid, res, xyToPointArray(xy));
   });

   const requiredDeposits = Tick.current.buildings[building.type].deposit;
   if (requiredDeposits) {
      let key: Resource;
      for (key in requiredDeposits) {
         if (!tile.deposit[key]) {
            Tick.next.notProducingReasons[xy] = "NotOnDeposit";
            return;
         }
      }
   }

   if (building.capacity <= 0) {
      Tick.next.notProducingReasons[xy] = "TurnedOff";
      return;
   }

   const worker = getWorkersFor(xy, { exclude: { Worker: true } }, gs);
   const inputWorkerCapacity = totalMultiplierFor(xy, "worker", 1, gs);
   const { total, used } = getStorageFor(xy, gs);

   //////////////////////////////////////////////////
   // Transport
   //////////////////////////////////////////////////

   let hasTransported = false;

   forEach(input, (res, amount) => {
      amount = amount * building.stockpileCapacity;
      if (amount <= 0) {
         return;
      }
      if (used + getStorageRequired({ [res]: amount }) > total) {
         return;
      }

      let maxAmount = getStockpileMax(building) * amount;
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

   // If a building is a resourceImport type but has not transported, we consider it not working
   if ("resourceImports" in building && !hasTransported) {
      Tick.next.notProducingReasons[xy] = "NoActiveTransports";
   }

   //////////////////////////////////////////////////
   // Production
   //////////////////////////////////////////////////

   const tileVisual = offline ? null : Singleton().sceneManager.getCurrent(WorldScene)?.getTile(xy);

   if (building.type === "Market") {
      const market = building as IMarketBuildingData;
      let totalBought = 0;
      forEach(market.sellResources, (res) => {
         const amount = clamp(
            building.capacity * building.level * totalMultiplierFor(xy, "output", 1, gs),
            0,
            building.resources[res] ?? 0
         );
         const buyResource = market.availableResources[res]!;
         const buyAmount = (amount * getMarketPrice(res, xy, gs)) / getMarketPrice(buyResource, xy, gs);
         if (used - amount + buyAmount > total) {
            Tick.next.notProducingReasons[xy] = "StorageFull";
            return;
         }
         safeAdd(building.resources, res, -amount);
         safeAdd(building.resources, buyResource, buyAmount);
         totalBought += buyAmount;
      });
      if (totalBought > 0) {
         tileVisual?.showText(`+${round(totalBought, 1)}`);
         onBuildingProductionComplete(xy, gs);
      }
      return;
   }

   if (building.type == "Caravansary") {
      return;
   }

   const hasEnoughStorage = isEmpty(output) || used + getStorageRequired(output) <= total;
   const hasEnoughWorker = getAvailableWorkers("Worker") >= worker.output;
   const hasEnoughInput = hasEnoughResources(building.resources, input);

   if (!hasEnoughWorker) {
      Tick.next.notProducingReasons[xy] = "NotEnoughWorkers";
      return;
   }

   if (!hasEnoughInput) {
      Tick.next.notProducingReasons[xy] = "NotEnoughResources";
      return;
   }

   if (!hasEnoughStorage) {
      const nonTransportables = filterResource(output, { canStore: false });
      if (sizeOf(nonTransportables) > 0) {
         const worker = getWorkersFor(xy, { include: filterOf(nonTransportables, (k) => k !== "Worker") }, gs);
         useWorkers("Worker", worker.output, xy);
         deductResources(building.resources, input);
         addResources(Tick.next.workersAvailable, nonTransportables);
         if (!isEmpty(filterTransportable(output))) {
            Tick.next.notProducingReasons[xy] = "StorageFull";
         }
      } else {
         Tick.next.notProducingReasons[xy] = "StorageFull";
      }
      return;
   }

   useWorkers("Worker", worker.output, xy);
   deductResources(building.resources, input);
   forEach(output, (res, v) => {
      if (isTransportable(res)) {
         safeAdd(building.resources, res, v);
         tileVisual?.showText(`+${round(v, 1)}`);
      } else {
         safeAdd(Tick.next.workersAvailable, res, v);
      }
   });
   onBuildingProductionComplete(xy, gs);
}

export function transportResource(
   res: Resource,
   amount: number,
   workerCapacity: number,
   targetXy: string,
   gs: GameState
) {
   let amountLeft = amount;
   const grid = Singleton().grid;
   const targetPoint = xyToPointArray(targetXy);
   const sources = Tick.current.resourcesByGrid[res]?.sort((point1, point2) => {
      return grid.distance(point1, targetPoint) - grid.distance(point2, targetPoint);
   });
   if (!sources) {
      return;
   }
   for (let i = 0; i < sources.length; i++) {
      const fromXy = pointArrayToXy(sources[i]);
      const building = gs.tiles[fromXy].building;
      if (!building) {
         continue;
      }
      if (fromXy == targetXy) {
         continue;
      }
      if (!building.resources[res]) {
         continue;
      }
      if (building.resources[res]! >= amountLeft) {
         const fuelAmount = Math.ceil(amountLeft / workerCapacity);
         const fuelLeft = getAvailableWorkers("Worker");
         if (fuelLeft >= fuelAmount) {
            building.resources[res]! -= amountLeft;
            addTransportation(res, amountLeft, "Worker", fuelAmount, fromXy, targetXy, gs);
         } else {
            const amountAfterFuel = (amountLeft * fuelLeft) / fuelAmount;
            building.resources[res]! -= amountAfterFuel;
            addTransportation(res, amountAfterFuel, "Worker", fuelLeft, fromXy, targetXy, gs);
         }
         // Here we return because either we've got all we need, or we run out of workers (no need to continue)
         return;
      } else {
         const amountToTransport = building.resources[res]!;
         const fuelAmount = Math.ceil(amountToTransport / workerCapacity);
         const fuelLeft = getAvailableWorkers("Worker");
         if (fuelLeft >= fuelAmount) {
            amountLeft -= amountToTransport;
            building.resources[res] = 0;
            addTransportation(res, amountToTransport, "Worker", fuelAmount, fromXy, targetXy, gs);
            // We continue here because the next source might have what we need
         } else {
            const amountAfterFuel = (amountToTransport * fuelLeft) / fuelAmount;
            building.resources[res]! -= amountAfterFuel;
            addTransportation(res, amountAfterFuel, "Worker", fuelLeft, fromXy, targetXy, gs);
            // We return here because we run out of workers (no need to continue)
            return;
         }
      }
   }
}

export function addModifier(k: Building, modifier: IModifier, source: string) {
   let m = Tick.next.buildingModifiers[k];
   if (m == null) {
      m = [];
   }
   m.push({ ...modifier, source });
   Tick.next.buildingModifiers[k] = m;
   forEach(modifier.input, (res, v) => {
      safeAdd(Tick.next.buildings[k].input, res, v);
   });
   forEach(modifier.output, (res, v) => {
      safeAdd(Tick.next.buildings[k].output, res, v);
   });
}

export function addMultiplier(k: Building, multiplier: Multiplier, source: string) {
   let m = Tick.next.buildingMultipliers[k];
   if (m == null) {
      m = [];
   }
   m.push({ ...multiplier, source });
   Tick.next.buildingMultipliers[k] = m;
}

function getPriceId() {
   return Math.floor(Date.now() / HOUR);
}

export function convertPriceIdToTime(priceId: number) {
   return priceId * HOUR;
}

function tickPrice(gs: GameState) {
   const priceId = getPriceId();
   let forceUpdatePrice = false;
   if (gs.lastPriceUpdated !== priceId) {
      forceUpdatePrice = true;
      gs.lastPriceUpdated = priceId;
   }
   const resources = filterOf(
      unlockedResources(gs),
      (res) => Tick.current.resources[res].canPrice && Tick.current.resources[res].canStore
   );
   forEach(getXyBuildings(gs), (xy, building) => {
      if (building.type == "Market") {
         const market = building as IMarketBuildingData;
         if (!market.availableResources) {
            market.availableResources = {};
         }
         if (sizeOf(market.availableResources) <= 0 || forceUpdatePrice) {
            const sell = shuffle(keysOf(resources), srand(priceId + xy));
            const buy = shuffle(keysOf(resources), srand(priceId + xy));
            let idx = 0;
            sell.forEach((res) => {
               while (buy[idx % buy.length] == res) {
                  idx++;
               }
               market.availableResources[res] = buy[idx % buy.length];
            });
         }
      }
   });
}

if (import.meta.env.DEV) {
   // @ts-expect-error
   window.tickGameState = (tick: number) => {
      const gs = getGameState();
      for (let i = 0; i < tick; i++) {
         tickEverySecond(gs, true);
      }
   };
}
function hasResourcesByBuildingChanged(a: Partial<Record<Resource, string[]>>, b: Partial<Record<Resource, string[]>>) {
   if (sizeOf(a) != sizeOf(b)) {
      return true;
   }
   let res: Resource;
   for (res in a) {
      if (!a[res] || !b[res] || a[res]!.length != b[res]!.length) {
         return true;
      }
      const aSorted = a[res]!.sort();
      const bSorted = b[res]!.sort();
      for (let i = 0; i < aSorted.length; i++) {
         if (aSorted[i] !== bSorted[i]) {
            return true;
         }
      }
   }
   return false;
}
