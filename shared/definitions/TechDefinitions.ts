import { SEA_TILE_COST_1, SEA_TILE_COST_2, SEA_TILE_COST_3 } from "../logic/PlayerTradeLogic";
import { formatPercent } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import type { ITechAgeDefinition, ITechDefinition } from "./ITechDefinition";

export const MAX_TECH_COLUMN = 20;
export const MAX_TECH_AGE: TechAge = "WorldWarAge";

export class TechAgeDefinitions {
   StoneAge: ITechAgeDefinition = { idx: 0, from: 0, to: 1, name: () => t(L.StoneAge) };
   BronzeAge: ITechAgeDefinition = { idx: 1, from: 2, to: 3, name: () => t(L.BronzeAge) };
   IronAge: ITechAgeDefinition = { idx: 2, from: 4, to: 5, name: () => t(L.IronAge) };
   ClassicalAge: ITechAgeDefinition = { idx: 3, from: 6, to: 8, name: () => t(L.ClassicalAge) };
   MiddleAge: ITechAgeDefinition = { idx: 4, from: 9, to: 10, name: () => t(L.MiddleAge) };
   RenaissanceAge: ITechAgeDefinition = {
      idx: 5,
      from: 11,
      to: 13,
      name: () => t(L.RenaissanceAge),
   };
   IndustrialAge: ITechAgeDefinition = { idx: 6, from: 14, to: 17, name: () => t(L.IndustrialAge) };
   WorldWarAge: ITechAgeDefinition = { idx: 7, from: 18, to: 20, name: () => t(L.WorldWarAge) };
   ColdWarAge: ITechAgeDefinition = { idx: 8, from: 21, to: 22, name: () => t(L.ColdWarAge) };
   InformationAge: ITechAgeDefinition = {
      idx: 9,
      from: 23,
      to: 25,
      name: () => t(L.InformationAge),
   };
}

export type TechAge = keyof TechAgeDefinitions;

export class TechDefinitions {
   Fire: ITechDefinition = {
      name: () => t(L.Fire),
      column: 0,
      revealDeposit: ["Water"],
      unlockBuilding: ["Aqueduct"],
      requireTech: [],
   };

   StoneTools: ITechDefinition = {
      name: () => t(L.StoneTools),
      column: 0,
      revealDeposit: ["Stone"],
      unlockBuilding: ["StoneQuarry"],
      requireTech: [],
   };

   Logging: ITechDefinition = {
      name: () => t(L.Logging),
      column: 0,
      revealDeposit: ["Wood"],
      unlockBuilding: ["LoggingCamp"],
      requireTech: [],
   };

   Shelter: ITechDefinition = {
      name: () => t(L.Shelter),
      column: 0,
      unlockBuilding: ["Hut"],
      requireTech: [],
   };

   Masonry: ITechDefinition = {
      name: () => t(L.Masonry),
      column: 1,
      requireTech: ["Fire", "StoneTools"],
      unlockBuilding: ["Brickworks", "PyramidOfGiza"],
   };

   Counting: ITechDefinition = {
      name: () => t(L.Counting),
      column: 1,
      requireTech: ["Logging", "StoneTools"],
      unlockBuilding: ["LumberMill"],
   };

   Farming: ITechDefinition = {
      name: () => t(L.Farming),
      column: 1,
      unlockBuilding: ["WheatFarm"],
      requireTech: ["Shelter", "Logging"],
   };

   Bronze: ITechDefinition = {
      name: () => t(L.BronzeTech),
      column: 2,
      unlockBuilding: ["CopperMiningCamp"],
      revealDeposit: ["Copper"],
      requireTech: ["Masonry"],
   };

   Housing: ITechDefinition = {
      name: () => t(L.Housing),
      column: 2,
      unlockBuilding: ["House"],
      requireTech: ["Masonry", "Counting"],
      buildingMultiplier: { Hut: { output: 1 } },
      additionalUpgrades: [() => t(L.TechResourceTransportPreference)],
   };

   Herding: ITechDefinition = {
      name: () => t(L.Herding),
      column: 2,
      unlockBuilding: ["LivestockFarm"],
      requireTech: ["Counting", "Farming"],
      additionalUpgrades: [() => t(L.TechProductionPriority)],
   };

   HorsebackRiding: ITechDefinition = {
      name: () => t(L.HorsebackRiding),
      column: 2,
      additionalUpgrades: [() => t(L.TechStockpileMode)],
      unlockBuilding: ["Stable", "Sandpit"],
      requireTech: ["Farming"],
   };

