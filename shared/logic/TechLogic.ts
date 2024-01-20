import type { Building } from "../definitions/BuildingDefinitions";
import type { City } from "../definitions/CityDefinitions";
import type { GreatPerson } from "../definitions/GreatPersonDefinitions";
import type { Deposit, Resource } from "../definitions/ResourceDefinitions";
import type { Tech, TechAge } from "../definitions/TechDefinitions";
import {
   filterOf,
   forEach,
   isEmpty,
   isNullOrUndefined,
   keysOf,
   shuffle,
   type Tile,
} from "../utilities/Helper";
import { Config } from "./Config";
import type { GameState, GreatPeopleChoice } from "./GameState";
import { getGameState } from "./GameStateLogic";
import { getSpecialBuildings } from "./IntraTickCache";
import { getBuildingsThatProduce } from "./ResourceLogic";
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
   forEach(Config.Tech, (k) => {
      if (gs.unlockedTech[k] && Config.Tech[k].column >= column) {
         column = Config.Tech[k].column;
         tech = k;
      }
   });
   return tech;
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

export function unlockTech(tech: Tech, gs: GameState): void {
   if (gs.unlockedTech[tech]) {
      return;
   }
   gs.unlockedTech[tech] = true;
   Config.Tech[tech].revealDeposit?.forEach((deposit) => {
      const tileCount = getDepositTileCount(deposit, gs);
      const depositTiles = shuffle(
         Array.from(gs.tiles.entries()).filter(([xy, tile]) => {
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
         addDeposit(xy, deposit, gs);
      });
   });
}

export function addDeposit(xy: Tile, deposit: Deposit, gs: GameState): void {
   gs.tiles.get(xy)!.deposit[deposit] = true;
   // Singleton().sceneManager.getCurrent(WorldScene)?.resetTile(xy);
}

export function getDepositUnlockTech(deposit: Deposit): Tech {
   let key: Tech;
   for (key in Config.Tech) {
      if (Config.Tech[key].revealDeposit?.includes(deposit)) {
         return key;
      }
   }
   throw new Error(`Deposit ${deposit} is not revealed by any technology, check TechDefinitions`);
}

export function getBuildingUnlockTech(building: Building): Tech | null {
   let key: Tech;
   for (key in Config.Tech) {
      if (Config.Tech[key].unlockBuilding?.includes(building)) {
         return key;
      }
   }

   let city: City;
   for (city in Config.City) {
      const def = Config.City[city];
      if (def.uniqueBuildings[building]) {
         return def.uniqueBuildings[building]!;
      }
   }
   return null;
}

export function getResourceUnlockTech(res: Resource): Tech | null {
   const buildings = getBuildingsThatProduce(res);
   const techs = buildings
      .flatMap((a) => {
         const tech = getBuildingUnlockTech(a);
         if (!tech) {
            return [];
         }
         return [tech];
      })
      .sort((a, b) => Config.Tech[a].column - Config.Tech[b].column);
   if (buildings.length > 0) {
      return techs[0];
   }
   return null;
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

export function getGreatPeopleChoices(age: TechAge): GreatPeopleChoice {
   const choices: GreatPerson[] = [];
   const pool = shuffle(keysOf(filterOf(Config.GreatPerson, (_, v) => v.age === age)));
   console.assert(pool.length >= 3);
   for (let i = 0; i < 3; i++) {
      choices.push(pool[i]);
   }
   return choices as GreatPeopleChoice;
}
