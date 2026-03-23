import { findSpecialBuildingCached } from "../logic/BuildingLogic";
import { Config } from "../logic/Config";
import { getGrid } from "../logic/IntraTickCache";
import {
   getGreatPeopleChoiceCount,
   getGreatPersonTotalLevel,
   rollGreatPeopleThisRun,
} from "../logic/RebirthLogic";
import { getCurrentAge, getTechUnlockCost, getTechUnlockCostInAge } from "../logic/TechLogic";
import { Tick } from "../logic/TickLogic";
import { RequestChooseGreatPerson, addMultiplier } from "../logic/Update";
import { deepFreeze, forEach, formatPercent, pointToTile, safeAdd, tileToPoint } from "../utilities/Helper";
import { $t, L } from "../utilities/i18n";
import { BuildingDefinitions } from "./BuildingDefinitions";
import { GreatPersonTickFlag } from "./GreatPersonDefinitions";
import type { IUpgradeDefinition } from "./ITechDefinition";
import type { Tech } from "./TechDefinitions";

const Buildings = deepFreeze(new BuildingDefinitions());

export class UpgradeDefinitions {
   Cultivation1: IUpgradeDefinition = {
      name: () => $t(L.CultivationLevelX, { level: "I" }),
      requireResources: {},
      buildingMultiplier: {
         Aqueduct: { output: 1 },
      },
   };
   Cultivation2: IUpgradeDefinition = {
      name: () => $t(L.CultivationLevelX, { level: "II" }),
      requireResources: Buildings.PaperMaker.input,
      buildingMultiplier: {
         Aqueduct: { output: 1 },
         PaperMaker: { output: 1 },
      },
   };
   Cultivation3: IUpgradeDefinition = {
      name: () => $t(L.CultivationLevelX, { level: "III" }),
      requireResources: Buildings.Library.input,
      buildingMultiplier: {
         Aqueduct: { output: 1 },
         PaperMaker: { output: 1 },
         Library: { output: 1 },
      },
   };
   Cultivation4: IUpgradeDefinition = {
      name: () => $t(L.CultivationLevelX, { level: "IV" }),
      requireResources: Buildings.School.input,
      buildingMultiplier: {
         Aqueduct: { output: 1 },
         PaperMaker: { output: 1 },
         Library: { output: 1 },
         School: { output: 1 },
      },
      additionalUpgrades: () => [$t(L.Cultivation4UpgradeHTML)],
      onUnlocked: (gs) => {
         const candidates = rollGreatPeopleThisRun(
            new Set(["RenaissanceAge"]),
            gs.city,
            getGreatPeopleChoiceCount(gs),
         );
         if (candidates) {
            gs.greatPeopleChoicesV2.push(candidates);
         }
         RequestChooseGreatPerson.emit({ permanent: false });
      },
   };