   Metallurgy: ITechDefinition = {
      name: () => t(L.Metallurgy),
      column: 3,
      requireTech: ["Bronze"],
      unlockBuilding: ["HatshepsutTemple", "Blacksmith"],
   };

   Stateship: ITechDefinition = {
      name: () => t(L.Stateship),
      column: 3,
      requireTech: ["Housing"],
      unlockBuilding: ["FlourMill", "CottonPlantation"],
   };

   Market: ITechDefinition = {
      name: () => t(L.Market),
      column: 3,
      requireTech: ["Housing", "Herding"],
      unlockBuilding: ["Market", "ColossusOfRhodes"],
   };

   Arithmetic: ITechDefinition = {
      name: () => t(L.Arithmetic),
      column: 3,
      requireTech: ["Herding", "HorsebackRiding"],
      unlockBuilding: ["Statistics"],
   };

   Writing: ITechDefinition = {
      name: () => t(L.Writing),
      column: 3,
      requireTech: ["HorsebackRiding"],
      unlockBuilding: ["PaperMaker"],
   };

   Iron: ITechDefinition = {
      name: () => t(L.IronTech),
      column: 4,
      revealDeposit: ["Iron"],
      unlockBuilding: ["IronMiningCamp"],
      requireTech: ["Metallurgy", "Stateship"],
   };

   RoadAndWheel: ITechDefinition = {
      name: () => t(L.RoadAndWheel),
      column: 4,
      requireTech: ["Market", "Stateship"],
      unlockBuilding: ["Warehouse", "GreatMosqueOfSamarra"],
      buildingMultiplier: { House: { worker: 1 } },
   };

   LandTrade: ITechDefinition = {
      name: () => t(L.LandTrade),
      column: 4,
      requireTech: ["Market", "Arithmetic"],
      unlockBuilding: ["Caravansary"],
      globalMultiplier: { transportCapacity: 1 },
   };

   Astronomy: ITechDefinition = {
      name: () => t(L.Astronomy),
      column: 4,
      requireTech: ["Arithmetic", "Writing"],
      unlockBuilding: ["Brewery", "Stonehenge"],
   };

   Shamanism: ITechDefinition = {
      name: () => t(L.Shamanism),
      column: 5,
      requireTech: ["Iron", "RoadAndWheel"],
      unlockBuilding: ["ChariotWorkshop", "Persepolis"],
   };

   Construction: ITechDefinition = {
      name: () => t(L.Construction),
      column: 5,
      requireTech: ["RoadAndWheel"],
      unlockBuilding: ["IronForge", "Marbleworks"],
   };

   Music: ITechDefinition = {
      name: () => t(L.Music),
      column: 5,
      requireTech: ["LandTrade", "RoadAndWheel"],
      unlockBuilding: ["MusiciansGuild", "PaintersGuild"],
   };

   Calendar: ITechDefinition = {
      name: () => t(L.Calendar),
      column: 5,
      requireTech: ["Astronomy", "LandTrade"],
      unlockBuilding: ["CottonMill", "HangingGarden"],
      globalMultiplier: {
         storage: 1,
      },
   };

   Engineering: ITechDefinition = {
      name: () => t(L.Engineering),
      column: 6,
      requireTech: ["Shamanism", "Construction"],
      unlockBuilding: ["Armory", "LighthouseOfAlexandria"],
   };

   PreciousMetal: ITechDefinition = {
      name: () => t(L.PreciousMetal),
      column: 6,
      requireTech: ["Construction"],
      revealDeposit: ["Gold"],
      unlockBuilding: ["GoldMiningCamp"],
   };

   CityState: ITechDefinition = {
      name: () => t(L.CityState),
      column: 6,
      requireTech: ["Construction", "Music"],
      unlockBuilding: ["Bakery", "MausoleumAtHalicarnassus"],
   };

   Literature: ITechDefinition = {
      name: () => t(L.Literature),
      column: 6,
      requireTech: ["Calendar", "Music"],
      unlockBuilding: ["CheeseMaker", "WritersGuild"],
   };

   Machinery: ITechDefinition = {
      name: () => t(L.Machinery),
      column: 7,
      requireTech: ["PreciousMetal", "Engineering"],
      unlockBuilding: ["SiegeWorkshop", "TerracottaArmy"],
      additionalUpgrades: [() => t(L.WarehouseUpgrade)],
   };

