import type { Building } from "./BuildingDefinitions";
import type { Tech } from "./TechDefinitions";

interface ITimedBuildingUnlock {
   tech: Tech;
   condition: (now: Date) => boolean;
}

export const TimedBuildingUnlock: Partial<Record<Building, ITimedBuildingUnlock>> = {
   SantaClausVillage: { tech: "Theocracy", condition: (now) => now.getMonth() === 11 },
};
