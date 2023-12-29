import { GlobalMultipliers, Multiplier } from "../logic/TickLogic";
import { Building } from "./BuildingDefinitions";
import { Deposit } from "./ResourceDefinitions";
import { RomeProvince } from "./RomeProvinceDefinitions";
import { Tech } from "./TechDefinitions";

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