   Politics: ITechDefinition = {
      name: () => t(L.Politics),
      column: 7,
      requireTech: ["CityState", "PreciousMetal"],
      unlockBuilding: ["FurnitureWorkshop", "Petra"],
   };

   Theater: ITechDefinition = {
      name: () => t(L.Theater),
      column: 7,
      requireTech: ["Literature"],
      unlockBuilding: ["ActorsGuild"],
   };

   Library: ITechDefinition = {
      name: () => t(L.Library),
      column: 7,
      requireTech: ["Literature"],
      unlockBuilding: ["Library", "Glassworks"],
   };

   Architecture: ITechDefinition = {
      name: () => t(L.Architecture),
      column: 8,
      requireTech: ["Machinery"],
      unlockBuilding: ["SwordForge", "ChichenItza"],
      globalMultiplier: { builderCapacity: 1 },
   };

   Democracy: ITechDefinition = {
      name: () => t(L.Democracy),
      column: 8,
      requireTech: ["Politics"],
      unlockBuilding: ["Apartment"],
   };

   Autocracy: ITechDefinition = {
      name: () => t(L.Autocracy),
      column: 8,
      requireTech: ["Politics", "Library", "Theater"],
      unlockBuilding: ["CoinMint", "TempleOfHeaven"],
   };

   Religion: ITechDefinition = {
      name: () => t(L.Religion),
      column: 8,
      requireTech: ["Library"],
      unlockBuilding: ["Shrine", "LuxorTemple"],
   };

   Geography: ITechDefinition = {
      name: () => t(L.Geography),
      column: 9,
      requireTech: ["Architecture"],
      unlockBuilding: ["CaravelBuilder"],
      buildingMultiplier: {
         Library: { output: 1 },
      },
      additionalUpgrades: [() => t(L.SeaTradeUpgrade, { tariff: formatPercent(SEA_TILE_COST_1) })],
   };

   Physics: ITechDefinition = {
      name: () => t(L.Physics),
      column: 9,
      requireTech: ["Architecture"],
      unlockBuilding: ["GarmentWorkshop"],
      globalMultiplier: {
         storage: 1,
      },
   };

   Feudalism: ITechDefinition = {
      name: () => t(L.Feudalism),
      column: 9,
      requireTech: ["Autocracy", "Democracy"],
      unlockBuilding: ["KnightCamp", "TempleOfArtemis"],
   };

   Theocracy: ITechDefinition = {
      name: () => t(L.Theocracy),
      column: 9,
      requireTech: ["Autocracy", "Religion"],
      unlockBuilding: ["Church", "Mosque", "MogaoCaves"],
   };

   Navigation: ITechDefinition = {
      name: () => t(L.Navigation),
      column: 10,
      requireTech: ["Geography", "Physics"],
      unlockBuilding: ["GalleonBuilder"],
   };

   CivilService: ITechDefinition = {
      name: () => t(L.CivilService),
      column: 10,
      requireTech: ["Feudalism"],
      unlockBuilding: ["AngkorWat"],
   };

   HolyEmpire: ITechDefinition = {
      name: () => t(L.HolyEmpire),
      column: 10,
      requireTech: ["Feudalism", "Theocracy"],
      unlockBuilding: ["Cathedral", "HagiaSophia"],
   };

   Education: ITechDefinition = {
      name: () => t(L.Education),
      column: 10,
      requireTech: ["Theocracy"],
      unlockBuilding: ["School", "GrandBazaar"],
   };

   Optics: ITechDefinition = {
      name: () => t(L.Optics),
      column: 11,
      requireTech: ["Navigation"],
      unlockBuilding: ["LensWorkshop"],
      globalMultiplier: { builderCapacity: 1 },
      buildingMultiplier: {
         Library: { output: 1 },
         School: { output: 1 },
      },
      additionalUpgrades: [() => t(L.SeaTradeUpgrade, { tariff: formatPercent(SEA_TILE_COST_2) })],
   };

   Banking: ITechDefinition = {
      name: () => t(L.Banking),
      column: 11,
      requireTech: ["CivilService", "Navigation"],
      unlockBuilding: ["Bank"],
      additionalUpgrades: [() => t(L.BankingAdditionalUpgrade)],
   };

   University: ITechDefinition = {
      name: () => t(L.University),
      column: 11,
      requireTech: ["HolyEmpire", "Education", "CivilService"],
      unlockBuilding: ["University", "OxfordUniversity"],
      globalMultiplier: { sciencePerBusyWorker: 1 },
   };

