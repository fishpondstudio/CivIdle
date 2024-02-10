import type { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { clamp, forEach, keysOf, shuffle } from "../utilities/Helper";
import { Config } from "./Config";
import type { GameOptions, GreatPeopleChoice } from "./GameState";
import { getGameOptions } from "./GameStateLogic";
import { Tick } from "./TickLogic";

////////////////////////////////////////////////
// These two functions needed to be kept in sync manually! If you modify any of them, please also change the
// other one!
export function getGreatPeopleAtReborn(): number {
   return clamp(Math.floor(Math.cbrt(Tick.current.totalValue / 1e6) / 4), 0, Infinity);
}

export function getValueRequiredForGreatPeople(count: number): number {
   return Math.pow(4 * count, 3) * 1e6;
}
////////////////////////////////////////////////

export function getProgressTowardsNextGreatPerson(): number {
   return Tick.current.totalValue / getValueRequiredForGreatPeople(getGreatPeopleAtReborn() + 1);
}

export function getGreatPersonUpgradeCost(targetLevel: number): number {
   return Math.pow(2, targetLevel - 1);
}

export function rollPermanentGreatPeople(amount: number): void {
   let candidates = shuffle(keysOf(Config.GreatPerson));
   for (let i = 0; i < amount; i++) {
      const choice: GreatPerson[] = [];
      for (let i = 0; i < 3; i++) {
         if (candidates.length === 0) {
            candidates = shuffle(keysOf(Config.GreatPerson));
         }
         choice.push(candidates.pop()!);
      }
      getGameOptions().greatPeopleChoices.push(choice as GreatPeopleChoice);
   }
}

export function upgradeAllPermanentGreatPeople(options: GameOptions): void {
   forEach(options.greatPeople, (greatPerson, inventory) => {
      while (inventory.amount >= getGreatPersonUpgradeCost(inventory.level + 1)) {
         inventory.amount -= getGreatPersonUpgradeCost(inventory.level + 1);
         ++inventory.level;
      }
   });
}
