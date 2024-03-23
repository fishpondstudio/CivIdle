import type { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { TechAge } from "../definitions/TechDefinitions";
import { clamp, filterOf, forEach, keysOf, shuffle } from "../utilities/Helper";
import { Config } from "./Config";
import type { GameOptions, GreatPeopleChoice } from "./GameState";
import { getGameOptions, getGameState } from "./GameStateLogic";
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

export function getGreatPersonThisRunLevel(amount: number): number {
   let result = 0;
   for (let i = 1; i <= amount; ++i) {
      result += 1 / i;
   }
   return Math.round(result * 100) / 100;
}

export function getProgressTowardsNextGreatPerson(): number {
   const greatPeopleCount = getGreatPeopleAtReborn();
   const previous = getValueRequiredForGreatPeople(greatPeopleCount);
   const progress =
      (Tick.current.totalValue - previous) /
      (getValueRequiredForGreatPeople(greatPeopleCount + 1) - previous);
   return progress;
}

export function getGreatPersonUpgradeCost(gp: GreatPerson, targetLevel: number): number {
   if (gp === "Fibonacci") {
      return getUpgradeCostFib(targetLevel);
   }
   return Math.pow(2, targetLevel - 1);
}

export function getUpgradeCostFib(n: number): number {
   let a = 0;
   let b = 1;
   let c = 1;
   for (let i = 0; i <= n; ++i) {
      c = a + b;
      a = b;
      b = c;
   }
   return a;
}

export function getTribuneUpgradeMaxLevel(age: TechAge): number {
   switch (age) {
      case "BronzeAge":
         return 3;
      case "IronAge":
         return 3;
      case "ClassicalAge":
         return 3;
      case "MiddleAge":
         return 2;
      case "RenaissanceAge":
         return 2;
      case "IndustrialAge":
         return 2;
      default:
         return 1;
   }
}

export function makeGreatPeopleFromThisRunPermanent(): void {
   const gs = getGameState();
   const options = getGameOptions();
   forEach(gs.greatPeople, (k, v) => {
      if (options.greatPeople[k]) {
         options.greatPeople[k]!.amount += v;
      } else {
         options.greatPeople[k] = { level: 1, amount: v - 1 };
      }
   });
}

export function upgradeAllPermanentGreatPeople(options: GameOptions): void {
   forEach(options.greatPeople, (greatPerson, inventory) => {
      while (inventory.amount >= getGreatPersonUpgradeCost(greatPerson, inventory.level + 1)) {
         inventory.amount -= getGreatPersonUpgradeCost(greatPerson, inventory.level + 1);
         ++inventory.level;
      }
   });
}

export function rollPermanentGreatPeople(amount: number, currentTechAge: TechAge): void {
   const currentTechAgeIdx = Config.TechAge[currentTechAge].idx;
   const pool = keysOf(Config.GreatPerson).filter(
      (p) => Config.TechAge[Config.GreatPerson[p].age].idx <= currentTechAgeIdx + 1,
   );
   let candidates = shuffle([...pool]);
   for (let i = 0; i < amount; i++) {
      const choice: GreatPerson[] = [];
      for (let i = 0; i < 3; i++) {
         if (candidates.length === 0) {
            candidates = shuffle([...pool]);
         }
         choice.push(candidates.pop()!);
      }
      getGameOptions().greatPeopleChoices.push(choice);
   }
}

export function rollGreatPeopleThisRun(age: TechAge, amount = 3): GreatPeopleChoice | null {
   const choices: GreatPerson[] = [];
   const pool = shuffle(keysOf(filterOf(Config.GreatPerson, (_, v) => v.age === age)));
   if (pool.length < amount) {
      return null;
   }
   for (let i = 0; i < amount; i++) {
      choices.push(pool[i]);
   }
   return choices as GreatPeopleChoice;
}
