import { Building } from "../definitions/BuildingDefinitions";
import { ITechDefinition } from "../definitions/ITechDefinition";
import { Deposit, Resource } from "../definitions/ResourceDefinitions";
import { Tech, TechAge } from "../definitions/TechDefinitions";
import { Singleton } from "../Global";
import { forEach, isEmpty, keysOf, shuffle } from "../utilities/Helper";
import { GameState } from "./GameState";
import { getBuildingsThatProduce } from "./ResourceLogic";
import { getDepositTileCount } from "./Tile";

export function getUnlockCost(def: ITechDefinition): number {
   return Math.pow(2, def.column) * 5000;
}

export function getScienceAmount(): number {
   return Singleton().buildings.Headquarter.building.resources.Science ?? 0;
}

export function getMostAdvancedTech(gs: GameState): Tech | null {
   let column = 0;
   let tech: Tech | null = null;
   forEach(Tech, (k) => {
      if (gs.unlockedTech[k] && Tech[k].column >= column) {
         column = Tech[k].column;
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
   return getAgeForTech(tech, gs);
}

export function isAgeUnlocked(age: TechAge, gs: GameState): boolean {
   const tech = getMostAdvancedTech(gs);
   if (!tech) {
      return false;
   }
   return Tech[tech].column >= TechAge[age].from;
}

export function getAgeForTech(tech: string, gs: GameState): TechAge | null {
   const techColumn = Tech[tech as keyof typeof Tech].column;
   let age: TechAge;
   for (age in TechAge) {
      const ageDef = TechAge[age];
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
   Tech[tech].revealDeposit?.forEach((deposit) => {
      const tileCount = getDepositTileCount(deposit, gs);
      const depositTiles = shuffle(keysOf(gs.tiles)).slice(0, tileCount);
      const exploredEmptyTiles = Object.values(gs.tiles).filter((t) => t.explored && !t.building && isEmpty(t.deposit));
      // We want to guarantee at least one of the deposit tile is spawned on explored tile.
      if (depositTiles.every((xy) => !gs.tiles[xy].explored) && exploredEmptyTiles.length > 0) {
         depositTiles[0] = shuffle(exploredEmptyTiles)[0].xy;
      }
      depositTiles.forEach((xy) => (gs.tiles[xy].deposit[deposit] = true));
   });
   Tech[tech].unlockFeature?.forEach((f) => (gs.features[f] = true));
}

export function getDepositUnlockTech(deposit: Deposit): Tech {
   let key: Tech;
   for (key in Tech) {
      if (Tech[key].revealDeposit?.includes(deposit)) {
         return key;
      }
   }
   throw new Error(`Deposit ${deposit} is not revealed by any technology, check TechDefinitions`);
}

export function getBuildingUnlockTech(building: Building): Tech | null {
   let key: Tech;
   for (key in Tech) {
      if (Tech[key].unlockBuilding?.includes(building)) {
         return key;
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
      .sort((a, b) => Tech[a].column - Tech[b].column);
   if (buildings.length > 0) {
      return techs[0];
   }
   return null;
}

export function unlockableTechs(gs: GameState): Tech[] {
   const result: Tech[] = [];
   forEach(Tech, (tech, def) => {
      if (gs.unlockedTech[tech]) {
         return;
      }
      if (def.requireTech.every((t) => gs.unlockedTech[t])) {
         result.push(tech);
      }
   });
   return result;
}
