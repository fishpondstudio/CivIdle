import { Building } from "../definitions/BuildingDefinitions";
import { GreatPersonLogic } from "../definitions/GreatPersonLogic";
import { IUnlockableDefinition } from "../definitions/ITechDefinition";
import { Resource } from "../definitions/ResourceDefinitions";
import { notifyGameStateUpdate, saveGame, Singleton } from "../Global";
import { WorldScene } from "../scenes/WorldScene";
import { filterOf, forEach, isEmpty, keysOf, safeAdd, safePush, sizeOf, sum } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { v2 } from "../utilities/Vector2";
import {
   addResources,
   deductResources,
   filterResource,
   filterTransportable,
   getBuildingCost,
   getBuildingIO,
   getScienceFromWorkers,
   getStorageFor,
   getStorageRequired,
   getWorkersFor,
   hasEnoughResources,
   hasEnoughWorkers,
   isTransportable,
   totalMultiplierFor,
   tryAddTransportation,
   useWorkers,
} from "./BuildingLogic";
import { Config } from "./Constants";
import { GameState } from "./GameState";
import { clearIntraTickCache } from "./IntraTickCache";
import { onBuildingComplete, onBuildingProductionComplete } from "./LogicCallback";
import { getAmountInTransit } from "./ResourceLogic";
import { getTechTree } from "./TechLogic";
import { EmptyTickData, IModifier, Multiplier, Tick } from "./TickLogic";

export function tickEveryFrame(gs: GameState, dt: number) {
   const worldScene = Singleton().sceneManager.getCurrent(WorldScene);
   for (const xy in gs.tiles) {
      const tile = gs.tiles[xy];
      if (tile.building != null) {
         worldScene?.getTile(xy)?.update(gs, dt);
      }
   }

   const dist = 100 * dt;
   forEach(gs.transportation, (xy, queue) => {
      gs.transportation[xy] = queue.filter((transport) => {
         const hasArrived = v2(transport.position).subtract(transport.toPosition).lengthSqr() <= dist * dist;
         if (hasArrived) {
            const building = gs.tiles[transport.toXy].building;
            if (building) {
               safeAdd(building.resources, transport.resource, transport.amount);
            }
            return false;
         }
         if (transport.hasEnoughFuel) {
            const delta = v2(transport.toPosition).subtract(transport.fromPosition).normalize().multiply(dist);
            transport.position = v2(transport.position).add(delta);
         }
         return true;
      });
   });

   worldScene?.updateTransportVisual(gs);
}
export function tickEverySecond(gs: GameState) {
   if (document.visibilityState !== "visible") {
      return;
   }
   Tick.current = Tick.next;
   Tick.next = EmptyTickData();
   clearIntraTickCache();

   forEach(gs.unlocked, (tech) => {
      const td: IUnlockableDefinition = getTechTree(gs).definitions[tech] ?? Config.City[gs.city].unlockable[tech];
      if (td) {
         tickUnlockable(td);
         return;
      }
      console.warn(`Unlockable: ${tech} is not ticked. Check your definition in City.techTree or City.unlockable`);
   });
   forEach(gs.greatPeople, (person, level) => {
      GreatPersonLogic[person]?.(level);
   });
   tickTileTech(gs);
   tickTransportation(gs);
   tickTiles(gs);

   const { scienceFromWorkers } = getScienceFromWorkers(gs);
   safeAdd(Singleton().buildings.Headquarter.building.resources, "Science", scienceFromWorkers);

   ++gs.tick;
   notifyGameStateUpdate();

   if (gs.tick % 5 === 0) {
      saveGame();
   }
}

