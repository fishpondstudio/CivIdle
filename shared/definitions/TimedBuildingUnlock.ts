import type { Building } from "./BuildingDefinitions";
import type { Tech } from "./TechDefinitions";

interface ITimedBuildingUnlock {
   tech: Tech;
   condition: (now: Date) => boolean;
}

export const TimedBuildingUnlock: Partial<Record<Building, ITimedBuildingUnlock>> = {
   BranCastle: {
      tech: "HolyEmpire",
      condition: isHalloween,
   },
   SantaClausVillage: { tech: "Theocracy", condition: isChristmas },
   YearOfTheSnake: {
      tech: "Theater",
      condition: isLunarNewYear,
   },
   EasterBunny: {
      tech: "PrivateOwnership",
      condition: (now) => now.getMonth() === 3,
   },
};

export function isHalloween(now: Date): boolean {
   return (now.getMonth() === 9 && now.getDate() >= 15) || (now.getMonth() === 10 && now.getDate() <= 15);
}

export function isChristmas(now: Date): boolean {
   return now.getMonth() === 11;
}

export function isLunarNewYear(now: Date): boolean {
   return (now.getMonth() === 1 && now.getDate() >= 10) || (now.getMonth() === 1 && now.getDate() <= 24);
}
