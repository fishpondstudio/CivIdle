import { Config } from "../logic/Config";
import { getBuildingsByType } from "../logic/IntraTickCache";
import {
   getGreatPeopleChoiceCount,
   getGreatPersonTotalEffect,
   rollGreatPeopleThisRun,
} from "../logic/RebirthLogic";
import { RequestChooseGreatPerson } from "../logic/Update";
import { deepFreeze } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { BuildingDefinitions } from "./BuildingDefinitions";
import { GreatPersonDefinitions } from "./GreatPersonDefinitions";
import type { IUpgradeDefinition } from "./ITechDefinition";

const Buildings = deepFreeze(new BuildingDefinitions());
const GreatPerson = deepFreeze(new GreatPersonDefinitions());

export class UpgradeDefinitions {
   Cultivation1: IUpgradeDefinition = {
      name: () => t(L.CultivationLevelX, { level: "I" }),
      requireResources: {},
      buildingMultiplier: {
         Aqueduct: { output: 1 },
      },
   };
   Cultivation2: IUpgradeDefinition = {
      name: () => t(L.CultivationLevelX, { level: "II" }),
      requireResources: Buildings.PaperMaker.input,
      buildingMultiplier: {
         Aqueduct: { output: 1 },
         PaperMaker: { output: 1 },
      },
   };
   Cultivation3: IUpgradeDefinition = {
      name: () => t(L.CultivationLevelX, { level: "III" }),
      requireResources: Buildings.Library.input,
      buildingMultiplier: {
         Aqueduct: { output: 1 },
         PaperMaker: { output: 1 },
         Library: { output: 1 },
      },
   };
   Cultivation4: IUpgradeDefinition = {
      name: () => t(L.CultivationLevelX, { level: "IV" }),
      requireResources: Buildings.School.input,
      buildingMultiplier: {
         Aqueduct: { output: 1 },
         PaperMaker: { output: 1 },
         Library: { output: 1 },
         School: { output: 1 },
      },
      additionalUpgrades: () => [t(L.Cultivation4UpgradeHTML)],
      onUnlocked: (gs) => {
         const candidates = rollGreatPeopleThisRun("RenaissanceAge", gs.city, getGreatPeopleChoiceCount(gs));
         if (candidates) {
            gs.greatPeopleChoices.push(candidates);
         }
         RequestChooseGreatPerson.emit({ permanent: false });
      },
   };

   Commerce1: IUpgradeDefinition = {
      name: () => t(L.CommerceLevelX, { level: "I" }),
      requireResources: {},
      buildingMultiplier: {
         StoneQuarry: { output: 1 },
      },
   };
   Commerce2: IUpgradeDefinition = {
      name: () => t(L.CommerceLevelX, { level: "II" }),
      requireResources: Buildings.Brickworks.input,
      buildingMultiplier: {
         StoneQuarry: { output: 1 },
         Brickworks: { output: 1 },
      },
   };
   Commerce3: IUpgradeDefinition = {
      name: () => t(L.CommerceLevelX, { level: "III" }),
      requireResources: Buildings.GoldMiningCamp.output,
      buildingMultiplier: {
         StoneQuarry: { output: 1 },
         Brickworks: { output: 1 },
         GoldMiningCamp: { output: 1 },
      },
   };
   Commerce4: IUpgradeDefinition = {
      name: () => t(L.CommerceLevelX, { level: "IV" }),
      requireResources: Buildings.CoinMint.input,
      buildingMultiplier: {
         StoneQuarry: { output: 1 },
         Brickworks: { output: 1 },
         GoldMiningCamp: { output: 1 },
         CoinMint: { output: 1 },
      },
      additionalUpgrades: () => [t(L.Commerce4UpgradeHTML)],
      onUnlocked: (gs) => {
         getBuildingsByType("Bank", gs)?.forEach((tile) => {
            if (tile.building.status === "completed" && tile.building.level < 30) {
               tile.building.level = 30;
            }
         });
      },
   };

   Honor1: IUpgradeDefinition = {
      name: () => t(L.HonorLevelX, { level: "I" }),
      requireResources: {},
      buildingMultiplier: {
         LoggingCamp: { output: 1 },
      },
   };
   Honor2: IUpgradeDefinition = {
      name: () => t(L.HonorLevelX, { level: "II" }),
      requireResources: Buildings.LumberMill.input,
      buildingMultiplier: {
         LoggingCamp: { output: 1 },
         LumberMill: { output: 1 },
      },
   };
   Honor3: IUpgradeDefinition = {
      name: () => t(L.HonorLevelX, { level: "III" }),
      requireResources: Buildings.SiegeWorkshop.input,
      buildingMultiplier: {
         LoggingCamp: { output: 1 },
         LumberMill: { output: 1 },
         SiegeWorkshop: { output: 1 },
      },
   };
   Honor4: IUpgradeDefinition = {
      name: () => t(L.HonorLevelX, { level: "IV" }),
      requireResources: Buildings.KnightCamp.input,
      buildingMultiplier: {
         LoggingCamp: { output: 1 },
         LumberMill: { output: 1 },
         SiegeWorkshop: { output: 1 },
         KnightCamp: { output: 1 },
      },
      additionalUpgrades: () => [t(L.Honor4UpgradeHTML)],
      tick: (gs) => {
         const total = getGreatPersonTotalEffect("ZhengHe", gs);
         if (total > 0) {
            const def = Config.GreatPerson.ZhengHe;
            def.tick(def, total, t(L.ExpansionLevelX, { level: "IV" }));
         }
      },
   };

   Expansion1: IUpgradeDefinition = {
      name: () => t(L.ExpansionLevelX, { level: "I" }),
      requireResources: {},
      buildingMultiplier: {
         WheatFarm: { output: 1 },
      },
   };
   Expansion2: IUpgradeDefinition = {
      name: () => t(L.ExpansionLevelX, { level: "II" }),
      requireResources: Buildings.FlourMill.input,
      buildingMultiplier: {
         WheatFarm: { output: 1 },
         FlourMill: { output: 1 },
      },
   };
   Expansion3: IUpgradeDefinition = {
      name: () => t(L.ExpansionLevelX, { level: "III" }),
      requireResources: Buildings.Bakery.input,
      buildingMultiplier: {
         WheatFarm: { output: 1 },
         FlourMill: { output: 1 },
         Bakery: { output: 1 },
      },
   };
   Expansion4: IUpgradeDefinition = {
      name: () => t(L.ExpansionLevelX, { level: "IV" }),
      requireResources: Buildings.Apartment.input,
      buildingMultiplier: {
         WheatFarm: { output: 1 },
         FlourMill: { output: 1 },
         Bakery: { output: 1 },
         Apartment: { output: 1 },
      },
      globalMultiplier: { sciencePerBusyWorker: 1, sciencePerIdleWorker: 1 },
   };
}

export type Upgrade = keyof UpgradeDefinitions;
