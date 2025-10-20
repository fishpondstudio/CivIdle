import type { Building, IBuildingDefinition } from "../definitions/BuildingDefinitions";
import { NoPrice, NoStorage, type Deposit, type Resource } from "../definitions/ResourceDefinitions";
import { Grid, type IGrid } from "../utilities/Grid";
import {
   clamp,
   forEach,
   hasFlag,
   mapSafeAdd,
   reduceOf,
   safeAdd,
   tileToHash,
   type Tile,
} from "../utilities/Helper";
import type { PartialSet, PartialTabulate } from "../utilities/TypeDefinitions";
import {
   IOFlags,
   getElectrificationLevel,
   getMarketBaseSellAmount,
   getMarketBuyAmount,
   getResourceImportCapacity,
   totalMultiplierFor,
} from "./BuildingLogic";
import { Config } from "./Config";
import { SCIENCE_VALUE } from "./Constants";
import type { GameState } from "./GameState";
import { TILE_SIZE } from "./GameStateLogic";
import { NotProducingReason, Tick, type MultiplierType, type MultiplierWithSource } from "./TickLogic";
import type {
   IBuildingData,
   ICloneBuildingData,
   IMarketBuildingData,
   IResourceImportBuildingData,
   ITileData,
} from "./Tile";
import { Transports } from "./Transports";

class IntraTickCache {
   revealedDeposits: PartialSet<Deposit> | undefined;
   unlockedBuildings: PartialSet<Building> | undefined;
   unlockedResources: PartialSet<Resource> | undefined;
   buildingsByType: Map<Building, Map<Tile, Required<ITileData>>> | undefined;
   buildingsByXy: Map<Tile, IBuildingData> | undefined;
   transportStat: ITransportStat | undefined;
   resourceAmount: PartialTabulate<Resource> | undefined;
   buildingIO: Map<number, Readonly<PartialTabulate<Resource>>> = new Map<
      number,
      Readonly<PartialTabulate<Resource>>
   >();
   storageFullBuildings: Tile[] | undefined;
   resourceIO: IResourceIO | undefined;
   fuelByTarget: Map<Tile, number> = new Map();
   globalMultipliers: Map<MultiplierType, MultiplierWithSource[]> = new Map();
}

export interface IResourceIO {
   theoreticalInput: Map<Resource, number>;
   actualInput: Map<Resource, number>;
   theoreticalOutput: Map<Resource, number>;
   actualOutput: Map<Resource, number>;
}

let _cache = new IntraTickCache();

export function clearIntraTickCache(): void {
   _cache = new IntraTickCache();
}

export function getFuelByTarget(): Map<Tile, number> {
   return _cache.fuelByTarget;
}

