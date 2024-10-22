import { findSpecialBuilding } from "../logic/BuildingLogic";
import { Config } from "../logic/Config";
import { getGrid } from "../logic/IntraTickCache";
import {
   getGreatPeopleChoiceCount,
   getGreatPersonTotalEffect,
   rollGreatPeopleThisRun,
} from "../logic/RebirthLogic";
import { getTechUnlockCost, getTechUnlockCostInAge } from "../logic/TechLogic";
import { RequestChooseGreatPerson, addMultiplier } from "../logic/Update";
import { deepFreeze, forEach, pointToTile, safeAdd, tileToPoint } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { BuildingDefinitions } from "./BuildingDefinitions";
import { GreatPersonTickFlag } from "./GreatPersonDefinitions";
import type { IUpgradeDefinition } from "./ITechDefinition";
import type { Tech } from "./TechDefinitions";

const Buildings = deepFreeze(new BuildingDefinitions());

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
            gs.greatPeopleChoicesV2.push(candidates);
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
      additionalUpgrades: () => [t(L.Commerce4UpgradeHTMLV2)],
      onUnlocked: (gs) => {
         const cz = findSpecialBuilding("ChoghaZanbil", gs);
         if (!cz) return;
         for (const point of getGrid(gs).getNeighbors(tileToPoint(cz.tile))) {
            const building = gs.tiles.get(pointToTile(point))?.building;
            if (
               building &&
               building.type === "Bank" &&
               building.status === "completed" &&
               building.level < 30
            ) {
               building.level = 30;
            }
         }
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
            def.tick(def, total, t(L.ExpansionLevelX, { level: "IV" }), GreatPersonTickFlag.None);
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

   Christianity1: IUpgradeDefinition = {
      name: () => t(L.ChristianityLevelX, { level: "I" }),
      requireResources: {},
      unlockBuilding: ["Church"],
      tech: "Religion",
   };

   Christianity2: IUpgradeDefinition = {
      name: () => t(L.ChristianityLevelX, { level: "II" }),
      requireResources: { Faith: 1 },
      unlockBuilding: ["StPetersBasilica"],
      buildingMultiplier: {
         Church: { output: 1 },
      },
      tech: "HolyEmpire",
   };

   Christianity3: IUpgradeDefinition = {
      name: () => t(L.ChristianityLevelX, { level: "III" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Church: { output: 1 },
         KnightCamp: { output: 1 },
      },
   };

   Christianity4: IUpgradeDefinition = {
      name: () => t(L.ChristianityLevelX, { level: "IV" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Church: { output: 1 },
         KnightCamp: { output: 1 },
         Bank: { output: 1 },
      },
   };

   Christianity5: IUpgradeDefinition = {
      name: () => t(L.ChristianityLevelX, { level: "V" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Church: { output: 1 },
         KnightCamp: { output: 1 },
         Bank: { output: 1 },
      },
      globalMultiplier: {
         builderCapacity: 2,
      },
   };

   Islam1: IUpgradeDefinition = {
      name: () => t(L.IslamLevelX, { level: "I" }),
      requireResources: {},
      unlockBuilding: ["Mosque"],
      tech: "Religion",
   };

   Islam2: IUpgradeDefinition = {
      name: () => t(L.IslamLevelX, { level: "II" }),
      requireResources: { Faith: 1 },
      unlockBuilding: ["ProphetsMosque"],
      buildingMultiplier: {
         Mosque: { output: 1 },
      },
      tech: "HolyEmpire",
   };

   Islam3: IUpgradeDefinition = {
      name: () => t(L.IslamLevelX, { level: "III" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Mosque: { output: 1 },
         CaravelBuilder: { output: 1 },
      },
   };

   Islam4: IUpgradeDefinition = {
      name: () => t(L.IslamLevelX, { level: "IV" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Mosque: { output: 1 },
         CaravelBuilder: { output: 1 },
         Museum: { output: 1 },
      },
   };

   Islam5: IUpgradeDefinition = {
      name: () => t(L.IslamLevelX, { level: "V" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Mosque: { output: 1 },
         CaravelBuilder: { output: 1 },
         Museum: { output: 1 },
      },
      onUnlocked: (gs) => {
         const column = Config.TechAge.IndustrialAge.to;
         let tech: Tech;
         for (tech in Config.Tech) {
            if (Config.Tech[tech].column === column) {
               const hq = findSpecialBuilding("Headquarter", gs);
               if (hq) {
                  safeAdd(hq.building.resources, "Science", getTechUnlockCost(tech));
               }
               return;
            }
         }
      },
      additionalUpgrades: () => [t(L.Islam5UpgradeHTML)],
   };

   Buddhism1: IUpgradeDefinition = {
      name: () => t(L.BuddhismLevelX, { level: "I" }),
      requireResources: {},
      unlockBuilding: ["Pagoda"],
      tech: "Religion",
   };

   Buddhism2: IUpgradeDefinition = {
      name: () => t(L.BuddhismLevelX, { level: "II" }),
      requireResources: { Faith: 1 },
      unlockBuilding: ["GreatDagonPagoda"],
      buildingMultiplier: {
         Pagoda: { output: 1 },
      },
      tech: "HolyEmpire",
   };

   Buddhism3: IUpgradeDefinition = {
      name: () => t(L.BuddhismLevelX, { level: "III" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Pagoda: { output: 1 },
         CoinMint: { output: 1 },
      },
   };

   Buddhism4: IUpgradeDefinition = {
      name: () => t(L.BuddhismLevelX, { level: "IV" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Pagoda: { output: 1 },
         CoinMint: { output: 1 },
         GunpowderMill: { output: 1 },
      },
   };

   Buddhism5: IUpgradeDefinition = {
      name: () => t(L.BuddhismLevelX, { level: "V" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Pagoda: { output: 1 },
         CoinMint: { output: 1 },
         GunpowderMill: { output: 1 },
      },
      globalMultiplier: { happiness: 10 },
   };

   Polytheism1: IUpgradeDefinition = {
      name: () => t(L.PolytheismLevelX, { level: "I" }),
      requireResources: {},
      buildingMultiplier: {
         Shrine: { output: 1 },
      },
   };

   Polytheism2: IUpgradeDefinition = {
      name: () => t(L.PolytheismLevelX, { level: "II" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Shrine: { output: 1 },
      },
      unlockBuilding: ["Pantheon"],
      tech: "HolyEmpire",
   };

   Polytheism3: IUpgradeDefinition = {
      name: () => t(L.PolytheismLevelX, { level: "III" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Shrine: { output: 1 },
         School: { output: 1 },
      },
   };

   Polytheism4: IUpgradeDefinition = {
      name: () => t(L.PolytheismLevelX, { level: "IV" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Shrine: { output: 1 },
         School: { output: 1 },
         PrintingHouse: { output: 1 },
      },
   };

   Polytheism5: IUpgradeDefinition = {
      name: () => t(L.PolytheismLevelX, { level: "V" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Shrine: { output: 1 },
         School: { output: 1 },
         PrintingHouse: { output: 1 },
      },
      globalMultiplier: { sciencePerBusyWorker: 2 },
   };

   Liberalism1: IUpgradeDefinition = {
      name: () => t(L.LiberalismLevelX, { level: "I" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         BondMarket: { output: 1 },
      },
   };

   Liberalism2: IUpgradeDefinition = {
      name: () => t(L.LiberalismLevelX, { level: "II" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         BondMarket: { output: 1 },
         Warehouse: { storage: 1 },
         Caravansary: { storage: 1 },
      },
   };

   Liberalism3: IUpgradeDefinition = {
      name: () => t(L.LiberalismLevelX, { level: "III" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         BondMarket: { output: 1 },
         Warehouse: { storage: 1 },
         Caravansary: { storage: 1 },
      },
      additionalUpgrades: () => [t(L.LiberalismLevel3DescHTML)],
   };

   Liberalism4: IUpgradeDefinition = {
      name: () => t(L.LiberalismLevelX, { level: "IV" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         BondMarket: { output: 1 },
         Warehouse: { storage: 1 },
         Caravansary: { storage: 1 },
      },
      tick: () => {
         forEach(Config.Building, (b, def) => {
            if (def.output.Power) {
               addMultiplier(b, { output: 1 }, t(L.LiberalismLevelX, { level: "IV" }));
            }
         });
      },
   };

   Liberalism5: IUpgradeDefinition = {
      name: () => t(L.LiberalismLevelX, { level: "V" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         BondMarket: { output: 1 },
         StockExchange: { output: 1 },
         Warehouse: { storage: 1 },
         Caravansary: { storage: 1 },
      },
      additionalUpgrades: () => [t(L.LiberalismLevel5DescHTML)],
   };

   Conservatism1: IUpgradeDefinition = {
      name: () => t(L.ConservatismLevelX, { level: "I" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         LocomotiveFactory: { output: 1 },
      },
   };

   Conservatism2: IUpgradeDefinition = {
      name: () => t(L.ConservatismLevelX, { level: "II" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         LocomotiveFactory: { output: 1 },
      },
      globalMultiplier: { happiness: 2 },
   };

   Conservatism3: IUpgradeDefinition = {
      name: () => t(L.ConservatismLevelX, { level: "III" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         LocomotiveFactory: { output: 1 },
         Stadium: { output: 1 },
      },
      globalMultiplier: { happiness: 3 },
   };

   Conservatism4: IUpgradeDefinition = {
      name: () => t(L.ConservatismLevelX, { level: "IV" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         LocomotiveFactory: { output: 1 },
         Stadium: { output: 1 },
         MovieStudio: { output: 1 },
      },
      globalMultiplier: { happiness: 4 },
   };

   Conservatism5: IUpgradeDefinition = {
      name: () => t(L.ConservatismLevelX, { level: "V" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         LocomotiveFactory: { output: 1 },
         Stadium: { output: 1 },
         MovieStudio: { output: 1 },
         RadioStation: { output: 1 },
      },
      globalMultiplier: { happiness: 5 },
   };

   Socialism1: IUpgradeDefinition = {
      name: () => t(L.SocialismLevelX, { level: "I" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         PublishingHouse: { output: 1 },
      },
   };

   Socialism2: IUpgradeDefinition = {
      name: () => t(L.SocialismLevelX, { level: "II" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         PublishingHouse: { output: 1 },
         MagazinePublisher: { output: 1 },
      },
   };

   Socialism3: IUpgradeDefinition = {
      name: () => t(L.SocialismLevelX, { level: "III" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         PublishingHouse: { output: 1 },
         MagazinePublisher: { output: 1 },
         ResearchLab: { output: 1 },
      },
   };

   Socialism4: IUpgradeDefinition = {
      name: () => t(L.SocialismLevelX, { level: "IV" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         PublishingHouse: { output: 1 },
         MagazinePublisher: { output: 1 },
         ResearchLab: { output: 1 },
      },
      onUnlocked: (gs) => {
         const [science, _] = getTechUnlockCostInAge("WorldWarAge");
         const hq = findSpecialBuilding("Headquarter", gs);
         if (hq) {
            safeAdd(hq.building.resources, "Science", science);
         }
      },
      additionalUpgrades: () => [t(L.SocialismLevel4DescHTMLV2)],
   };

   Socialism5: IUpgradeDefinition = {
      name: () => t(L.SocialismLevelX, { level: "V" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         PublishingHouse: { output: 1 },
         MagazinePublisher: { output: 1 },
         ResearchLab: { output: 1 },
      },
      onUnlocked: (gs) => {
         const [science, _] = getTechUnlockCostInAge("ColdWarAge");
         const hq = findSpecialBuilding("Headquarter", gs);
         if (hq) {
            safeAdd(hq.building.resources, "Science", science);
         }
      },
      additionalUpgrades: () => [t(L.SocialismLevel5DescHTMLV2)],
   };

   Communism1: IUpgradeDefinition = {
      name: () => t(L.CommunismLevelX, { level: "I" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         GatlingGunFactory: { output: 1 },
      },
   };

   Communism2: IUpgradeDefinition = {
      name: () => t(L.CommunismLevelX, { level: "II" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         GatlingGunFactory: { output: 1 },
      },
      globalMultiplier: {
         sciencePerBusyWorker: 1,
      },
   };

   Communism3: IUpgradeDefinition = {
      name: () => t(L.CommunismLevelX, { level: "III" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         GatlingGunFactory: { output: 1 },
         IroncladBuilder: { output: 1 },
      },
      globalMultiplier: {
         sciencePerBusyWorker: 1,
      },
   };

   Communism4: IUpgradeDefinition = {
      name: () => t(L.CommunismLevelX, { level: "IV" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         GatlingGunFactory: { output: 1 },
         IroncladBuilder: { output: 1 },
         BiplaneFactory: { output: 1 },
      },
      globalMultiplier: {
         sciencePerBusyWorker: 1,
      },
      onUnlocked: (gs) => {
         const candidates1 = rollGreatPeopleThisRun("IndustrialAge", gs.city, getGreatPeopleChoiceCount(gs));
         if (candidates1) {
            gs.greatPeopleChoicesV2.push(candidates1);
         }
         const candidates2 = rollGreatPeopleThisRun("WorldWarAge", gs.city, getGreatPeopleChoiceCount(gs));
         if (candidates2) {
            gs.greatPeopleChoicesV2.push(candidates2);
         }
      },
      additionalUpgrades: () => [t(L.CommunismLevel4DescHTML)],
   };

   Communism5: IUpgradeDefinition = {
      name: () => t(L.CommunismLevelX, { level: "V" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         GatlingGunFactory: { output: 1 },
         IroncladBuilder: { output: 1 },
         BiplaneFactory: { output: 1 },
      },
      onUnlocked: (gs) => {
         const candidates = rollGreatPeopleThisRun("ColdWarAge", gs.city, getGreatPeopleChoiceCount(gs));
         if (candidates) {
            gs.greatPeopleChoicesV2.push(candidates);
         }
      },
      additionalUpgrades: () => [t(L.CommunismLevel5DescHTML)],
   };
}

export type Upgrade = keyof UpgradeDefinitions;
export type IUpgradeGroup = { name: () => string; content: Upgrade[] };
