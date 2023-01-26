import { Building } from "../definitions/BuildingDefinitions";
import { Deposit, Resource } from "../definitions/ResourceDefinitions";
import { PartialSet, PartialTabulate } from "../definitions/TypeDefinitions";
import { forEach, safePush } from "../utilities/Helper";
import { GameState } from "./GameState";
import { getTechTree, getUnlocked } from "./TechLogic";
import { ITileData } from "./Tile";

class IntraTickCache {
   revealedDeposits: PartialSet<Deposit> | undefined;
   unlockedBuildings: PartialSet<Building> | undefined;
   buildingsByType: Partial<Record<Building, ITileData[]>> | undefined;
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
   forEach(gs.unlocked, (tech) => {
      const def = getUnlocked(tech, getTechTree(gs).definitions);
      def?.revealDeposit?.forEach((r) => {
         _cache.revealedDeposits![r] = true;
      });
   });
   return _cache.revealedDeposits;
}

export function getBuildingsByType(gs: GameState): Partial<Record<Building, ITileData[]>> {
   if (_cache.buildingsByType) {
      return _cache.buildingsByType;
   }
   const result: Partial<Record<Building, ITileData[]>> = {};
   forEach(gs.tiles, (_, tile) => {
      const type = tile.building?.type;
      if (!type) {
         return;
      }
      safePush(result, type, tile);
   });
   _cache.buildingsByType = result;
   return result;
}

export function unlockedBuildings(gs: GameState): PartialSet<Building> {
   if (_cache.unlockedBuildings) {
      return _cache.unlockedBuildings;
   }
   _cache.unlockedBuildings = {};
   // forEach(gs.unlockedTech, (tech) => {
   //    Config.Tech[tech].unlockBuilding?.forEach((r) => {
   //       _cache.unlockedBuildings![r] = true;
   //    });
   // });
   forEach(gs.unlocked, (tech) => {
      getUnlocked(tech, getTechTree(gs).definitions)?.unlockBuilding?.forEach((r) => {
         _cache.unlockedBuildings![r] = true;
      });
   });
   return _cache.unlockedBuildings;
}
