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
   Midsummer: {
      tech: "Calendar",
      // Remove the last part of condition after beta!
      condition: (now) => now.getMonth() === 5 && now.getDate() >= 10 && now.getDate() <= 30,
   },
};

export function isHalloween(now: Date): boolean {
   return (now.getMonth() === 9 && now.getDate() >= 15) || (now.getMonth() === 10 && now.getDate() <= 15);
}

export function isChristmas(now: Date): boolean {
   return now.getMonth() === 11;
}

export function isRestitutorReleaseWindow(now: Date): boolean {
   return now.getMonth() === 8 && now.getDate() >= 8 && now.getDate() <= 22;
}

let _formatter: Intl.DateTimeFormat | undefined;
try {
   _formatter = new Intl.DateTimeFormat("en-u-ca-chinese", {
      month: "numeric",
      day: "numeric",
   });
} catch {
   _formatter = undefined;
}
const _cachedLunarYearRanges = new Map<number, [start: number, end: number]>();

export function isLunarNewYear(now: Date): boolean {
   const year = now.getFullYear();
   let range = _cachedLunarYearRanges.get(year);

   if (!range) {
      if (_formatter) {
         const lunarNewYear = new Date(year, 0, 20, 12);
         while (lunarNewYear.getMonth() < 2) {
            const parts = _formatter.formatToParts(lunarNewYear);
            const month = parts.find((part) => part.type === "month")?.value;
            const day = parts.find((part) => part.type === "day")?.value;
            if (month === "1" && day === "1") {
               range = [
                  new Date(year, lunarNewYear.getMonth(), lunarNewYear.getDate() - 5).getTime(),
                  new Date(year, lunarNewYear.getMonth(), lunarNewYear.getDate() + 15).getTime(),
               ];
               break;
            }
            lunarNewYear.setDate(lunarNewYear.getDate() + 1);
         }
      }

      // Assume February 1 is Lunar New Year if the Chinese calendar is unavailable.
      range ??= [new Date(year, 0, 27).getTime(), new Date(year, 1, 16).getTime()];
      _cachedLunarYearRanges.set(year, range);
   }

   const timestamp = now.getTime();
   return range ? timestamp >= range[0] && timestamp < range[1] : false;
}
