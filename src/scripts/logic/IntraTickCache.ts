import { IPointData } from "pixi.js";
import { Building, IBuildingDefinition } from "../definitions/BuildingDefinitions";
import { Deposit, Resource } from "../definitions/ResourceDefinitions";
import { PartialSet, PartialTabulate } from "../definitions/TypeDefinitions";
import { forEach, safeAdd, xyToPoint } from "../utilities/Helper";
import { IOCalculation, totalMultiplierFor } from "./BuildingLogic";
import { Config } from "./Constants";
import { GameState } from "./GameState";
import { Tick } from "./TickLogic";
import { IBuildingData, IMarketBuildingData, IResourceImportBuildingData, ITileData } from "./Tile";

class IntraTickCache {
   revealedDeposits: PartialSet<Deposit> | undefined;
   unlockedBuildings: PartialSet<Building> | undefined;
   unlockedResources: PartialSet<Resource> | undefined;
   buildingsByType: Partial<Record<Building, Record<string, Required<ITileData>>>> | undefined;
   buildingsByXy: Partial<Record<string, IBuildingData>> | undefined;
   resourceAmount: PartialTabulate<Resource> | undefined;
   buildingIO: Record<string, PartialTabulate<Resource>> = {};
   storageFullBuildings: IPointData[] | undefined;
}

let _cache = new IntraTickCache();

export function clearIntraTickCache(): void {
   _cache = new IntraTickCache();
}

export function getBuildingIO(
   xy: string,
   type: keyof Pick<IBuildingDefinition, "input" | "output">,
   options: IOCalculation,
   gs: GameState,
): PartialTabulate<Resource> {
   const key = xy + type + options;
   if (_cache.buildingIO[key]) {
      return _cache.buildingIO[key];
   }
   const result: PartialTabulate<Resource> = {};
   const b = gs.tiles[xy].building;
   if (b) {
      const resources = { ...Tick.current.buildings[b.type][type] };
      if ("sellResources" in b && type === "input") {
         forEach((b as IMarketBuildingData).sellResources, (k) => {
            resources[k] = 1;
         });
      }
      if ("resourceImports" in b && type === "input") {
         forEach((b as IResourceImportBuildingData).resourceImports, (k, v) => {
            result[k] = v.perCycle;
         });
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
            value *= totalMultiplierFor(xy, type, 1, gs);
         }
         safeAdd(result, k, value);
      });
   }

   _cache.buildingIO[key] = result;
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

export function getStorageFullBuildings(gs: GameState): IPointData[] {
   if (_cache.storageFullBuildings) {
      return _cache.storageFullBuildings;
   }
   const result: IPointData[] = [];
   forEach(Tick.current.notProducingReasons, (xy, reason) => {
      if (reason === "StorageFull") {
         result.push(xyToPoint(xy));
      }
   });
   _cache.storageFullBuildings = result;
   return result;
}

export function getTypeBuildings(
   gs: GameState,
): Partial<Record<Building, Record<string, Required<ITileData>>>> {
   if (_cache.buildingsByType) {
      return _cache.buildingsByType;
   }
   const result: Partial<Record<Building, Record<string, Required<ITileData>>>> = {};
   forEach(gs.tiles, (xy, tile) => {
      const type = tile.building?.type;
      if (!type) {
         return;
      }
      if (!result[type]) {
         result[type] = {};
      }
      result[type]![xy] = tile as Required<ITileData>;
   });
   _cache.buildingsByType = result;
   return result;
}

export function getBuildingsByType(
   building: Building,
   gs: GameState,
): Record<string, Required<ITileData>> | undefined {
   return getTypeBuildings(gs)[building];
}

export function getXyBuildings(gs: GameState): Partial<Record<string, IBuildingData>> {
   if (_cache.buildingsByXy) {
      return _cache.buildingsByXy;
   }
   const result: Partial<Record<string, IBuildingData>> = {};
   forEach(gs.tiles, (xy, tile) => {
      if (tile.building) {
         result[xy] = tile.building;
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
      forEach(Tick.current.buildings[b].output, (res) => {
         _cache.unlockedResources![res] = true;
      });
   });
   return _cache.unlockedResources;
}