   Commerce1: IUpgradeDefinition = {
      name: () => $t(L.CommerceLevelX, { level: "I" }),
      requireResources: {},
      buildingMultiplier: {
         StoneQuarry: { output: 1 },
      },
   };
   Commerce2: IUpgradeDefinition = {
      name: () => $t(L.CommerceLevelX, { level: "II" }),
      requireResources: Buildings.Brickworks.input,
      buildingMultiplier: {
         StoneQuarry: { output: 1 },
         Brickworks: { output: 1 },
      },
   };
   Commerce3: IUpgradeDefinition = {
      name: () => $t(L.CommerceLevelX, { level: "III" }),
      requireResources: Buildings.GoldMiningCamp.output,
      buildingMultiplier: {
         StoneQuarry: { output: 1 },
         Brickworks: { output: 1 },
         GoldMiningCamp: { output: 1 },
      },
   };
   Commerce4: IUpgradeDefinition = {
      name: () => $t(L.CommerceLevelX, { level: "IV" }),
      requireResources: Buildings.CoinMint.input,
      buildingMultiplier: {
         StoneQuarry: { output: 1 },
         Brickworks: { output: 1 },
         GoldMiningCamp: { output: 1 },
         CoinMint: { output: 1 },
      },
      additionalUpgrades: () => [$t(L.Commerce4UpgradeHTMLV2)],
      onUnlocked: (gs) => {
         const cz = findSpecialBuildingCached("ChoghaZanbil", gs);
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
      name: () => $t(L.HonorLevelX, { level: "I" }),
      requireResources: {},
      buildingMultiplier: {
         LoggingCamp: { output: 1 },
      },
   };
   Honor2: IUpgradeDefinition = {
      name: () => $t(L.HonorLevelX, { level: "II" }),
      requireResources: Buildings.LumberMill.input,
      buildingMultiplier: {
         LoggingCamp: { output: 1 },
         LumberMill: { output: 1 },
      },
   };
   Honor3: IUpgradeDefinition = {
      name: () => $t(L.HonorLevelX, { level: "III" }),
      requireResources: Buildings.SiegeWorkshop.input,
      buildingMultiplier: {
         LoggingCamp: { output: 1 },
         LumberMill: { output: 1 },
         SiegeWorkshop: { output: 1 },
      },
   };
   Honor4: IUpgradeDefinition = {
      name: () => $t(L.HonorLevelX, { level: "IV" }),
      requireResources: Buildings.KnightCamp.input,
      buildingMultiplier: {
         LoggingCamp: { output: 1 },
         LumberMill: { output: 1 },
         SiegeWorkshop: { output: 1 },
         KnightCamp: { output: 1 },
      },
      additionalUpgrades: () => [$t(L.Honor4UpgradeHTML)],
      tick: (gs) => {
         const total = getGreatPersonTotalLevel("ZhengHe", gs);
         if (total > 0) {
            const def = Config.GreatPerson.ZhengHe;
            def.tick("ZhengHe", total, $t(L.ExpansionLevelX, { level: "IV" }), GreatPersonTickFlag.None);
         }
      },
   };

   Expansion1: IUpgradeDefinition = {
      name: () => $t(L.ExpansionLevelX, { level: "I" }),
      requireResources: {},
      buildingMultiplier: {
         WheatFarm: { output: 1 },
      },
   };
   Expansion2: IUpgradeDefinition = {
      name: () => $t(L.ExpansionLevelX, { level: "II" }),
      requireResources: Buildings.FlourMill.input,
      buildingMultiplier: {
         WheatFarm: { output: 1 },
         FlourMill: { output: 1 },
      },
   };
   Expansion3: IUpgradeDefinition = {
      name: () => $t(L.ExpansionLevelX, { level: "III" }),
      requireResources: Buildings.Bakery.input,
      buildingMultiplier: {
         WheatFarm: { output: 1 },
         FlourMill: { output: 1 },
         Bakery: { output: 1 },
      },
   };
   Expansion4: IUpgradeDefinition = {
      name: () => $t(L.ExpansionLevelX, { level: "IV" }),
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
      name: () => $t(L.ChristianityLevelX, { level: "I" }),
      requireResources: {},
      unlockBuilding: ["Church"],
      tech: "Religion",
   };

   Christianity2: IUpgradeDefinition = {
      name: () => $t(L.ChristianityLevelX, { level: "II" }),
      requireResources: { Faith: 1 },
      unlockBuilding: ["StPetersBasilica"],
      buildingMultiplier: {
         Church: { output: 1 },
      },
      tech: "HolyEmpire",
   };

   Christianity3: IUpgradeDefinition = {
      name: () => $t(L.ChristianityLevelX, { level: "III" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Church: { output: 1 },
         KnightCamp: { output: 1 },
      },
   };

   Christianity4: IUpgradeDefinition = {
      name: () => $t(L.ChristianityLevelX, { level: "IV" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Church: { output: 1 },
         KnightCamp: { output: 1 },
         Bank: { output: 1 },
      },
   };

   Christianity5: IUpgradeDefinition = {
      name: () => $t(L.ChristianityLevelX, { level: "V" }),
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
      name: () => $t(L.IslamLevelX, { level: "I" }),
      requireResources: {},
      unlockBuilding: ["Mosque"],
      tech: "Religion",
   };

   Islam2: IUpgradeDefinition = {
      name: () => $t(L.IslamLevelX, { level: "II" }),
      requireResources: { Faith: 1 },
      unlockBuilding: ["ProphetsMosque"],
      buildingMultiplier: {
         Mosque: { output: 1 },
      },
      tech: "HolyEmpire",
   };

   Islam3: IUpgradeDefinition = {
      name: () => $t(L.IslamLevelX, { level: "III" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Mosque: { output: 1 },
         CaravelBuilder: { output: 1 },
      },
   };

   Islam4: IUpgradeDefinition = {
      name: () => $t(L.IslamLevelX, { level: "IV" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Mosque: { output: 1 },
         CaravelBuilder: { output: 1 },
         Museum: { output: 1 },
      },
   };

   Islam5: IUpgradeDefinition = {
      name: () => $t(L.IslamLevelX, { level: "V" }),
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
               const hq = findSpecialBuildingCached("Headquarter", gs);
               if (hq) {
                  safeAdd(hq.building.resources, "Science", getTechUnlockCost(tech, gs));
               }
               return;
            }
         }
      },
      additionalUpgrades: () => [$t(L.Islam5UpgradeHTML)],
   };

   Buddhism1: IUpgradeDefinition = {
      name: () => $t(L.BuddhismLevelX, { level: "I" }),
      requireResources: {},
      unlockBuilding: ["Pagoda"],
      tech: "Religion",
   };

   Buddhism2: IUpgradeDefinition = {
      name: () => $t(L.BuddhismLevelX, { level: "II" }),
      requireResources: { Faith: 1 },
      unlockBuilding: ["GreatDagonPagoda"],
      buildingMultiplier: {
         Pagoda: { output: 1 },
      },
      tech: "HolyEmpire",
   };

   Buddhism3: IUpgradeDefinition = {
      name: () => $t(L.BuddhismLevelX, { level: "III" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Pagoda: { output: 1 },
         CoinMint: { output: 1 },
      },
   };

   Buddhism4: IUpgradeDefinition = {
      name: () => $t(L.BuddhismLevelX, { level: "IV" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Pagoda: { output: 1 },
         CoinMint: { output: 1 },
         GunpowderMill: { output: 1 },
      },
   };

   Buddhism5: IUpgradeDefinition = {
      name: () => $t(L.BuddhismLevelX, { level: "V" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Pagoda: { output: 1 },
         CoinMint: { output: 1 },
         GunpowderMill: { output: 1 },
      },
      globalMultiplier: { happiness: 10 },
   };

   Polytheism1: IUpgradeDefinition = {
      name: () => $t(L.PolytheismLevelX, { level: "I" }),
      requireResources: {},
      buildingMultiplier: {
         Shrine: { output: 1 },
      },
   };

   Polytheism2: IUpgradeDefinition = {
      name: () => $t(L.PolytheismLevelX, { level: "II" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Shrine: { output: 1 },
      },
      unlockBuilding: ["Pantheon"],
      tech: "HolyEmpire",
   };

   Polytheism3: IUpgradeDefinition = {
      name: () => $t(L.PolytheismLevelX, { level: "III" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Shrine: { output: 1 },
         School: { output: 1 },
      },
   };

   Polytheism4: IUpgradeDefinition = {
      name: () => $t(L.PolytheismLevelX, { level: "IV" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Shrine: { output: 1 },
         School: { output: 1 },
         PrintingHouse: { output: 1 },
      },
   };

   Polytheism5: IUpgradeDefinition = {
      name: () => $t(L.PolytheismLevelX, { level: "V" }),
      requireResources: { Faith: 1 },
      buildingMultiplier: {
         Shrine: { output: 1 },
         School: { output: 1 },
         PrintingHouse: { output: 1 },
      },
      globalMultiplier: { sciencePerBusyWorker: 2 },
   };

   Liberalism1: IUpgradeDefinition = {
      name: () => $t(L.LiberalismLevelX, { level: "I" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         BondMarket: { output: 1 },
      },
   };

   Liberalism2: IUpgradeDefinition = {
      name: () => $t(L.LiberalismLevelX, { level: "II" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         BondMarket: { output: 1 },
         Warehouse: { storage: 1 },
         Caravansary: { storage: 1 },
      },
   };

   Liberalism3: IUpgradeDefinition = {
      name: () => $t(L.LiberalismLevelX, { level: "III" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         BondMarket: { output: 1 },
         Warehouse: { storage: 1 },
         Caravansary: { storage: 1 },
      },
      additionalUpgrades: () => [$t(L.LiberalismLevel3DescHTML)],
   };

   Liberalism4: IUpgradeDefinition = {
      name: () => $t(L.LiberalismLevelX, { level: "IV" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         BondMarket: { output: 1 },
         Warehouse: { storage: 1 },
         Caravansary: { storage: 1 },
      },
      tick: () => {
         forEach(Config.Building, (b, def) => {
            if (def.output.Power) {
               addMultiplier(b, { output: 1 }, $t(L.LiberalismLevelX, { level: "IV" }));
            }
         });
      },
      additionalUpgrades: () => [$t(L.LiberalismLevel4DescHTML)],
   };

   Liberalism5: IUpgradeDefinition = {
      name: () => $t(L.LiberalismLevelX, { level: "V" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         BondMarket: { output: 1 },
         StockExchange: { output: 1 },
         Warehouse: { storage: 1 },
         Caravansary: { storage: 1 },
      },
      additionalUpgrades: () => [$t(L.LiberalismLevel5DescHTMLV3)],
   };

   Conservatism1: IUpgradeDefinition = {
      name: () => $t(L.ConservatismLevelX, { level: "I" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         LocomotiveFactory: { output: 1 },
      },
   };

   Conservatism2: IUpgradeDefinition = {
      name: () => $t(L.ConservatismLevelX, { level: "II" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         LocomotiveFactory: { output: 1 },
      },
      globalMultiplier: { happiness: 2 },
   };

   Conservatism3: IUpgradeDefinition = {
      name: () => $t(L.ConservatismLevelX, { level: "III" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         LocomotiveFactory: { output: 1 },
         Stadium: { output: 1 },
      },
      globalMultiplier: { happiness: 3 },
   };

   Conservatism4: IUpgradeDefinition = {
      name: () => $t(L.ConservatismLevelX, { level: "IV" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         LocomotiveFactory: { output: 1 },
         Stadium: { output: 1 },
         MovieStudio: { output: 1 },
      },
      globalMultiplier: { happiness: 4 },
   };

   Conservatism5: IUpgradeDefinition = {
      name: () => $t(L.ConservatismLevelX, { level: "V" }),
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
      name: () => $t(L.SocialismLevelX, { level: "I" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         PublishingHouse: { output: 1 },
      },
   };

   Socialism2: IUpgradeDefinition = {
      name: () => $t(L.SocialismLevelX, { level: "II" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         PublishingHouse: { output: 1 },
         MagazinePublisher: { output: 1 },
      },
   };

   Socialism3: IUpgradeDefinition = {
      name: () => $t(L.SocialismLevelX, { level: "III" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         PublishingHouse: { output: 1 },
         MagazinePublisher: { output: 1 },
         ResearchLab: { output: 1 },
      },
   };

   Socialism4: IUpgradeDefinition = {
      name: () => $t(L.SocialismLevelX, { level: "IV" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         PublishingHouse: { output: 1 },
         MagazinePublisher: { output: 1 },
         ResearchLab: { output: 1 },
      },
      onUnlocked: (gs) => {
         const [science, _] = getTechUnlockCostInAge("WorldWarAge", gs);
         const hq = findSpecialBuildingCached("Headquarter", gs);
         if (hq) {
            safeAdd(hq.building.resources, "Science", science);
         }
      },
      additionalUpgrades: () => [$t(L.SocialismLevel4DescHTMLV2)],
   };

   Socialism5: IUpgradeDefinition = {
      name: () => $t(L.SocialismLevelX, { level: "V" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         PublishingHouse: { output: 1 },
         MagazinePublisher: { output: 1 },
         ResearchLab: { output: 1 },
      },
      onUnlocked: (gs) => {
         const [science, _] = getTechUnlockCostInAge("ColdWarAge", gs);
         const hq = findSpecialBuildingCached("Headquarter", gs);
         if (hq) {
            safeAdd(hq.building.resources, "Science", science);
         }
      },
      additionalUpgrades: () => [$t(L.SocialismLevel5DescHTMLV2)],
   };

   Communism1: IUpgradeDefinition = {
      name: () => $t(L.CommunismLevelX, { level: "I" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         GatlingGunFactory: { output: 1 },
      },
   };

   Communism2: IUpgradeDefinition = {
      name: () => $t(L.CommunismLevelX, { level: "II" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         GatlingGunFactory: { output: 1 },
      },
      globalMultiplier: {
         sciencePerBusyWorker: 1,
      },
   };

   Communism3: IUpgradeDefinition = {
      name: () => $t(L.CommunismLevelX, { level: "III" }),
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
      name: () => $t(L.CommunismLevelX, { level: "IV" }),
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
         const candidates1 = rollGreatPeopleThisRun(
            new Set(["IndustrialAge"]),
            gs.city,
            getGreatPeopleChoiceCount(gs),
         );
         if (candidates1) {
            gs.greatPeopleChoicesV2.push(candidates1);
         }
         const candidates2 = rollGreatPeopleThisRun(
            new Set(["WorldWarAge"]),
            gs.city,
            getGreatPeopleChoiceCount(gs),
         );
         if (candidates2) {
            gs.greatPeopleChoicesV2.push(candidates2);
         }
      },
      additionalUpgrades: () => [$t(L.CommunismLevel4DescHTML)],
   };

   Communism5: IUpgradeDefinition = {
      name: () => $t(L.CommunismLevelX, { level: "V" }),
      requireResources: { Politics: 1 },
      buildingMultiplier: {
         GatlingGunFactory: { output: 1 },
         IroncladBuilder: { output: 1 },
         BiplaneFactory: { output: 1 },
      },
      onUnlocked: (gs) => {
         const candidates = rollGreatPeopleThisRun(
            new Set(["ColdWarAge"]),
            gs.city,
            getGreatPeopleChoiceCount(gs),
         );
         if (candidates) {
            gs.greatPeopleChoicesV2.push(candidates);
         }
      },
      additionalUpgrades: () => [$t(L.CommunismLevel5DescHTML)],
   };
   BritishMuseum: IUpgradeDefinition = { name: () => "", requireResources: {} };
   SpaceshipIdle: IUpgradeDefinition = {
      name: () => $t(L.WishlistSpaceshipIdle),
      requireResources: {},
      buildingMultiplier: {
         SpaceCenter: { output: 1, storage: 1 },
         SpacecraftFactory: { output: 1, storage: 1 },
      },
   };
   Restitutor: IUpgradeDefinition = {
      name: () => $t(L.WishlistRestitutor),
      requireResources: {},
      globalMultiplier: {
         happiness: 5,
      },
   };
   RiseOfPunic: IUpgradeDefinition = {
      name: () => $t(L.RiseOfPunic),
      requireResources: {},
      globalMultiplier: {
         sciencePerBusyWorker: 2,
         sciencePerIdleWorker: 1,
      },
   };

   PhoenicianAlphabet: IUpgradeDefinition = {
      name: () => $t(L.PhoenicianAlphabet),
      requireResources: {},
      globalMultiplier: {
         output: 1,
      },
   };

   HillfortSettlements: IUpgradeDefinition = {
      name: () => $t(L.HillfortSettlements),
      requireResources: {},
      globalMultiplier: {
         storage: 5,
      },
   };

   PunicCoinage: IUpgradeDefinition = {
      name: () => $t(L.PunicCoinage),
      requireResources: {},
      globalMultiplier: {
         levelBoost: 1,
      },
   };

   RitualSanctuaries: IUpgradeDefinition = {
      name: () => $t(L.RitualSanctuaries),
      requireResources: {},
      globalMultiplier: {
         happiness: 5,
      },
   };

   IrrigatedEstate: IUpgradeDefinition = {
      name: () => $t(L.IrrigatedEstate),
      requireResources: {},
      additionalUpgrades: () => [$t(L.XhWarpStorageThisRun, { hour: 4 })],
   };

   HarborWarehouse: IUpgradeDefinition = {
      name: () => $t(L.HarborWarehouse),
      requireResources: {},
      additionalUpgrades: () => [
         $t(L.PlusXBaseStorageForMarketWarehouseAndCaravansary, { percent: formatPercent(1) }),
      ],
   };

   GranaryAdministration: IUpgradeDefinition = {
      name: () => $t(L.GranaryAdministration),
      requireResources: {},
      additionalUpgrades: () => [$t(L.GenerateOneTimeScienceEqualToTheCheapestTechnologyOfTheCurrentAge)],
      onUnlocked: (gs) => {
         const hq = findSpecialBuildingCached("Headquarter", gs);
         if (hq) {
            const [science, _] = getTechUnlockCostInAge(getCurrentAge(gs), gs);
            safeAdd(hq.building.resources, "Science", science);
         }
      },
   };

   PincerMovement: IUpgradeDefinition = {
      name: () => $t(L.PincerMovement),
      requireResources: {},
      additionalUpgrades: () => [
         $t(L.PlusXAgeWisdom, { percent: formatPercent(0.5), age: Config.TechAge.IndustrialAge.name() }),
      ],
   };

   PunicLegalCodex: IUpgradeDefinition = {
      name: () => $t(L.PunicLegalCodex),
      requireResources: {},
      globalMultiplier: {
         levelBoost: 5,
      },
   };

   TreatyDiplomacy: IUpgradeDefinition = {
      name: () => $t(L.TreatyDiplomacy),
      requireResources: {},
      onUnlocked: (gs) => {
         for (let i = 0; i < 5; i++) {
            const candidates = rollGreatPeopleThisRun(
               new Set([getCurrentAge(gs)]),
               gs.city,
               getGreatPeopleChoiceCount(gs),
            );
            if (candidates) {
               gs.greatPeopleChoicesV2.push(candidates);
            }
         }
         RequestChooseGreatPerson.emit({ permanent: false });
      },
      additionalUpgrades: () => [$t(L.PlusXGreatPeopleFromTheCurrentAge, { count: 5 })],
   };

   WarElephants: IUpgradeDefinition = {
      name: () => $t(L.WarElephants),
      requireResources: {},
      globalMultiplier: {
         builderCapacity: 5,
      },
   };

   HannibalStrategy: IUpgradeDefinition = {
      name: () => $t(L.HannibalSStrategy),
      requireResources: {},
      onUnlocked: (gs) => {
         const cothon = Tick.current.specialBuildings.get("CothonOfCarthage")?.building;
         if (cothon) {
            const bv = Tick.current.totalBuildingValue;
            const koti = (bv * 0.05) / (Config.MaterialPrice.Koti ?? 1);
            safeAdd(cothon.resources, "Koti", koti);
         }
      },
      additionalUpgrades: () => [
         $t(L.GenerateOneTimeKotiEqualToXOfTheTotalBuildingValue, { percent: formatPercent(0.05) }),
      ],
   };

   CaravansaryNetwork: IUpgradeDefinition = {
      name: () => $t(L.CaravansaryNetwork),
      requireResources: {},
      globalMultiplier: {
         storage: 5,
      },
   };

   MediterraneanTrades: IUpgradeDefinition = {
      name: () => $t(L.MediterraneanTrades),
      requireResources: {},
      additionalUpgrades: () => [
         $t(L.PlusXAgeWisdom, { percent: formatPercent(0.5), age: Config.TechAge.WorldWarAge.name() }),
      ],
   };

   CouncilOfElders: IUpgradeDefinition = {
      name: () => $t(L.CouncilOfElders),
      requireResources: {},
      globalMultiplier: {
         sciencePerIdleWorker: 2,
         sciencePerBusyWorker: 3,
      },
   };

   SuffeteAdministration: IUpgradeDefinition = {
      name: () => $t(L.SuffeteAdministration),
      requireResources: {},
      additionalUpgrades: () => [$t(L.PlusAtlasMountainsRange, { range: 2 })],
   };

   BerberAlliance: IUpgradeDefinition = {
      name: () => $t(L.BerberAlliance),
      requireResources: {},
      additionalUpgrades: () => [
         $t(L.PlusXAgeWisdom, { percent: formatPercent(0.5), age: Config.TechAge.InformationAge.name() }),
      ],
   };

   MerchantFleet: IUpgradeDefinition = {
      name: () => $t(L.MerchantFleet),
      requireResources: {},
      onUnlocked: (gs) => {
         for (let i = 0; i < 2; i++) {
            const candidates = rollGreatPeopleThisRun(
               new Set([getCurrentAge(gs)]),
               gs.city,
               getGreatPeopleChoiceCount(gs),
            );
            if (candidates) {
               gs.greatPeopleChoicesV2.push(candidates);
            }
         }
         RequestChooseGreatPerson.emit({ permanent: false });
      },
      additionalUpgrades: () => [$t(L.PlusXGreatPeopleFromTheCurrentAge, { count: 2 })],
   };

   SacredBand: IUpgradeDefinition = {
      name: () => $t(L.SacredBand),
      requireResources: {},
      additionalUpgrades: () => [$t(L.MinusXResearchCost, { percent: formatPercent(0.05) })],
   };

   CothonDockyards: IUpgradeDefinition = {
      name: () => $t(L.CothonDockyards),
      requireResources: {},
      additionalUpgrades: () => [
         $t(L.Plus2RangeForBuildings, {
            buildings: [
               Config.Building.SagradaFamilia.name(),
               Config.Building.CristoRedentor.name(),
               Config.Building.Atomium.name(),
            ].join(", "),
         }),
      ],
   };

   NavalSiegecraft: IUpgradeDefinition = {
      name: () => $t(L.NavalSiegecraft),
      requireResources: {},
      globalMultiplier: {
         worker: 5,
      },
   };

   PurpleDyeMonopoly: IUpgradeDefinition = {
      name: () => $t(L.PurpleDyeMonopoly),
      requireResources: {},
      globalMultiplier: {
         levelBoost: 2,
      },
   };

   PunicGoldenAge: IUpgradeDefinition = {
      name: () => $t(L.PunicGoldenAge),
      requireResources: {},
      additionalUpgrades: () => [$t(L.MinusXResearchCost, { percent: formatPercent(0.1) })],
   };

   IberianColonies: IUpgradeDefinition = {
      name: () => $t(L.IberianColonies),
      requireResources: {},
      additionalUpgrades: () => [$t(L.Generate1hTimeWarpWhenEnteringANewAge)],
   };

   AlpineLogistics: IUpgradeDefinition = {
      name: () => $t(L.AlpineLogistics),
      requireResources: {},
      globalMultiplier: {
         transportCapacity: 5,
      },
   };

   MercenaryCommand: IUpgradeDefinition = {
      name: () => $t(L.MercenaryCommand),
      requireResources: {},
      globalMultiplier: {
         output: 2,
      },
   };

   ExarchateOfAfrica: IUpgradeDefinition = {
      name: () => $t(L.ExarchateOfAfrica),
      requireResources: {},
      globalMultiplier: {
         output: 5,
      },
   };

   ChurchOfCarthage: IUpgradeDefinition = {
      name: () => $t(L.ChurchOfCarthage),
      requireResources: {},
      globalMultiplier: {
         happiness: 10,
      },
   };

   MedinaOfTunis: IUpgradeDefinition = {
      name: () => $t(L.MedinaOfTunis),
      requireResources: {},
      onUnlocked: (gs) => {
         const hq = findSpecialBuildingCached("Headquarter", gs);
         if (hq) {
            const [_, science] = getTechUnlockCostInAge(getCurrentAge(gs), gs);
            safeAdd(hq.building.resources, "Science", science);
         }
      },
      additionalUpgrades: () => [
         $t(L.GenerateOneTimeScienceEqualToTheCostOfTheMostExpensiveTechnologyOfTheCurrentAge),
      ],
   };

   ProvinceOfIfriqiya: IUpgradeDefinition = {
      name: () => $t(L.ProvinceOfIfriqiya),
      requireResources: {},
      globalMultiplier: {
         builderCapacity: 10,
         transportCapacity: 10,
      },
   };

   HafsidDynasty: IUpgradeDefinition = {
      name: () => $t(L.HafsidDynasty),
      requireResources: {},
      additionalUpgrades: () => [$t(L.AllTransportsWithDistance3TileAreImmediate)],
   };

   AcropoliumOfCarthage: IUpgradeDefinition = {
      name: () => $t(L.AcropoliumOfCarthage),
      requireResources: {},
      onUnlocked: (gs) => {
         const cothon = Tick.current.specialBuildings.get("CothonOfCarthage")?.building;
         if (cothon) {
            const bv = Tick.current.totalValue;
            const koti = (bv * 0.05) / (Config.MaterialPrice.Koti ?? 1);
            safeAdd(cothon.resources, "Koti", koti);
         }
      },
      additionalUpgrades: () => [
         $t(L.GenerateOneTimeKotiEqualToXOfTheTotalEmpireValue, { percent: formatPercent(0.05) }),
      ],
   };
}

export type Upgrade = keyof UpgradeDefinitions;
export type IUpgradeGroup = { name: () => string; content: Upgrade[] };