export function getBuildingIO(
   xy: Tile,
   type: keyof Pick<IBuildingDefinition, "input" | "output">,
   options: IOFlags,
   gs: GameState,
): Readonly<PartialTabulate<Resource>> {
   const key = (tileToHash(xy) << (IOFlags.TotalUsedBits + 1)) | (options << 1) | (type === "input" ? 1 : 0);
   const cached = _cache.buildingIO.get(key);
   if (cached) {
      return cached;
   }
   const result: PartialTabulate<Resource> = {};
   const b = gs.tiles.get(xy)?.building;
   if (b) {
      const resources = { ...Config.Building[b.type][type] };
      if ("sellResources" in b) {
         const market = b as IMarketBuildingData;
         if (type === "input") {
            forEach(market.sellResources, (sellResource) => {
               const buyResource = market.availableResources[sellResource];
               if (buyResource) {
                  resources[sellResource] = getMarketBaseSellAmount(sellResource, buyResource);
               }
            });
         }
         if (type === "output") {
            forEach(market.sellResources, (sellResource) => {
               const buyResource = market.availableResources[sellResource]!;
               resources[buyResource] = getMarketBuyAmount(
                  sellResource,
                  getMarketBaseSellAmount(sellResource, buyResource),
                  buyResource,
                  xy,
                  gs,
               );
            });
         }
      }
      if ("resourceImports" in b && type === "input") {
         const totalCapacity = getResourceImportCapacity(b, totalMultiplierFor(xy, "output", 1, false, gs));
         const rib = b as IResourceImportBuildingData;
         const totalSetCapacity = reduceOf(rib.resourceImports, (prev, k, v) => prev + v.perCycle, 0);
         const scaleFactor = clamp(totalSetCapacity > 0 ? totalCapacity / totalSetCapacity : 0, 0, 1);
         forEach(rib.resourceImports, (k, v) => {
            // This means the total capacity < total set capacity. It happens when the multiplier reduces.
            // In this case, we scale down all values equally
            if (v.perCycle > 0) {
               result[k] = v.perCycle * scaleFactor;
            }
         });

         _cache.buildingIO.set(key, Object.freeze(result));
         // Resource imports is not affected by multipliers
         return result;
      }
      if ("inputResource" in b) {
         const s = b as ICloneBuildingData;
         if (NoStorage[s.inputResource] || NoPrice[s.inputResource] || s.inputResource === "Koti") {
            s.inputResource = "Computer";
         }
         if (type === "input") {
            resources[s.inputResource] = 1;
         }
         if (type === "output") {
            switch (b.type) {
               case "CloneFactory":
                  resources[s.inputResource] = 2;
                  break;
               case "CloneLab":
                  resources.Science = getCloneLabScienceOutput(s);
                  break;
            }
         }
      }

      if (hasFlag(options, IOFlags.TheoreticalLevelBoost) && hasFlag(options, IOFlags.IgnoreLevelBoost)) {
         console.warn(
            "`TheoreticalElectrification` and `IgnoreElectrification` are both set. Only one of them should be set!",
         );
      }

      // Apply multipliers
      forEach(resources, (k, v) => {
         let level = 0;
         if (hasFlag(options, IOFlags.IgnoreLevelBoost)) {
            level += b.level;
         } else {
            if (hasFlag(options, IOFlags.TheoreticalLevelBoost)) {
               level += b.level + getElectrificationLevel(b, gs);
            } else {
               level += b.level + (Tick.current.electrified.get(xy) ?? 0);
            }
            Tick.current.levelBoost.get(xy)?.forEach((lb) => {
               level += lb.value;
            });
         }
         let value = v * level;
         if (hasFlag(options, IOFlags.Capacity)) {
            value *= b.capacity;
         }
         if (hasFlag(options, IOFlags.Multiplier)) {
            const stableOnly = hasFlag(options, IOFlags.StableOnly);
            if (b.type === "Market") {
               value *= totalMultiplierFor(xy, "output", 1, stableOnly, gs);
            } else if (type === "output" && (b.type === "CloneFactory" || b.type === "CloneLab")) {
               value = value * 0.5 + value * 0.5 * totalMultiplierFor(xy, "output", 1, stableOnly, gs);
            } else if (type === "output") {
               value *= totalMultiplierFor(xy, type, 1, stableOnly, gs);
            }
         }
         safeAdd(result, k, value);
      });
   }

   _cache.buildingIO.set(key, Object.freeze(result));
   return result;
}

export function revealedDeposits(gs: GameState): PartialSet<Deposit> {
   if (_cache.revealedDeposits) {
      return _cache.revealedDeposits;
   }
   _cache.revealedDeposits = {};
   forEach(gs.unlockedTech, (tech) => {
      Config.Tech[tech].revealDeposit?.forEach((r) => {
         _cache.revealedDeposits![r] = true;
      });
   });
   return _cache.revealedDeposits;
}

export function getStorageFullBuildings(): Tile[] {
   if (_cache.storageFullBuildings) {
      return _cache.storageFullBuildings;
   }
   const result: Tile[] = [];
   for (const [xy, reason] of Tick.current.notProducingReasons) {
      if (reason === NotProducingReason.StorageFull) {
         result.push(xy);
      }
   }
   _cache.storageFullBuildings = result;
   return result;
}

export interface ITransportStat {
   totalFuel: number;
   totalTransports: number;
   stalled: number;
}

export function getTransportStat(gs: GameState): ITransportStat {
   if (_cache.transportStat) {
      return _cache.transportStat;
   }
   let totalFuel = 0;
   let totalTransports = 0;
   let stalled = 0;
   Transports.forEach((t) => {
      totalFuel += t.fuelCurrentTick;
      ++totalTransports;
      if (!t.hasEnoughFuel) {
         ++stalled;
      }
   });
   const result: ITransportStat = { totalFuel, totalTransports, stalled };
   _cache.transportStat = result;
   return result;
}

export function getTypeBuildings(gs: GameState): Map<Building, Map<Tile, Required<ITileData>>> {
   if (_cache.buildingsByType) {
      return _cache.buildingsByType;
   }
   const result: Map<Building, Map<Tile, Required<ITileData>>> = new Map();
   gs.tiles.forEach((tile, xy) => {
      const type = tile.building?.type;
      if (!type) {
         return;
      }
      if (!result.has(type)) {
         result.set(type, new Map());
      }
      result.get(type)?.set(xy, tile as Required<ITileData>);
   });
   _cache.buildingsByType = result;
   return result;
}

export function getBuildingsByType(
   building: Building,
   gs: GameState,
): Map<Tile, Required<ITileData>> | undefined {
   return getTypeBuildings(gs).get(building);
}

