import type { GameState } from "../logic/GameState";
import type { GlobalMultipliers, Multiplier } from "../logic/TickLogic";
import type { PartialTabulate } from "../utilities/TypeDefinitions";
import type { Building } from "./BuildingDefinitions";
import type { Deposit, Resource } from "./ResourceDefinitions";
import type { Tech } from "./TechDefinitions";

export interface ITechDefinition extends IUnlockable {
   revealDeposit?: Deposit[];
   requireTech: Tech[];
   column: number;
}

export interface IUpgradeDefinition extends IUnlockable {
   requireResources: PartialTabulate<Resource>;
}

export interface IUnlockable {
   name: () => string;
   unlockBuilding?: Building[];
   buildingMultiplier?: Partial<Record<Building, Multiplier>>;
   globalMultiplier?: Partial<Record<keyof GlobalMultipliers, number>>;
   additionalUpgrades?: () => string[];
   tick?: (gs: GameState) => void;
   onUnlocked?: (gs: GameState) => void;
}

export interface ITechAgeDefinition {
   idx: number;
   from: number;
   to: number;
   name: () => string;
   color: number;
}