function tickUnlockable(td: IUnlockableDefinition) {
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

function tickTileTech(gs: GameState) {
   forEach(gs.tiles, (xy, tile) => {
      const building = tile.building;
      if (!building) {
         return;
      }
      if (building.type === "CircusMaximus") {
         forEach(Tick.current.buildings, (building, def) => {
            if (def.output.Worker) {
               addMultiplier(building, { output: 1 }, Tick.current.buildings.CircusMaximus.name());
            }
         });
      }
   });
}

function tickTransportation(gs: GameState) {
   forEach(gs.transportation, (xy, queue) => {
      queue.forEach((transport) => {
         if (isTransportable(transport.fuel)) {
            transport.hasEnoughFuel = true;
         } else {
            if (hasEnoughWorkers(transport.fuel, transport.fuelAmount)) {
               useWorkers(transport.fuel, transport.fuelAmount, null);
               transport.hasEnoughFuel = true;
            } else {
               transport.hasEnoughFuel = false;
            }
         }
      });
   });
}

function tickTiles(gs: GameState) {
   keysOf(gs.tiles)
      .filter((xy) => gs.tiles[xy].building)
      .sort((a, b) => {
         const buildingA = gs.tiles[a].building!.type;
         const buildingB = gs.tiles[b].building!.type;
         const diff = gs.tiles[b].building!.priority - gs.tiles[a].building!.priority;
         if (diff !== 0) {
            return diff;
         }
         return (Config.BuildingTier[buildingA] ?? 0) - (Config.BuildingTier[buildingB] ?? 0);
      })
      .forEach((xy) => tileTile(xy, gs));
}

function tileTile(xy: string, gs: GameState): void {
   const tile = gs.tiles[xy];
   const building = tile.building!;
   if (building.status === "paused") {
      return;
   }
   if (building.status === "building" || building.status === "upgrading") {
      const cost = getBuildingCost(building);
      let completed = true;
      forEach(cost, (res, amount) => {
         const builder = sum(Tick.current.globalMultipliers.builderCapacity, "value");
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
         if (hasEnoughWorkers("Worker", builder)) {
            building.notProducingReason = null;
            useWorkers("Worker", builder, xy);
            transportResource(res, builder * building.level, building.level, xy, gs);
            // break;
            return true;
         } else {
            building.notProducingReason = "NotEnoughWorkers";
         }
      });
      if (completed) {
         if (building.status === "upgrading") {
            building.level++;
         }
         building.status = "completed";
         forEach(cost, (res, amount) => {
            safeAdd(building.resources, res, -amount);
         });
         onBuildingComplete(xy, gs);
      }
      return;
   }

   const input = filterTransportable(getBuildingIO(xy, "input", { multiplier: true, capacity: true }, gs));
   const output = getBuildingIO(xy, "output", { multiplier: true, capacity: true }, gs);

   forEach(building.resources, (res, amount) => {
      if (amount <= 0) {
         return;
      }
      if (input[res] && amount <= building.stockpileMax * (input[res] ?? 0)) {
         return;
      }
      safePush(Tick.next.resourcesByBuilding, res, xy);
   });

   const requiredDeposits = Tick.current.buildings[building.type].deposit;
   if (requiredDeposits) {
      let key: Resource;
      for (key in requiredDeposits) {
         if (!tile.deposit[key]) {
            building.notProducingReason = "NotOnDeposit";
            return;
         }
      }
   }

   if (building.capacity <= 0) {
      building.notProducingReason = "TurnedOff";
      return;
   }

   const worker = getWorkersFor(xy, { exclude: { Worker: true } }, gs);
   const inputWorkerCapacity = totalMultiplierFor(xy, "worker", gs);
   const { total, used } = getStorageFor(xy, gs);

   forEach(input, (res, amount) => {
      amount = amount * building.stockpileCapacity;
      if (amount <= 0) {
         return;
      }
      if (used + getStorageRequired({ [res]: amount }) > total) {
         return;
      }
      if ((building.resources[res] ?? 0) + getAmountInTransit(xy, res, gs) > building.stockpileMax * amount) {
         return;
      }
      transportResource(res, amount, inputWorkerCapacity, xy, gs);
   });

   const hasEnoughStorage = isEmpty(output) || used + getStorageRequired(output) <= total;
   const hasEnoughWorker = hasEnoughWorkers("Worker", worker.output);
   const hasEnoughInput = hasEnoughResources(building.resources, input);

   if (!hasEnoughWorker) {
      building.notProducingReason = "NotEnoughWorkers";
      return;
   }

   if (!hasEnoughInput) {
      building.notProducingReason = "NotEnoughResources";
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
            building.notProducingReason = "StoragePartialFull";
         }
      } else {
         building.notProducingReason = "StorageFull";
      }
      return;
   }

   building.notProducingReason = null;
   useWorkers("Worker", worker.output, xy);
   deductResources(building.resources, input);
   forEach(output, (res, v) => {
      if (isTransportable(res)) {
         safeAdd(building.resources, res, v);
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
   const buildingPosition = Singleton().grid.xyToPosition(targetXy);
   let amountLeft = amount;
   Tick.current.resourcesByBuilding[res]
      ?.sort((xy1, xy2) => {
         const pos1 = Singleton().grid.xyToPosition(xy1);
         const pos2 = Singleton().grid.xyToPosition(xy2);
         return v2(pos1).subtract(buildingPosition).lengthSqr() - v2(pos2).subtract(buildingPosition).lengthSqr();
      })
      .some((fromXy) => {
         const building = gs.tiles[fromXy].building;
         if (!building) {
            // continue;
            return false;
         }
         if (!building.resources[res]) {
            // continue;
            return false;
         }
         if (building.resources[res]! >= amountLeft) {
            const fuelAmount = Math.ceil(amountLeft / workerCapacity);
            if (tryAddTransportation(res, amount, "Worker", fuelAmount, fromXy, targetXy, gs)) {
               building.resources[res]! -= amountLeft;
               amountLeft = 0;
               // break;
               return true;
            } else {
               // continue;
               return false;
            }
         } else {
            const fuelAmount = Math.ceil(building.resources[res]! / workerCapacity);
            if (tryAddTransportation(res, amount, "Worker", fuelAmount, fromXy, targetXy, gs)) {
               amountLeft -= building.resources[res]!;
               building.resources[res] = 0;
            }
            // continue
            return false;
         }
      });
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
