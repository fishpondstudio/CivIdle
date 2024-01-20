import { clamp, keysOf, shuffle } from "../../../shared/utilities/Helper";
import { getGameOptions } from "../Global";
import type { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { Config } from "./Config";
import type { GreatPeopleChoice } from "./GameState";
import { Tick } from "./TickLogic";

export function getGreatPeopleAtReborn(): number {
   return clamp(Math.floor(Math.cbrt(Tick.current.totalValue / 1e6) / 4), 0, Infinity);
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
