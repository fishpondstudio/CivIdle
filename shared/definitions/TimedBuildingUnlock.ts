import type { Building } from "./BuildingDefinitions";
import type { Tech } from "./TechDefinitions";

interface ITimedBuildingUnlock {
   tech: Tech;
   condition: (now: Date) => boolean;
}

export const TimedBuildingUnlock: Partial<Record<Building, ITimedBuildingUnlock>> = {
   SantaClausVillage: { tech: "Theocracy", condition: (now) => now.getMonth() === 11 },
   YearOfTheSnake: {
      tech: "Theater",
      condition: (now) => {
         return (
            (now.getMonth() === 0 && now.getDate() >= 20) || (now.getMonth() === 1 && now.getDate() <= 10)
         );
      },
   },
};
