import type { City } from "../definitions/CityDefinitions";
import { GreatPersonType, type GreatPerson } from "../definitions/GreatPersonDefinitions";
import { NoPrice, type Resource } from "../definitions/ResourceDefinitions";
import type { TechAge } from "../definitions/TechDefinitions";
import {
   WEEK,
   clamp,
   filterOf,
   forEach,
   isNullOrUndefined,
   keysOf,
   reduceOf,
   shuffle,
} from "../utilities/Helper";
import { Config } from "./Config";
import type { GameOptions, GameState, GreatPeopleChoice, GreatPeopleChoiceV2 } from "./GameState";
import { getGameOptions, getGameState } from "./GameStateLogic";
import { Tick } from "./TickLogic";

////////////////////////////////////////////////
// These two functions needed to be kept in sync manually! If you modify any of them, please also change the
// other one!
export function getRebirthGreatPeopleCount(): number {
   return clamp(Math.floor(Math.cbrt(Tick.current.totalValue / 1e6) / 4), 0, Number.POSITIVE_INFINITY);
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

export function getGreatPersonTotalEffect(
   gp: GreatPerson,
   gs: GameState = getGameState(),
   options: GameOptions = getGameOptions(),
): number {
   return getGreatPersonThisRunLevel(gs.greatPeople[gp] ?? 0) + (options.greatPeople[gp]?.level ?? 0);
}

export function getProgressTowardsNextGreatPerson(): number {
   const greatPeopleCount = getRebirthGreatPeopleCount();
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

export function getTotalGreatPeopleUpgradeCost(gp: GreatPerson, targetLevel: number): number {
   let result = 0;
   for (let i = 1; i <= targetLevel; ++i) {
      result += getGreatPersonUpgradeCost(gp, i);
   }
   return result;
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
   forEach(gs.greatPeople, (k, v) => {
      addPermanentGreatPerson(k, v);
   });
}

export function addPermanentGreatPerson(gp: GreatPerson, amount: number): void {
   const options = getGameOptions();
   const inv = options.greatPeople[gp];
   if (inv) {
      inv.amount += amount;
   } else {
      options.greatPeople[gp] =
         Config.GreatPerson[gp].type === GreatPersonType.Normal
            ? { level: 1, amount: amount - 1 }
            : { level: 0, amount };
   }
}

export function upgradeAllPermanentGreatPeople(options: GameOptions): void {
   forEach(options.greatPeople, (greatPerson, inventory) => {
      if (Config.GreatPerson[greatPerson].type !== GreatPersonType.Normal) return;
      while (inventory.amount >= getGreatPersonUpgradeCost(greatPerson, inventory.level + 1)) {
         inventory.amount -= getGreatPersonUpgradeCost(greatPerson, inventory.level + 1);
         ++inventory.level;
      }
   });
}

export function rollPermanentGreatPeople(
   totalAmount: number,
   amountPerRoll: number,
   choiceCount: number,
   currentAge: TechAge,
   city: City,
): GreatPeopleChoiceV2[] {
   const result: GreatPeopleChoiceV2[] = [];
   const currentTechAgeIdx = Config.TechAge[currentAge].idx;
   const pool = keysOf(
      filterOf(
         Config.GreatPerson,
         (_, v) =>
            (isNullOrUndefined(v.city) || v.city === city) &&
            Config.TechAge[v.age].idx <= currentTechAgeIdx + 1,
      ),
   );
   let amountLeft = totalAmount;
   let candidates = shuffle([...pool]);
   while (amountLeft > 0) {
      const choices: GreatPerson[] = [];
      for (let i = 0; i < choiceCount; i++) {
         if (candidates.length === 0) {
            candidates = shuffle([...pool]);
         }
         choices.push(candidates.pop()!);
      }
      const amount = clamp(amountPerRoll, 0, amountLeft);
      amountLeft -= amount;
      result.push({ choices, amount });
   }
   return result;
}

export function rollGreatPeopleThisRun(
   age: TechAge,
   city: City,
   choiceCount: number,
): GreatPeopleChoiceV2 | null {
   const choices: GreatPeopleChoice = [];
   const pool = shuffle(
      keysOf(
         filterOf(
            Config.GreatPerson,
            (_, v) => (isNullOrUndefined(v.city) || v.city === city) && v.age === age,
         ),
      ),
   );
   if (pool.length < choiceCount) {
      return null;
   }
   for (let i = 0; i < choiceCount; i++) {
      choices.push(pool[i]);
   }
   return { choices, amount: 1 };
}

export const DEFAULT_GREAT_PEOPLE_CHOICE_COUNT = 3;

export function getGreatPeopleChoiceCount(gs: GameState): number {
   const yct = Tick.current.specialBuildings.get("YellowCraneTower");
   if (yct) {
      return 1 + DEFAULT_GREAT_PEOPLE_CHOICE_COUNT;
   }
   return DEFAULT_GREAT_PEOPLE_CHOICE_COUNT;
}

export function getPermanentGreatPeopleLevel(): number {
   return reduceOf(
      getGameOptions().greatPeople,
      (prev, gp, inv) => {
         return prev + inv.level + (getGameOptions().ageWisdom[Config.GreatPerson[gp].age] ?? 0);
      },
      0,
   );
}

export function getPermanentGreatPeopleCount(): number {
   return reduceOf(
      getGameOptions().greatPeople,
      (prev, gp, inv) => {
         let result = prev + getTotalGreatPeopleUpgradeCost(gp, inv.level) + inv.amount;
         if (isEligibleForWisdom(gp)) {
            result += getTotalWisdomUpgradeCost(gp);
         }
         return result;
      },
      0,
   );
}

export function calculateEmpireValue(resource: Resource, amount: number): number {
   return NoPrice[resource] ? 0 : amount * (Config.ResourcePrice[resource] ?? 0);
}

export function sortGreatPeople(a: GreatPerson, b: GreatPerson): number {
   const gpa = Config.GreatPerson[a];
   const gpb = Config.GreatPerson[b];
   const diff = Config.TechAge[gpa.age].idx - Config.TechAge[gpb.age].idx;
   if (diff !== 0) {
      return diff;
   }
   return gpa.name().localeCompare(gpb.name());
}

export function getFreeCityThisWeek(): City {
   const candidates: City[] = [];
   forEach(Config.City, (city, def) => {
      if (def.requireSupporterPack) {
         candidates.push(city);
      }
   });
   const week = Math.floor(Date.now() / WEEK);
   return candidates[week % candidates.length];
}

export function isEligibleForWisdom(gp: GreatPerson): boolean {
   const def = Config.GreatPerson[gp];
   if (def.type === GreatPersonType.Normal && !def.city) {
      return true;
   }
   return false;
}

export function getGreatPeopleForWisdom(age: TechAge): GreatPerson[] {
   const result: GreatPerson[] = [];
   forEach(Config.GreatPerson, (gp, def) => {
      if (def.age === age && isEligibleForWisdom(gp)) {
         result.push(gp);
      }
   });
   return result;
}

export function getWisdomUpgradeCost(gp: GreatPerson): number {
   const def = Config.GreatPerson[gp];
   const options = getGameOptions();
   const targetLevel = 1 + (options.ageWisdom[def.age] ?? 0);
   return getTotalGreatPeopleUpgradeCost(gp, targetLevel);
}

export function getTotalWisdomUpgradeCost(gp: GreatPerson): number {
   const def = Config.GreatPerson[gp];
   const options = getGameOptions();
   const currentLevel = options.ageWisdom[def.age] ?? 0;
   let result = 0;
   if (currentLevel >= 1) {
      for (let i = 1; i <= currentLevel; i++) {
         result += getTotalGreatPeopleUpgradeCost(gp, i);
      }
   }
   return result;
}

export function getMissingGreatPeopleForWisdom(age: TechAge): Map<GreatPerson, number> {
   const options = getGameOptions();
   const result = new Map<GreatPerson, number>();
   getGreatPeopleForWisdom(age).forEach((gp) => {
      const currentShards = options.greatPeople[gp]?.amount ?? 0;
      const requiredShards = getWisdomUpgradeCost(gp);
      const diff = requiredShards - currentShards;
      if (diff > 0) {
         result.set(gp, diff);
      }
   });
   return result;
}
