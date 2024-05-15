import type { GlobalMultipliers, Multiplier } from "../logic/TickLogic";
import type { Building } from "./BuildingDefinitions";
import type { Deposit } from "./ResourceDefinitions";
import type { Tech } from "./TechDefinitions";

export interface ITechDefinition {
   name: () => string;
   unlockBuilding?: Building[];
   revealDeposit?: Deposit[];
   buildingMultiplier?: Partial<Record<Building, Multiplier>>;
   globalMultiplier?: Partial<Record<keyof GlobalMultipliers, number>>;
   additionalUpgrades?: Array<() => string>;
   requireTech: Tech[];
   column: number;
}

export interface ITechAgeDefinition {
   idx: number;
   from: number;
   to: number;
   name: () => string;
   color: number;
}
