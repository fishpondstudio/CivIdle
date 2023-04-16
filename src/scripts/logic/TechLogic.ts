import { TechTree } from "../definitions/CityDefinitions";
import { ITechDefinition, IUnlockableDefinition } from "../definitions/ITechDefinition";
import { Deposit } from "../definitions/ResourceDefinitions";
import { IRomeHistoryDefinitions } from "../definitions/RomeHistoryDefinitions";
import { Singleton } from "../Global";
import { forEach, isEmpty, keysOf, shuffle } from "../utilities/Helper";
import { Config } from "./Constants";
import { GameState } from "./GameState";
import { getDepositTileCount } from "./Tile";

export function getUnlockCost(def: ITechDefinition): number {
   return Math.pow(2, def.column) * 5000;
}

export function getScienceAmount(): number {
   return Singleton().buildings.Headquarter.building.resources.Science ?? 0;
}

export function getTechTree(gs: GameState) {
   return TechTree[Config.City[gs.city].techTree];
}

export function getMostAdvancedTech(gs: GameState): string | null {
   let column = 0;
   let tech: string | null = null;
   const definitions = getTechTree(gs).definitions;
   forEach(definitions, (k) => {
      if (gs.unlocked[k] && definitions[k].column >= column) {
         column = definitions[k].column;
         tech = k;
      }
   });
   return tech;
}

export function getCurrentTechAge(gs: GameState): string | null {
   const tech = getMostAdvancedTech(gs);
   if (!tech) {
      return null;
   }
   return getAgeForTech(tech, gs);
}

export function isAgeUnlocked(age: string, gs: GameState): boolean {
   const techTree = getTechTree(gs);
   const tech = getMostAdvancedTech(gs);
   if (!tech) {
      return false;
   }
   return techTree.definitions[tech as keyof typeof techTree.definitions].column >= techTree.ages[age].from;
}

export function getAgeForTech(tech: string, gs: GameState): string | null {
   const techTree = getTechTree(gs);
   const techColumn = techTree.definitions[tech as keyof typeof techTree.definitions].column;
   let age: string;
   for (age in techTree.ages) {
      const ageDef = techTree.ages[age];
      if (techColumn >= ageDef.from && techColumn <= ageDef.to) {
         return age;
      }
   }
   return null;
}

export function getUnlockRequirement(def: IUnlockableDefinition): string[] {
   const result: string[] = [];
   def.require.forEach((r) => result.push(r));
   const requireProvince = (def as IRomeHistoryDefinitions).requireProvince;
   if (requireProvince) {
      requireProvince.forEach((p) => result.push(p));
   }
   return result;
}

export function unlockTech(tech: string, gs: GameState): void {
   if (gs.unlocked[tech]) {
      return;
   }
   gs.unlocked[tech] = true;
   const td = getTechTree(gs).definitions[tech];
   td.revealDeposit?.forEach((deposit) => {
      const tileCount = getDepositTileCount(deposit, gs);
      const depositTiles = shuffle(keysOf(gs.tiles)).slice(0, tileCount);
      const exploredEmptyTiles = Object.values(gs.tiles).filter((t) => t.explored && !t.building && isEmpty(t.deposit));
      // We want to guarantee at least one of the deposit tile is spawned on explored tile.
      if (depositTiles.every((xy) => !gs.tiles[xy].explored) && exploredEmptyTiles.length > 0) {
         depositTiles[0] = shuffle(exploredEmptyTiles)[0].xy;
      }
      depositTiles.forEach((xy) => (gs.tiles[xy].deposit[deposit] = true));
   });
}

export function getDepositUnlockTech<T extends string>(deposit: Deposit, definitions: Record<T, ITechDefinition>): T {
   let key: T;
   for (key in definitions) {
      if (definitions[key].revealDeposit?.includes(deposit)) {
         return key;
      }
   }
   throw new Error(`Deposit ${deposit} is not revealed by any technology, check TechDefinitions`);
}

export function getUnlocked(
   key: string,
   definitions: Record<string, IUnlockableDefinition>
): IUnlockableDefinition | null {
   if (key in definitions) {
      return definitions[key];
   }
   return null;
}

export function unlockableTechs(gs: GameState): string[] {
   const techTree = getTechTree(gs);
   const result: string[] = [];
   forEach(techTree.definitions, (tech, def) => {
      if (gs.unlocked[tech]) {
         return;
      }
      if (def.require.every((t) => gs.unlocked[t])) {
         result.push(tech);
      }
   });
   return result;
}
