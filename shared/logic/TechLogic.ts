import { Building } from "../definitions/BuildingDefinitions";
import { City } from "../definitions/CityDefinitions";
import type { Deposit } from "../definitions/ResourceDefinitions";
import type { Tech, TechAge } from "../definitions/TechDefinitions";
import { forEach, isEmpty, isNullOrUndefined, shuffle, sizeOf, type Tile } from "../utilities/Helper";
import { TypedEvent } from "../utilities/TypedEvent";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import { getGameState } from "./GameStateLogic";
import { getSpecialBuildings } from "./IntraTickCache";
import { RequestPathFinderGridUpdate, SEA_TILE_COSTS } from "./PlayerTradeLogic";
import { getDepositTileCount } from "./Tile";

export function getUnlockCost(tech: Tech): number {
   const a = getAgeForTech(tech);
   let ageIdx = 0;
   if (a) {
      const age = Config.TechAge[a];
      ageIdx = age.idx;
   }
   return Math.pow(5, ageIdx) * Math.pow(1.5, Config.Tech[tech].column) * 5000;
}

export function getScienceAmount(): number {
   return getSpecialBuildings(getGameState()).Headquarter.building.resources.Science ?? 0;
}

export function getMostAdvancedTech(gs: GameState): Tech | null {
   let column = 0;
   let tech: Tech | null = null;
   forEach(gs.unlockedTech, (k) => {
      if (Config.Tech[k].column >= column) {
         column = Config.Tech[k].column;
         tech = k;
      }
   });
   return tech;
}

export function getBuildingUnlockTech(building: Building): Tech | null {
   const tech = Config.BuildingTech[building];
   if (tech) return tech;
   let city: City;
   for (city in Config.City) {
      const def = Config.City[city];
      const uniqueTech = def.uniqueBuildings[building];
      if (uniqueTech) return uniqueTech;
   }
   return null;
}

export function getCurrentTechAge(gs: GameState): TechAge | null {
   const tech = getMostAdvancedTech(gs);
   if (!tech) {
      return null;
   }
   return getAgeForTech(tech);
}

export function isAgeUnlocked(age: TechAge, gs: GameState): boolean {
   const tech = getMostAdvancedTech(gs);
   if (!tech) {
      return false;
   }
   return Config.Tech[tech].column >= Config.TechAge[age].from;
}

export function getAgeForTech(tech: string): TechAge | null {
   const techColumn = Config.Tech[tech as Tech].column;
   let age: TechAge;
   for (age in Config.TechAge) {
      const ageDef = Config.TechAge[age];
      if (techColumn >= ageDef.from && techColumn <= ageDef.to) {
         return age;
      }
   }
   return null;
}

export function unlockTech(tech: Tech, event: TypedEvent<Tile> | null, gs: GameState): void {
   if (gs.unlockedTech[tech]) {
      return;
   }
   gs.unlockedTech[tech] = true;
   Config.Tech[tech].revealDeposit?.forEach((deposit) => {
      const tileCount = getDepositTileCount(deposit, gs);
      const depositTiles = shuffle(
         Array.from(gs.tiles.entries()).filter(([xy, tile]) => {
            // We do not spawn 2 resources on a single tile
            if (sizeOf(tile.deposit) >= 2) {
               return false;
            }

            const type = tile.building?.type;
            if (!type) {
               return true;
            }
            // Do not spawn deposit under headquarter or wonders! Also use Config.Building because
            // this code can happen in Initialize logic, which is very early
            if (!isNullOrUndefined(Config.Building[type].special)) {
               return false;
            }

            return true;
         }),
      ).slice(0, tileCount);
      const exploredEmptyTiles = Object.values(gs.tiles).filter(
         (t) => t.explored && !t.building && isEmpty(t.deposit),
      );
      // We want to guarantee at least one of the deposit tile is spawned on explored tile.
      if (depositTiles.every(([_, tile]) => !tile.explored) && exploredEmptyTiles.length > 0) {
         depositTiles[0] = shuffle(exploredEmptyTiles)[0].xy;
      }
      depositTiles.forEach(([xy, tile]) => {
         addDeposit(xy, deposit, event, gs);
      });
   });

   if (tech in SEA_TILE_COSTS) {
      RequestPathFinderGridUpdate.emit();
   }
}

export const OnResetTile = new TypedEvent<Tile>();

export function addDeposit(xy: Tile, deposit: Deposit, event: TypedEvent<Tile> | null, gs: GameState): void {
   gs.tiles.get(xy)!.deposit[deposit] = true;
   event?.emit(xy);
}

export function unlockableTechs(gs: GameState): Tech[] {
   const result: Tech[] = [];
   forEach(Config.Tech, (tech, def) => {
      if (gs.unlockedTech[tech]) {
         return;
      }
      if (def.requireTech.every((t) => gs.unlockedTech[t])) {
         result.push(tech);
      }
   });
   return result;
}

export function isPrerequisiteOf(prerequisite: Tech, tech: Tech): boolean {
   const result = new Set();
   let dep: Tech[] = Config.Tech[tech].requireTech.slice(0);
   while (dep.length > 0) {
      dep = dep.flatMap((d) => {
         result.add(d);
         return Config.Tech[d].requireTech.slice(0);
      });
   }
   return result.has(prerequisite);
}
