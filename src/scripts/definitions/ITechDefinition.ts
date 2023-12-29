import type { GlobalMultipliers, Multiplier } from "../logic/TickLogic";
import type { Building } from "./BuildingDefinitions";
import type { Deposit } from "./ResourceDefinitions";
import type { RomeProvince } from "./RomeProvinceDefinitions";
import type { Tech } from "./TechDefinitions";

export interface IUnlockableDefinition {
   name: () => string;
   unlockBuilding?: Building[];
   revealDeposit?: Deposit[];
   buildingMultiplier?: Partial<Record<Building, Multiplier>>;
   globalMultiplier?: Partial<Record<keyof GlobalMultipliers, number>>;
   additionalUpgrades?: Array<() => string>;
}

export interface ITechDefinition extends IUnlockableDefinition {
   requireTech: Tech[];
   requireProvince?: RomeProvince[];
   column: number;
}

export interface ITechAgeDefinition {
   idx: number;
   from: number;
   to: number;
   name: () => string;
}
