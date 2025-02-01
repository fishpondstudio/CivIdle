import type { Building } from "../definitions/BuildingDefinitions";
import type { City } from "../definitions/CityDefinitions";
import type { Deposit } from "../definitions/ResourceDefinitions";
import type { Tech, TechAge } from "../definitions/TechDefinitions";
import {
   firstKeyOf,
   forEach,
   isEmpty,
   isNullOrUndefined,
   safeAdd,
   shuffle,
   sizeOf,
   type Tile,
} from "../utilities/Helper";
import { TypedEvent } from "../utilities/TypedEvent";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import { RequestPathFinderGridUpdate, SEA_TILE_COSTS } from "./PlayerTradeLogic";
import { Tick } from "./TickLogic";
import { getDepositTileCount } from "./Tile";
import { OnTechUnlocked } from "./Update";

export function getTechUnlockCost(tech: Tech): number {
   const a = getAgeForTech(tech);
   let ageIdx = 0;
   if (a) {
      const age = Config.TechAge[a];
      ageIdx = age.idx;
   }
   return Math.pow(5, ageIdx) * Math.pow(1.5, Config.Tech[tech].column) * 5000;
}

export function getTotalTechUnlockCost(tech: Tech, gs: GameState) {
   const prerequisites: Tech[] = [];
   let totalScience = getTechUnlockCost(tech);
   getAllPrerequisites(tech).forEach((tech) => {
      if (!gs.unlockedTech[tech]) {
         prerequisites.push(tech);
         totalScience += getTechUnlockCost(tech);
      }
   });
   prerequisites.sort((a, b) => Config.Tech[a].column - Config.Tech[b].column);
   return { prerequisites, totalScience };
}

export function getScienceAmount(gs: GameState): number {
   return Tick.current.specialBuildings.get("Headquarter")?.building.resources.Science ?? 0;
}

export function tryDeductScience(amount: number, gs: GameState): boolean {
   const storage = Tick.current.specialBuildings.get("Headquarter")?.building.resources;
   if (!storage || !storage.Science) return false;
   if (storage.Science >= amount) {
      storage.Science -= amount;
      return true;
   }
   return false;
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

export function getUnlockedTechAges(gs: GameState): Set<TechAge> {
   const result = new Set<TechAge>();
   const currentAge = getCurrentAge(gs);
   if (!currentAge) {
      return result;
   }
   forEach(Config.TechAge, (age, def) => {
      if (def.idx <= Config.TechAge[currentAge].idx) {
         result.add(age);
      }
   });
   return result;
}

export function getBuildingUnlockTech(building: Building): Tech {
   const tech = Config.BuildingTech[building];
   if (tech) return tech;
   let city: City;
   for (city in Config.City) {
      const def = Config.City[city];
      const uniqueTech = def.uniqueBuildings[building];
      if (uniqueTech) return uniqueTech;
   }
   throw new Error(`Cannot find tech for building: ${building}`);
}

export function getBuildingUnlockAge(building: Building): TechAge {
   const age = Config.BuildingTechAge[building];
   if (age) return age;

   const tech = getBuildingUnlockTech(building);
   if (tech) return getAgeForTech(tech);
   throw new Error(`Cannot find age for building: ${building}`);
}

export function getCurrentAge(gs: GameState): TechAge {
   const tech = getMostAdvancedTech(gs);
   if (!tech) {
      return firstKeyOf(Config.TechAge)!;
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

export function getAgeForTech(tech: Tech): TechAge {
   const techColumn = Config.Tech[tech].column;
   let age: TechAge;
   for (age in Config.TechAge) {
      const ageDef = Config.TechAge[age];
      if (techColumn >= ageDef.from && techColumn <= ageDef.to) {
         return age;
      }
   }
   throw new Error(`Cannot find age for tech: ${tech}`);
}

export function getNextAge(age: TechAge): TechAge | null {
   const idx = Config.TechAge[age].idx + 1;
   for (age in Config.TechAge) {
      if (Config.TechAge[age].idx === idx) {
         return age;
      }
   }
   return null;
}

export function isAllTechUnlocked(age: TechAge, gs: GameState): boolean {
   const from = Config.TechAge[age].from;
   const to = Config.TechAge[age].to;
   let tech: Tech;
   for (tech in Config.Tech) {
      if (Config.Tech[tech].column >= from && Config.Tech[tech].column <= to && !gs.unlockedTech[tech]) {
         return false;
      }
   }
   return true;
}

export function unlockTech(tech: Tech, dispatchEvent: boolean, gs: GameState): void {
   if (gs.unlockedTech[tech]) {
      return;
   }
   gs.unlockedTech[tech] = true;
   const def = Config.Tech[tech];
   // Deposits
   def.revealDeposit?.forEach((deposit) => {
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
         addDeposit(xy, deposit, dispatchEvent, gs);
      });
   });
   // Callbacks
   def.onUnlocked?.(gs);
   if (tech in SEA_TILE_COSTS) {
      RequestPathFinderGridUpdate.emit();
   }
   OnTechUnlocked.emit(tech);
}

export const RequestResetTile = new TypedEvent<Tile>();

export function addDeposit(xy: Tile, deposit: Deposit, dispatchEvent: boolean, gs: GameState): void {
   const tile = gs.tiles.get(xy);
   if (tile) {
      tile.deposit[deposit] = true;
      if (dispatchEvent) {
         RequestResetTile.emit(xy);
      }
   }
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
   return getAllPrerequisites(tech).has(prerequisite);
}

export function getAllPrerequisites(tech: Tech): Set<Tech> {
   const result = new Set<Tech>();
   let dep: Tech[] = Config.Tech[tech].requireTech;
   while (dep.length > 0) {
      dep = dep.flatMap((d) => {
         if (result.has(d)) return [];
         result.add(d);
         return Config.Tech[d].requireTech;
      });
   }
   return result;
}

export function getTechUnlockCostInAge(age: TechAge): [number, number] {
   let min = Number.POSITIVE_INFINITY;
   let max = 0;
   const from = Config.TechAge[age].from;
   const to = Config.TechAge[age].to;
   forEach(Config.Tech, (tech, def) => {
      if (def.column >= from && def.column <= to) {
         const cost = getTechUnlockCost(tech);
         max = Math.max(cost, max);
         min = Math.min(cost, min);
      }
   });
   return [min, max];
}

export function checkItsukushimaShrine(tech: Tech, gs: GameState): void {
   if (!Tick.current.specialBuildings.has("ItsukushimaShrine")) {
      return;
   }
   const age = getAgeForTech(tech);
   if (!isAllTechUnlocked(age, gs)) {
      return;
   }
   const nextAge = getNextAge(age);
   if (!nextAge) {
      return;
   }
   const [science, _] = getTechUnlockCostInAge(nextAge);
   const hq = Tick.current.specialBuildings.get("Headquarter");
   if (hq) {
      // console.log(`ItsukushimaShrine: +${science} Science`);
      safeAdd(hq.building.resources, "Science", science);
   }
}

export function getBuildingsUnlockedBefore(age: TechAge): Building[] {
   const result: Building[] = [];
   const idx = Config.TechAge[age].idx;
   forEach(Config.BuildingTechAge, (building, a) => {
      if (Config.TechAge[a].idx < idx) {
         result.push(building);
      }
   });
   return result;
}
