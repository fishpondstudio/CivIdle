import { GlobalMultipliers, IModifier, Multiplier } from "../logic/TickLogic";
import { Building } from "./BuildingDefinitions";
import { Feature } from "./FeatureDefinitions";
import { Deposit, Resource } from "./ResourceDefinitions";
import { PartialTabulate } from "./TypeDefinitions";

export interface IUnlockableDefinition {
   name: () => string;
   require: string[];
   unlockFeature?: Feature[];
   unlockBuilding?: Building[];
   revealDeposit?: Deposit[];
   buildingModifier?: Partial<Record<Building, IModifier>>;
   buildingMultiplier?: Partial<Record<Building, Multiplier>>;
   globalMultiplier?: Partial<Record<keyof GlobalMultipliers, number>>;
   additionalUpgrades?: Array<() => string>;
}

export interface ITechDefinition extends IUnlockableDefinition {
   column: number;
}

export interface ITechAgeDefinition {
   from: number;
   to: number;
   name: () => string;
}

export interface IUnlockableGroup<T extends Record<string, IUnlockableDefinition>> {
   definitions: T;
   unlockCost: (key: keyof T) => PartialTabulate<Resource>;
   verb: () => string;
}

export interface ITechTree extends IUnlockableGroup<Record<string, ITechDefinition>> {
   ages: Record<string, ITechAgeDefinition>;
}