   Chemistry: ITechDefinition = {
      name: () => t(L.Chemistry),
      column: 11,
      requireTech: ["Education"],
      revealDeposit: ["Coal"],
      unlockBuilding: ["CoalMine"],
      buildingMultiplier: {
         StoneQuarry: { storage: 1, output: 1 },
         LoggingCamp: { storage: 1, output: 1 },
         IronMiningCamp: { storage: 1, output: 1 },
         CopperMiningCamp: { storage: 1, output: 1 },
         Sandpit: { storage: 1, output: 1 },
      },
   };

   Exploration: ITechDefinition = {
      name: () => t(L.Exploration),
      column: 12,
      requireTech: ["Optics"],
      unlockBuilding: ["CannonWorkshop"],
   };

   PrintingPress: ITechDefinition = {
      name: () => t(L.PrintingPress),
      column: 12,
      requireTech: ["Banking", "University", "Optics"],
      unlockBuilding: ["PrintingHouse", "ForbiddenCity"],
   };

   Enlightenment: ITechDefinition = {
      name: () => t(L.Enlightenment),
      column: 12,
      requireTech: ["University", "Chemistry"],
      unlockBuilding: ["Museum", "StPetersBasilica"],
   };

   Firearm: ITechDefinition = {
      name: () => t(L.Firearm),
      column: 12,
      requireTech: ["Chemistry"],
      unlockBuilding: ["GunpowderMill", "SaintBasilsCathedral"],
   };

   Colonialism: ITechDefinition = {
      name: () => t(L.Colonialism),
      column: 13,
      requireTech: ["Exploration", "PrintingPress"],
      unlockBuilding: ["FrigateBuilder", "HimejiCastle"],
   };

   PrivateOwnership: ITechDefinition = {
      name: () => t(L.PrivateOwnership),
      column: 13,
      requireTech: ["PrintingPress"],
      unlockBuilding: ["BondMarket"],
   };

   Constitution: ITechDefinition = {
      name: () => t(L.Constitution),
      column: 13,
      requireTech: ["Enlightenment", "PrintingPress"],
      unlockBuilding: ["Courthouse", "TajMahal"],
   };

   Revolution: ITechDefinition = {
      name: () => t(L.Revolution),
      column: 13,
      requireTech: ["Enlightenment", "Firearm"],
      unlockBuilding: ["DynamiteWorkshop"],
   };

   Rifling: ITechDefinition = {
      name: () => t(L.Rifling),
      column: 14,
      requireTech: ["PrivateOwnership", "Colonialism"],
      unlockBuilding: ["RifleFactory", "Neuschwanstein"],
   };

   Alloy: ITechDefinition = {
      name: () => t(L.Alloy),
      column: 14,
      requireTech: ["PrivateOwnership"],
      unlockBuilding: ["SteelMill", "EiffelTower"],
   };

   SteamEngine: ITechDefinition = {
      name: () => t(L.SteamEngine),
      column: 14,
      requireTech: ["PrivateOwnership"],
      unlockBuilding: ["Steamworks", "ConcretePlant"],
      globalMultiplier: {
         storage: 1,
      },
   };

   Capitalism: ITechDefinition = {
      name: () => t(L.Capitalism),
      column: 14,
      requireTech: ["Constitution", "Revolution", "PrivateOwnership"],
      globalMultiplier: {
         builderCapacity: 1,
      },
      buildingMultiplier: {
         Library: { output: 1 },
         School: { output: 1 },
         University: { output: 1 },
      },
      unlockBuilding: ["Parliament"],
      additionalUpgrades: [() => t(L.SeaTradeUpgrade, { tariff: formatPercent(SEA_TILE_COST_3) })],
   };

   RapidFire: ITechDefinition = {
      name: () => t(L.RapidFire),
      column: 15,
      requireTech: ["Rifling", "Alloy"],
      unlockBuilding: ["GatlingGunFactory"],
   };

   Railway: ITechDefinition = {
      name: () => t(L.Railway),
      column: 15,
      requireTech: ["Alloy", "SteamEngine"],
      unlockBuilding: ["LocomotiveFactory"],
      globalMultiplier: {
         transportCapacity: 1,
      },
   };

   Drilling: ITechDefinition = {
      name: () => t(L.Drilling),
      column: 15,
      requireTech: ["Capitalism", "SteamEngine"],
      unlockBuilding: ["OilWell", "CableFactory"],
      revealDeposit: ["Oil"],
   };

