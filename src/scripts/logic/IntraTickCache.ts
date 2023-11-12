import { Building } from "../definitions/BuildingDefinitions";
import { Deposit, Resource } from "../definitions/ResourceDefinitions";
import { PartialSet, PartialTabulate } from "../definitions/TypeDefinitions";
import { forEach } from "../utilities/Helper";
import { Config } from "./Constants";
import { GameState } from "./GameState";
import { Tick } from "./TickLogic";
import { IBuildingData, ITileData } from "./Tile";

class IntraTickCache {
   revealedDeposits: PartialSet<Deposit> | undefined;
   unlockedBuildings: PartialSet<Building> | undefined;
   unlockedResources: PartialSet<Resource> | undefined;
   buildingsByType: Partial<Record<Building, Record<string, Required<ITileData>>>> | undefined;
   buildingsByXy: Partial<Record<string, IBuildingData>> | undefined;
   resourceAmount: PartialTabulate<Resource> | undefined;
}

let _cache = new IntraTickCache();

export function clearIntraTickCache(): void {
   _cache = new IntraTickCache();
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

export function getTypeBuildings(gs: GameState): Partial<Record<Building, Record<string, Required<ITileData>>>> {
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

export function getBuildingsByType(building: Building, gs: GameState): Record<string, Required<ITileData>> | undefined {
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
