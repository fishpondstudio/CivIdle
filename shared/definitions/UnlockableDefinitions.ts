import type { GlobalMultipliers, Multiplier } from "../logic/TickLogic";
import { deepFreeze } from "../utilities/Helper";
import type { PartialTabulate } from "../utilities/TypeDefinitions";
import { L, t } from "../utilities/i18n";
import { BuildingDefinitions, type Building } from "./BuildingDefinitions";
import type { Resource } from "./ResourceDefinitions";

export interface IUnlockableDefinition {
   name: () => string;
   desc?: () => string;
   requireResources: PartialTabulate<Resource>;
   unlockBuilding?: Building[];
   buildingMultiplier?: Partial<Record<Building, Multiplier>>;
   globalMultiplier?: Partial<Record<keyof GlobalMultipliers, number>>;
}

const Buildings = deepFreeze(new BuildingDefinitions());

export class UnlockableDefinitions {
   Cultivation1: IUnlockableDefinition = {
      name: () => t(L.CultivationLevelX, { level: 1 }),
      requireResources: {},
      buildingMultiplier: {
         Aqueduct: { output: 1 },
      },
   };
   Cultivation2: IUnlockableDefinition = {
      name: () => t(L.CultivationLevelX, { level: 2 }),
      requireResources: Buildings.PaperMaker.input,
      buildingMultiplier: {
         Aqueduct: { output: 1 },
         PaperMaker: { output: 1 },
      },
   };
   Cultivation3: IUnlockableDefinition = {
      name: () => t(L.CultivationLevelX, { level: 3 }),
      requireResources: Buildings.Library.input,
      buildingMultiplier: {
         Aqueduct: { output: 1 },
         PaperMaker: { output: 1 },
         Library: { output: 1 },
      },
   };
   Cultivation4: IUnlockableDefinition = {
      name: () => t(L.CultivationLevelX, { level: 4 }),
      requireResources: Buildings.School.input,
      buildingMultiplier: {
         Aqueduct: { output: 1 },
         PaperMaker: { output: 1 },
         Library: { output: 1 },
         School: { output: 1 },
      },
   };

   Commerce1: IUnlockableDefinition = {
      name: () => t(L.CommerceLevelX, { level: 1 }),
      requireResources: {},
      buildingMultiplier: {
         StoneQuarry: { output: 1 },
      },
   };
   Commerce2: IUnlockableDefinition = {
      name: () => t(L.CommerceLevelX, { level: 2 }),
      requireResources: Buildings.Brickworks.input,
      buildingMultiplier: {
         StoneQuarry: { output: 1 },
         Brickworks: { output: 1 },
      },
   };
   Commerce3: IUnlockableDefinition = {
      name: () => t(L.CommerceLevelX, { level: 3 }),
      requireResources: Buildings.GoldMiningCamp.input,
      buildingMultiplier: {
         StoneQuarry: { output: 1 },
         Brickworks: { output: 1 },
         GoldMiningCamp: { output: 1 },
      },
   };
   Commerce4: IUnlockableDefinition = {
      name: () => t(L.CommerceLevelX, { level: 4 }),
      requireResources: Buildings.CoinMint.input,
      buildingMultiplier: {
         StoneQuarry: { output: 1 },
         Brickworks: { output: 1 },
         GoldMiningCamp: { output: 1 },
         CoinMint: { output: 1 },
      },
   };

   Honor1: IUnlockableDefinition = {
      name: () => t(L.HonorLevelX, { level: 1 }),
      requireResources: {},
      buildingMultiplier: {
         LoggingCamp: { output: 1 },
      },
   };
   Honor2: IUnlockableDefinition = {
      name: () => t(L.HonorLevelX, { level: 2 }),
      requireResources: Buildings.LumberMill.input,
      buildingMultiplier: {
         LoggingCamp: { output: 1 },
         LumberMill: { output: 1 },
      },
   };
   Honor3: IUnlockableDefinition = {
      name: () => t(L.HonorLevelX, { level: 3 }),
      requireResources: Buildings.SiegeWorkshop.input,
      buildingMultiplier: {
         LoggingCamp: { output: 1 },
         LumberMill: { output: 1 },
         SiegeWorkshop: { output: 1 },
      },
   };
   Honor4: IUnlockableDefinition = {
      name: () => t(L.HonorLevelX, { level: 4 }),
      requireResources: Buildings.KnightCamp.input,
      buildingMultiplier: {
         LoggingCamp: { output: 1 },
         LumberMill: { output: 1 },
         SiegeWorkshop: { output: 1 },
         KnightCamp: { output: 1 },
      },
   };

   Expansion1: IUnlockableDefinition = {
      name: () => t(L.ExpansionLevelX, { level: 1 }),
      requireResources: {},
      buildingMultiplier: {
         WheatFarm: { output: 1 },
      },
   };
   Expansion2: IUnlockableDefinition = {
      name: () => t(L.ExpansionLevelX, { level: 2 }),
      requireResources: Buildings.FlourMill.input,
      buildingMultiplier: {
         WheatFarm: { output: 1 },
         FlourMill: { output: 1 },
      },
   };
   Expansion3: IUnlockableDefinition = {
      name: () => t(L.ExpansionLevelX, { level: 3 }),
      requireResources: Buildings.Bakery.input,
      buildingMultiplier: {
         WheatFarm: { output: 1 },
         FlourMill: { output: 1 },
         Bakery: { output: 1 },
      },
   };
   Expansion4: IUnlockableDefinition = {
      name: () => t(L.ExpansionLevelX, { level: 4 }),
      requireResources: Buildings.Apartment.input,
      buildingMultiplier: {
         WheatFarm: { output: 1 },
         FlourMill: { output: 1 },
         Bakery: { output: 1 },
         Apartment: { output: 1 },
      },
   };
}

export type Unlockable = keyof UnlockableDefinitions;