   Journalism: ITechDefinition = {
      name: () => t(L.Journalism),
      column: 15,
      requireTech: ["Capitalism"],
      unlockBuilding: ["PublishingHouse", "Rijksmuseum"],
      globalMultiplier: {
         sciencePerBusyWorker: 1,
      },
   };

   Imperialism: ITechDefinition = {
      name: () => t(L.Imperialism),
      column: 16,
      requireTech: ["Railway", "RapidFire"],
      unlockBuilding: ["IroncladBuilder", "SummerPalace"],
   };

   Electricity: ITechDefinition = {
      name: () => t(L.Electricity),
      column: 16,
      requireTech: ["Railway", "Drilling"],
      unlockBuilding: ["CoalPowerPlant"],
      additionalUpgrades: [() => t(L.ElectrificationUpgrade)],
   };

   StockMarket: ITechDefinition = {
      name: () => t(L.StockMarket),
      column: 16,
      requireTech: ["Journalism"],
      unlockBuilding: ["StockExchange", "StatueOfLiberty"],
      globalMultiplier: {
         storage: 1,
      },
   };

   Olympics: ITechDefinition = {
      name: () => t(L.Olympics),
      column: 16,
      requireTech: ["Journalism"],
      unlockBuilding: ["Stadium"],
      globalMultiplier: {
         happiness: 5,
      },
   };

   Combustion: ITechDefinition = {
      name: () => t(L.Combustion),
      column: 17,
      requireTech: ["Imperialism", "Electricity"],
      unlockBuilding: ["TankFactory"],
   };

   Electrolysis: ITechDefinition = {
      name: () => t(L.Electrolysis),
      column: 17,
      requireTech: ["Electricity"],
      revealDeposit: ["Aluminum"],
      unlockBuilding: ["AluminumSmelter"],
   };

   Refinery: ITechDefinition = {
      name: () => t(L.Refinery),
      column: 17,
      requireTech: ["Electricity"],
      unlockBuilding: ["OilRefinery", "BrandenburgGate"],
   };

   GasPipeline: ITechDefinition = {
      name: () => t(L.GasPipeline),
      column: 17,
      requireTech: ["Electricity"],
      unlockBuilding: ["NaturalGasWell"],
      revealDeposit: ["NaturalGas"],
   };

   Urbanization: ITechDefinition = {
      name: () => t(L.Urbanization),
      column: 17,
      requireTech: ["Olympics", "StockMarket", "Electricity"],
      unlockBuilding: ["Pizzeria", "MagazinePublisher"],
   };

   Aviation: ITechDefinition = {
      name: () => t(L.Aviation),
      column: 18,
      requireTech: ["Combustion", "Electrolysis"],
      unlockBuilding: ["BiplaneFactory"],
   };

   Synthetics: ITechDefinition = {
      name: () => t(L.Synthetics),
      column: 18,
      requireTech: ["Refinery", "Electrolysis"],
      unlockBuilding: ["PlasticsFactory", "GasPowerPlant"],
   };

   AtomicTheory: ITechDefinition = {
      name: () => t(L.AtomicTheory),
      column: 18,
      requireTech: ["Refinery", "GasPipeline"],
      revealDeposit: ["Uranium"],
      unlockBuilding: ["UraniumMine", "ResearchLab"],
      buildingMultiplier: {
         Library: { output: 1 },
         School: { output: 1 },
         University: { output: 1 },
         PublishingHouse: { output: 1 },
      },
   };

   MotionPicture: ITechDefinition = {
      name: () => t(L.MotionPicture),
      column: 18,
      requireTech: ["Urbanization"],
      unlockBuilding: ["MovieStudio", "Hollywood"],
   };

   Assembly: ITechDefinition = {
      name: () => t(L.Assembly),
      column: 19,
      requireTech: ["Aviation", "Synthetics"],
      unlockBuilding: ["CarFactory", "SagradaFamilia"],
   };

   Ballistics: ITechDefinition = {
      name: () => t(L.Ballistics),
      column: 19,
      requireTech: ["Synthetics"],
      unlockBuilding: ["ArtilleryFactory"],
   };

   Enrichment: ITechDefinition = {
      name: () => t(L.Enrichment),
      column: 19,
      requireTech: ["AtomicTheory", "Synthetics"],
      unlockBuilding: ["UraniumEnrichmentPlant"],
   };

