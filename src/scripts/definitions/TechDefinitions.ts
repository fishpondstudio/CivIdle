import { L, t } from "../utilities/i18n";
import { ITechAgeDefinition, ITechDefinition } from "./ITechDefinition";

export class TechAgeDefinitions {
   StoneAge: ITechAgeDefinition = { from: 0, to: 1, name: () => t(L.StoneAge) };
   BronzeAge: ITechAgeDefinition = { from: 2, to: 3, name: () => t(L.BronzeAge) };
   IronAge: ITechAgeDefinition = { from: 4, to: 5, name: () => t(L.IronAge) };
   ClassicalAge: ITechAgeDefinition = { from: 6, to: 8, name: () => t(L.ClassicalAge) };
   MiddleAge: ITechAgeDefinition = { from: 9, to: 10, name: () => t(L.MiddleAge) };
   RenaissanceAge: ITechAgeDefinition = { from: 11, to: 13, name: () => t(L.RenaissanceAge) };
   IndustrialAge: ITechAgeDefinition = { from: 14, to: 17, name: () => t(L.IndustrialAge) };
   WorldWarAge: ITechAgeDefinition = { from: 18, to: 20, name: () => t(L.WorldWarAge) };
   ColdWarAge: ITechAgeDefinition = { from: 21, to: 22, name: () => t(L.ColdWarAge) };
   InformationAge: ITechAgeDefinition = { from: 23, to: 25, name: () => t(L.InformationAge) };
}

