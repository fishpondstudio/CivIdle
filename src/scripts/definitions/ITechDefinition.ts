import { GlobalMultipliers, IModifier, Multiplier } from "../logic/TickLogic";
import { Building } from "./BuildingDefinitions";
import { Feature } from "./FeatureDefinitions";
import { Deposit } from "./ResourceDefinitions";
import { RomeProvince } from "./RomeProvinceDefinitions";
import { Tech } from "./TechDefinitions";

export interface IUnlockableDefinition {
   name: () => string;
   unlockFeature?: Feature[];
   unlockBuilding?: Building[];
   revealDeposit?: Deposit[];
   buildingModifier?: Partial<Record<Building, IModifier>>;
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
   from: number;
   to: number;
   name: () => string;
}