   Radio: ITechDefinition = {
      name: () => t(L.Radio),
      column: 19,
      requireTech: ["AtomicTheory", "MotionPicture"],
      unlockBuilding: ["RadioStation", "CristoRedentor"],
   };

   Rocketry: ITechDefinition = {
      name: () => t(L.Rocketry),
      column: 20,
      requireTech: ["Assembly", "Ballistics"],
      unlockBuilding: ["RocketFactory", "BattleshipBuilder"],
   };

   NuclearFission: ITechDefinition = {
      name: () => t(L.NuclearFission),
      column: 20,
      requireTech: ["Enrichment", "Ballistics"],
      unlockBuilding: ["AtomicFacility", "ManhattanProject"],
   };

   Hydroelectricity: ITechDefinition = {
      name: () => t(L.Hydroelectricity),
      column: 20,
      requireTech: ["Radio"],
      unlockBuilding: ["HydroDam", "GoldenGateBridge"],
   };

   UnitedNations: ITechDefinition = {
      name: () => t(L.UnitedNations),
      column: 20,
      requireTech: ["Radio"],
      unlockBuilding: ["Embassy", "UnitedNations"],
   };

   SpaceProgram: ITechDefinition = {
      name: () => t(L.SpaceProgram),
      column: 21,
      requireTech: ["Rocketry", "NuclearFission"],
   };

   Semiconductor: ITechDefinition = {
      name: () => t(L.Semiconductor),
      column: 21,
      requireTech: ["NuclearFission", "Hydroelectricity"],
   };
   Television: ITechDefinition = {
      name: () => t(L.Television),
      column: 21,
      requireTech: ["UnitedNations", "Hydroelectricity"],
   };
   Skyscrapper: ITechDefinition = {
      name: () => t(L.Skyscrapper),
      column: 21,
      requireTech: ["UnitedNations"],
   };
   Computer: ITechDefinition = {
      name: () => t(L.Computer),
      column: 22,
      requireTech: ["SpaceProgram", "Semiconductor"],
   };
   Globalization: ITechDefinition = {
      name: () => t(L.Globalization),
      column: 22,
      requireTech: ["Semiconductor", "Television"],
   };
   Tourism: ITechDefinition = {
      name: () => t(L.Tourism),
      column: 22,
      requireTech: ["Skyscrapper"],
   };
   Conglomerate: ITechDefinition = {
      name: () => t(L.Conglomerate),
      column: 22,
      requireTech: ["Skyscrapper"],
   };
   Nanotechnology: ITechDefinition = {
      name: () => t(L.Nanotechnology),
      column: 23,
      requireTech: ["Computer"],
   };
   Internet: ITechDefinition = {
      name: () => t(L.Internet),
      column: 23,
      requireTech: ["Computer", "Globalization"],
   };
   Genetics: ITechDefinition = {
      name: () => t(L.Genetics),
      column: 23,
      requireTech: ["Tourism", "Globalization"],
   };
   VentureCapital: ITechDefinition = {
      name: () => t(L.VentureCapital),
      column: 23,
      requireTech: ["Conglomerate", "Tourism"],
   };
   Robotics: ITechDefinition = {
      name: () => t(L.Robotics),
      column: 24,
      requireTech: ["Nanotechnology", "Internet"],
   };
   SocialNetwork: ITechDefinition = {
      name: () => t(L.SocialNetwork),
      column: 24,
      requireTech: ["Internet"],
   };
   Smartphone: ITechDefinition = {
      name: () => t(L.Smartphone),
      column: 24,
      requireTech: ["Internet"],
   };
   UniversalHealthcare: ITechDefinition = {
      name: () => t(L.UniversalHealthcare),
      column: 24,
      requireTech: ["VentureCapital", "Genetics"],
   };
   ArtificialIntelligence: ITechDefinition = {
      name: () => t(L.ArtificialIntelligence),
      column: 25,
      unlockBuilding: [],
      requireTech: ["Robotics", "SocialNetwork"],
   };
   CloudComputing: ITechDefinition = {
      name: () => t(L.CloudComputing),
      column: 25,
      requireTech: ["SocialNetwork"],
   };
   VirtualReality: ITechDefinition = {
      name: () => t(L.VirtualReality),
      column: 25,
      requireTech: ["SocialNetwork", "Smartphone"],
   };
   Cryptocurrency: ITechDefinition = {
      name: () => t(L.Cryptocurrency),
      column: 25,
      requireTech: ["Smartphone", "UniversalHealthcare"],
   };
}

export type Tech = keyof TechDefinitions;
