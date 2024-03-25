import type { Building, IBuildingDefinition } from "../definitions/BuildingDefinitions";
import type { Deposit, Resource } from "../definitions/ResourceDefinitions";
import { Grid } from "../utilities/Grid";
import { forEach, safeAdd, tileToHash, type Tile } from "../utilities/Helper";
import type { PartialSet, PartialTabulate } from "../utilities/TypeDefinitions";
import {
   IOCalculation,
   getMarketBaseSellAmount,
   getMarketBuyAmount,
   getResourceImportCapacity,
   totalMultiplierFor,
} from "./BuildingLogic";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import { TILE_SIZE } from "./GameStateLogic";
import { Tick } from "./TickLogic";
import type { IBuildingData, IMarketBuildingData, IResourceImportBuildingData, ITileData } from "./Tile";

class IntraTickCache {
   revealedDeposits: PartialSet<Deposit> | undefined;
   unlockedBuildings: PartialSet<Building> | undefined;
   unlockedResources: PartialSet<Resource> | undefined;
   buildingsByType: Map<Building, Map<Tile, Required<ITileData>>> | undefined;
   buildingsByXy: Map<Tile, IBuildingData> | undefined;
   resourceAmount: PartialTabulate<Resource> | undefined;
   buildingIO: Map<number, Readonly<PartialTabulate<Resource>>> = new Map<
      number,
      Readonly<PartialTabulate<Resource>>
   >();
   storageFullBuildings: Tile[] | undefined;
}

let _cache = new IntraTickCache();

export function clearIntraTickCache(): void {
   _cache = new IntraTickCache();
}

export function getBuildingIO(
   xy: Tile,
   type: keyof Pick<IBuildingDefinition, "input" | "output">,
   options: IOCalculation,
   gs: GameState,
): Readonly<PartialTabulate<Resource>> {
   const key =
      (tileToHash(xy) << (IOCalculation.TotalUsedBits + 1)) | (options << 1) | (type === "input" ? 1 : 0);
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
         let used = 0;
         forEach((b as IResourceImportBuildingData).resourceImports, (k, v) => {
            if (Tick.current.totalValue > 0 && used + v.perCycle > totalCapacity) {
               // Somehow a player manages to assign more capacity than allowed. We correct this case here.
               // But we only want to correct this when Tick is fully initialized. Currently it's done by
               // checking Tick.current.totalValue, but we should revisit this later
               v.perCycle = 0;
            } else {
               used += v.perCycle;
               result[k] = v.perCycle;
            }
         });
         _cache.buildingIO.set(key, Object.freeze(result));
         // Resource imports is not affected by multipliers
         return result;
      }
      // Apply multipliers
      forEach(resources, (k, v) => {
         let value = v * b.level;
         if (options & IOCalculation.Capacity) {
            value *= b.capacity;
         }
         if (options & IOCalculation.Multiplier) {
            value *= totalMultiplierFor(xy, type, 1, false, gs);
         }
         if (options & IOCalculation.MultiplierExcludeElectrification) {
            value *= totalMultiplierFor(xy, type, 1, true, gs);
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
      if (reason === "StorageFull") {
         result.push(xy);
      }
   }
   _cache.storageFullBuildings = result;
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
   return _cache.unlockedBuildings;
}

export function unlockedResources(gs: GameState): PartialSet<Resource> {
   if (_cache.unlockedResources) {
      return _cache.unlockedResources;
   }
   _cache.unlockedResources = {};
   forEach(unlockedBuildings(gs), (b) => {
      forEach(Config.Building[b].output, (res) => {
         _cache.unlockedResources![res] = true;
      });
   });
   return _cache.unlockedResources;
}

export interface Cached {
   grid: Grid;
   buildings: ISpecialBuildings;
}

let grid: Grid | null = null;

export function getGrid(gs: GameState): Grid {
   const size = Config.City[gs.city].size;
   if (grid === null || grid.maxX !== size || grid.maxY !== size || grid.size !== TILE_SIZE) {
      grid = new Grid(size, size, TILE_SIZE);
   }
   return grid;
}

let specialBuildings: ISpecialBuildings | null = null;

export function getSpecialBuildings(gs: GameState): ISpecialBuildings {
   if (specialBuildings === null) {
      specialBuildings = findSpecialBuildings(gs);
   }
   return specialBuildings;
}

function findSpecialBuildings(gameState: GameState): ISpecialBuildings {
   const buildings: Partial<Record<Building, ITileData>> = {};
   gameState.tiles.forEach((tile) => {
      if (tile.building?.type === "Headquarter") {
         console.assert(
            buildings.Headquarter === undefined,
            "There should be only one Headquarter. One =",
            buildings.Headquarter,
            "Another = ",
            tile,
         );
         buildings.Headquarter = tile;
      }
      if (tile.building?.type === "Petra") {
         console.assert(
            buildings.Petra === undefined,
            "There should be only one Petra. One =",
            buildings.Petra,
            "Another = ",
            tile,
         );
         buildings.Petra = tile;
      }
   });
   console.assert(!!buildings.Headquarter, "Should find 1 Headquarter");
   return buildings as ISpecialBuildings;
}

export interface ISpecialBuildings {
   Headquarter: Required<ITileData>;
   Petra?: Required<ITileData>;
}