export type TechAge = keyof TechAgeDefinitions;
export const TechAge = new TechAgeDefinitions();

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

   Shelter: ITechDefinition = { name: () => t(L.Shelter), column: 0, unlockBuilding: ["Hut"], requireTech: [] };

   Masonry: ITechDefinition = {
      name: () => t(L.Masonry),
      column: 1,
      requireTech: ["Fire", "StoneTools"],
      unlockBuilding: ["Brickworks"],
   };

   Herding: ITechDefinition = {
      name: () => t(L.Herding),
      column: 1,
      unlockBuilding: ["LivestockFarm"],
      requireTech: ["Logging", "StoneTools"],
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
      requireTech: ["Masonry", "Herding"],
   };

   Counting: ITechDefinition = {
      name: () => t(L.Counting),
      column: 2,
      unlockFeature: ["BuildingProductionPriority"],
      additionalUpgrades: [() => t(L.TechProductionPriority)],
      requireTech: ["Herding", "Farming"],
      unlockBuilding: ["PaperMaker"],
   };

   Pictograph: ITechDefinition = {
      name: () => t(L.Pictograph),
      column: 2,
      unlockFeature: ["BuildingStockpileMode"],
      additionalUpgrades: [() => t(L.TechStockpileMode)],
      unlockBuilding: ["LivestockFarm"],
      requireTech: ["Farming"],
   };

   Metallurgy: ITechDefinition = {
      name: () => t(L.Metallurgy),
      column: 3,
      requireTech: ["Bronze"],
      unlockBuilding: ["Blacksmith"],
   };

   Stateship: ITechDefinition = {
      name: () => t(L.Stateship),
      column: 3,
      requireTech: ["Housing"],
      unlockBuilding: ["Marbleworks"],
   };

   Geometry: ITechDefinition = {
      name: () => t(L.Geometry),
      column: 3,
      requireTech: ["Housing", "Counting"],
      unlockBuilding: ["Brewery"],
   };

   Arithmetic: ITechDefinition = {
      name: () => t(L.Arithmetic),
      column: 3,
      requireTech: ["Counting", "Pictograph"],
      unlockBuilding: ["Statistics"],
   };

   Writing: ITechDefinition = {
      name: () => t(L.Writing),
      column: 3,
      requireTech: ["Pictograph"],
      unlockBuilding: ["Library"],
   };

   Iron: ITechDefinition = {
      name: () => t(L.IronTech),
      column: 4,
      revealDeposit: ["Iron"],
      requireTech: ["Metallurgy", "Stateship"],
   };
   RoadAndWheel: ITechDefinition = {
      name: () => t(L.RoadAndWheel),
      column: 4,
      requireTech: ["Geometry", "Arithmetic", "Stateship"],
   };
   Astronomy: ITechDefinition = { name: () => t(L.Astronomy), column: 4, requireTech: ["Arithmetic", "Writing"] };

   Shamanism: ITechDefinition = { name: () => t(L.Shamanism), column: 5, requireTech: ["Iron", "RoadAndWheel"] };
   Construction: ITechDefinition = { name: () => t(L.Construction), column: 5, requireTech: ["RoadAndWheel"] };
   Music: ITechDefinition = { name: () => t(L.Music), column: 5, requireTech: ["Astronomy", "RoadAndWheel"] };
   Calendar: ITechDefinition = { name: () => t(L.Calendar), column: 5, requireTech: ["Astronomy"] };

   Engineering: ITechDefinition = { name: () => t(L.Engineering), column: 6, requireTech: ["Shamanism"] };
   GoldAndSilver: ITechDefinition = { name: () => t(L.GoldAndSilver), column: 6, requireTech: ["Shamanism"] };
   Market: ITechDefinition = { name: () => t(L.Market), column: 6, requireTech: ["Construction"] };
   CityState: ITechDefinition = { name: () => t(L.CityState), column: 6, requireTech: ["Construction"] };
   Literature: ITechDefinition = { name: () => t(L.Literature), column: 6, requireTech: ["Calendar", "Music"] };

   Machinery: ITechDefinition = {
      name: () => t(L.Machinery),
      column: 7,
      requireTech: ["GoldAndSilver", "Engineering"],
   };
   Currency: ITechDefinition = { name: () => t(L.Currency), column: 7, requireTech: ["GoldAndSilver"] };
   LandTrade: ITechDefinition = {
      name: () => t(L.LandTrade),
      column: 7,
      requireTech: ["Market", "CityState", "GoldAndSilver"],
   };
   Politics: ITechDefinition = { name: () => t(L.Politics), column: 7, requireTech: ["CityState"] };
   Theater: ITechDefinition = { name: () => t(L.Theater), column: 7, requireTech: ["CityState", "Literature"] };

   Architecture: ITechDefinition = { name: () => t(L.Architecture), column: 8, requireTech: ["Currency", "Machinery"] };
   Democracy: ITechDefinition = { name: () => t(L.Democracy), column: 8, requireTech: ["Politics", "LandTrade"] };
   Autocracy: ITechDefinition = { name: () => t(L.Autocracy), column: 8, requireTech: ["Politics", "Theater"] };
   Religion: ITechDefinition = { name: () => t(L.Religion), column: 8, requireTech: ["Theater"] };

   Geography: ITechDefinition = { name: () => t(L.Geography), column: 9, requireTech: ["Architecture"] };
   Physics: ITechDefinition = { name: () => t(L.Physics), column: 9, requireTech: ["Architecture"] };
   Discourse: ITechDefinition = { name: () => t(L.Discourse), column: 9, requireTech: ["Democracy"] };
   Feudalism: ITechDefinition = { name: () => t(L.Feudalism), column: 9, requireTech: ["Autocracy"] };
   Theocracy: ITechDefinition = { name: () => t(L.Theocracy), column: 9, requireTech: ["Autocracy", "Religion"] };
   Education: ITechDefinition = { name: () => t(L.Education), column: 9, requireTech: ["Religion"] };

   Navigation: ITechDefinition = { name: () => t(L.Navigation), column: 10, requireTech: ["Geography", "Physics"] };
   CivilService: ITechDefinition = { name: () => t(L.CivilService), column: 10, requireTech: ["Discourse"] };
   RoyalCourt: ITechDefinition = { name: () => t(L.RoyalCourt), column: 10, requireTech: ["Feudalism"] };
   Cathedral: ITechDefinition = { name: () => t(L.Cathedral), column: 10, requireTech: ["Theocracy"] };
   Printing: ITechDefinition = { name: () => t(L.Printing), column: 10, requireTech: ["Education"] };

   Exploration: ITechDefinition = { name: () => t(L.Exploration), column: 11, requireTech: ["Navigation"] };
   Banking: ITechDefinition = { name: () => t(L.Banking), column: 11, requireTech: ["CivilService", "Navigation"] };
   University: ITechDefinition = {
      name: () => t(L.University),
      column: 11,
      requireTech: ["RoyalCourt", "CivilService"],
   };
   HolyEmpire: ITechDefinition = {
      name: () => t(L.HolyEmpire),
      column: 11,
      requireTech: ["RoyalCourt", "Cathedral", "Printing"],
   };
   Renaissance: ITechDefinition = { name: () => t(L.Renaissance), column: 11, requireTech: ["Printing"] };

   SeaTrade: ITechDefinition = { name: () => t(L.SeaTrade), column: 12, requireTech: ["Exploration", "Banking"] };
   Chemistry: ITechDefinition = { name: () => t(L.Chemistry), column: 12, requireTech: ["Banking"] };
   Economics: ITechDefinition = { name: () => t(L.Economics), column: 12, requireTech: ["Banking", "University"] };
   Enlightenment: ITechDefinition = {
      name: () => t(L.Enlightenment),
      column: 12,
      requireTech: ["University", "HolyEmpire", "Renaissance"],
   };
   NewtonianPhysics: ITechDefinition = { name: () => t(L.NewtonianPhysics), column: 12, requireTech: ["Renaissance"] };

   Steam: ITechDefinition = { name: () => t(L.Steam), column: 13, requireTech: ["SeaTrade", "Chemistry", "Economics"] };
   PrivateOwnership: ITechDefinition = { name: () => t(L.PrivateOwnership), column: 13, requireTech: ["Economics"] };
   Republic: ITechDefinition = { name: () => t(L.Republic), column: 13, requireTech: ["Economics", "Enlightenment"] };
   Constitution: ITechDefinition = { name: () => t(L.Constitution), column: 13, requireTech: ["Enlightenment"] };
   Library: ITechDefinition = {
      name: () => t(L.Library),
      column: 13,
      requireTech: ["Enlightenment", "NewtonianPhysics"],
   };

   Engine: ITechDefinition = { name: () => t(L.Engine), column: 14, requireTech: ["Steam"] };
   Capitalism: ITechDefinition = {
      name: () => t(L.Capitalism),
      column: 14,
      requireTech: ["PrivateOwnership", "Republic"],
   };
   Industrialization: ITechDefinition = {
      name: () => t(L.Industrialization),
      column: 14,
      requireTech: ["Republic", "Constitution"],
   };
   PublicSchool: ITechDefinition = {
      name: () => t(L.PublicSchool),
      column: 14,
      requireTech: ["Constitution", "Library"],
   };

   Colonialism: ITechDefinition = { name: () => t(L.Colonialism), column: 15, requireTech: ["Engine", "Capitalism"] };
   Factory: ITechDefinition = { name: () => t(L.Factory), column: 15, requireTech: ["Capitalism"] };
   Newspaper: ITechDefinition = { name: () => t(L.Newspaper), column: 15, requireTech: ["Industrialization"] };
   Railway: ITechDefinition = { name: () => t(L.Railway), column: 15, requireTech: ["Industrialization"] };
   Olympics: ITechDefinition = { name: () => t(L.Olympics), column: 15, requireTech: ["PublicSchool"] };

   OceanLiner: ITechDefinition = { name: () => t(L.OceanLiner), column: 16, requireTech: ["Colonialism", "Factory"] };
   Imperialism: ITechDefinition = { name: () => t(L.Imperialism), column: 16, requireTech: ["Factory"] };
   StockMarket: ITechDefinition = { name: () => t(L.StockMarket), column: 16, requireTech: ["Newspaper", "Railway"] };
   Electricity: ITechDefinition = { name: () => t(L.Electricity), column: 16, requireTech: ["Railway"] };
   SocialWelfare: ITechDefinition = {
      name: () => t(L.SocialWelfare),
      column: 16,
      requireTech: ["Railway", "Olympics"],
   };

   Automobile: ITechDefinition = {
      name: () => t(L.Automobile),
      column: 17,
      requireTech: ["OceanLiner", "Imperialism"],
   };
   Marconi: ITechDefinition = { name: () => t(L.Marconi), column: 17, requireTech: ["StockMarket"] };
   PowerGrid: ITechDefinition = { name: () => t(L.PowerGrid), column: 17, requireTech: ["Electricity"] };
   Camera: ITechDefinition = { name: () => t(L.Camera), column: 17, requireTech: ["Electricity"] };
   Urbanization: ITechDefinition = {
      name: () => t(L.Urbanization),
      column: 17,
      requireTech: ["Electricity", "SocialWelfare"],
   };

   Aeroplane: ITechDefinition = { name: () => t(L.Aeroplane), column: 18, requireTech: ["Automobile", "Marconi"] };
   AtomTheory: ITechDefinition = { name: () => t(L.AtomTheory), column: 18, requireTech: ["PowerGrid"] };
   Movie: ITechDefinition = {
      name: () => t(L.Movie),
      column: 18,
      requireTech: ["PowerGrid", "Camera", "Urbanization"],
   };

   Jet: ITechDefinition = { name: () => t(L.Jet), column: 19, requireTech: ["Aeroplane", "AtomTheory"] };
   Medicine: ITechDefinition = { name: () => t(L.Medicine), column: 19, requireTech: ["AtomTheory"] };
   Hospital: ITechDefinition = { name: () => t(L.Hospital), column: 19, requireTech: ["AtomTheory"] };
   Greenhouse: ITechDefinition = { name: () => t(L.Greenhouse), column: 19, requireTech: ["AtomTheory", "Movie"] };

   Rocket: ITechDefinition = { name: () => t(L.Rocket), column: 20, requireTech: ["Jet"] };
   Semiconductor: ITechDefinition = { name: () => t(L.Semiconductor), column: 20, requireTech: ["Jet", "Medicine"] };
   Vaccine: ITechDefinition = {
      name: () => t(L.Vaccine),
      column: 20,
      requireTech: ["Hospital", "Medicine", "Greenhouse"],
   };
   Refrigeration: ITechDefinition = { name: () => t(L.Refrigeration), column: 20, requireTech: ["Greenhouse"] };

   SpaceProgram: ITechDefinition = {
      name: () => t(L.SpaceProgram),
      column: 21,
      requireTech: ["Rocket", "Semiconductor"],
   };
   Television: ITechDefinition = { name: () => t(L.Television), column: 21, requireTech: ["Semiconductor"] };
   Tourism: ITechDefinition = { name: () => t(L.Tourism), column: 21, requireTech: ["Vaccine", "Semiconductor"] };
   Skyscrapper: ITechDefinition = {
      name: () => t(L.Skyscrapper),
      column: 21,
      requireTech: ["Vaccine", "Refrigeration"],
   };

   Computer: ITechDefinition = { name: () => t(L.Computer), column: 22, requireTech: ["SpaceProgram", "Television"] };
   Globalization: ITechDefinition = {
      name: () => t(L.Globalization),
      column: 22,
      requireTech: ["Tourism", "Television"],
   };
   UnitedNation: ITechDefinition = { name: () => t(L.UnitedNation), column: 22, requireTech: ["Tourism"] };
   Metropolitan: ITechDefinition = { name: () => t(L.Metropolitan), column: 22, requireTech: ["Skyscrapper"] };

   NuclearFission: ITechDefinition = { name: () => t(L.NuclearFission), column: 23, requireTech: ["Computer"] };
   Internet: ITechDefinition = { name: () => t(L.Internet), column: 23, requireTech: ["Computer", "Globalization"] };
   Nanotechnology: ITechDefinition = { name: () => t(L.Nanotechnology), column: 23, requireTech: ["Globalization"] };
   Genetics: ITechDefinition = { name: () => t(L.Genetics), column: 23, requireTech: ["UnitedNation"] };
   Conglomerate: ITechDefinition = {
      name: () => t(L.Conglomerate),
      column: 23,
      requireTech: ["UnitedNation", "Metropolitan"],
   };

   Robotics: ITechDefinition = { name: () => t(L.Robotics), column: 24, requireTech: ["NuclearFission", "Internet"] };
   SocialNetwork: ITechDefinition = { name: () => t(L.SocialNetwork), column: 24, requireTech: ["Internet"] };
   Smartphone: ITechDefinition = {
      name: () => t(L.Smartphone),
      column: 24,
      requireTech: ["Internet", "Nanotechnology"],
   };
   UniversalHealthcare: ITechDefinition = {
      name: () => t(L.UniversalHealthcare),
      column: 24,
      requireTech: ["Genetics"],
   };
   VentureCapital: ITechDefinition = { name: () => t(L.VentureCapital), column: 24, requireTech: ["Conglomerate"] };

   ArtificialIntelligence: ITechDefinition = {
      name: () => t(L.ArtificialIntelligence),
      column: 25,
      unlockBuilding: [],
      requireTech: ["Robotics", "SocialNetwork"],
   };

   CloudComputing: ITechDefinition = { name: () => t(L.CloudComputing), column: 25, requireTech: ["SocialNetwork"] };
   VirtualReality: ITechDefinition = {
      name: () => t(L.VirtualReality),
      column: 25,
      requireTech: ["SocialNetwork", "Smartphone"],
   };
   Cryptocurrency: ITechDefinition = { name: () => t(L.Cryptocurrency), column: 25, requireTech: ["VentureCapital"] };
}

export type Tech = keyof TechDefinitions;
export const Tech = new TechDefinitions();