export function getResourceIO(gameState: GameState): IResourceIO {
   if (_cache.resourceIO) return _cache.resourceIO;

   const result: IResourceIO = {
      theoreticalInput: new Map(),
      actualInput: new Map(),
      theoreticalOutput: new Map(),
      actualOutput: new Map(),
   };

   getXyBuildings(gameState).forEach((building, xy) => {
      if ("resourceImports" in building) {
         return;
      }
      if (!Tick.current.notProducingReasons.has(xy)) {
         const input = getBuildingIO(xy, "input", IOFlags.Multiplier | IOFlags.Capacity, gameState);
         const output = getBuildingIO(xy, "output", IOFlags.Multiplier | IOFlags.Capacity, gameState);
         forEach(input, (res, amount) => {
            mapSafeAdd(result.actualInput, res, amount);
         });
         forEach(output, (res, amount) => {
            mapSafeAdd(result.actualOutput, res, amount);
         });
      }
      const input = getBuildingIO(
         xy,
         "input",
         IOFlags.Multiplier | IOFlags.Capacity | IOFlags.TheoreticalLevelBoost,
         gameState,
      );
      const output = getBuildingIO(
         xy,
         "output",
         IOFlags.Multiplier | IOFlags.Capacity | IOFlags.TheoreticalLevelBoost,
         gameState,
      );
      forEach(input, (res, amount) => {
         mapSafeAdd(result.theoreticalInput, res, amount);
      });
      forEach(output, (res, amount) => {
         mapSafeAdd(result.theoreticalOutput, res, amount);
      });
   });

   Tick.current.additionalConsumptions.forEach(({ res, amount }) =>
      mapSafeAdd(result.theoreticalInput, res, amount),
   );
   Tick.current.additionalConsumptions.forEach(({ res, amount }) =>
      mapSafeAdd(result.actualInput, res, amount),
   );

   Tick.current.additionalProductions.forEach(({ res, amount }) =>
      mapSafeAdd(result.theoreticalOutput, res, amount),
   );
   Tick.current.additionalProductions.forEach(({ res, amount }) =>
      mapSafeAdd(result.actualOutput, res, amount),
   );

   return result;
}

export function getXyBuildings(gs: GameState): Map<Tile, IBuildingData> {
   if (_cache.buildingsByXy) {
      return _cache.buildingsByXy;
   }
   const result: Map<Tile, IBuildingData> = new Map();
   gs.tiles.forEach((tile, xy) => {
      if (tile.building) {
         result.set(xy, tile.building);
      }
   });
   _cache.buildingsByXy = result;
   return result;
}

export function unlockedBuildings(gs: GameState): PartialSet<Building> {
   if (_cache.unlockedBuildings) {
      return _cache.unlockedBuildings;
   }
   _cache.unlockedBuildings = {};
   forEach(gs.unlockedTech, (tech) => {
      Config.Tech[tech].unlockBuilding?.forEach((r) => {
         _cache.unlockedBuildings![r] = true;
      });
   });
   forEach(gs.unlockedUpgrades, (upgrade) => {
      Config.Upgrade[upgrade].unlockBuilding?.forEach((r) => {
         _cache.unlockedBuildings![r] = true;
      });
   });
   return _cache.unlockedBuildings;
}

export function unlockedResources(gs: GameState, ...include: Resource[]): PartialSet<Resource> {
   if (_cache.unlockedResources) {
      const result = { ..._cache.unlockedResources };
      include.forEach((res) => {
         result[res] = true;
      });
      return result;
   }
   _cache.unlockedResources = {};
   forEach(unlockedBuildings(gs), (b) => {
      forEach(Config.Building[b].output, (res) => {
         _cache.unlockedResources![res] = true;
      });
   });
   const result = { ..._cache.unlockedResources };
   include.forEach((res) => {
      result[res] = true;
   });
   return result;
}

let grid: IGrid | null = null;

export function getGrid(gs: GameState): IGrid {
   const size = Config.City[gs.city].size;
   if (grid === null || grid.maxX !== size || grid.maxY !== size || grid.size !== TILE_SIZE) {
      grid = new Grid(size, size, TILE_SIZE);
   }
   return grid;
}

export function getGlobalMultipliers(type: MultiplierType): MultiplierWithSource[] {
   const cached = _cache.globalMultipliers.get(type);
   if (cached) {
      return cached;
   }
   const result: MultiplierWithSource[] = [];
   Tick.current.globalMultipliers[type].forEach((m) => {
      result.push({ source: m.source, [type]: m.value, unstable: m.unstable } as MultiplierWithSource);
   });
   _cache.globalMultipliers.set(type, result);
   return result;
}

export function getCloneLabScienceOutput(cloneLab: ICloneBuildingData): number {
   return ((Config.ResourcePrice[cloneLab.inputResource] ?? 0) * 2) / SCIENCE_VALUE;
}
