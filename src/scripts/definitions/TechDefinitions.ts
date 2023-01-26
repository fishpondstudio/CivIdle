// import { L, t } from "../utilities/i18n";
// import { ITechAgeDefinition, ITechDefinition } from "./ITechDefinition";

// export class TechAgeDefinitions {
//    StoneAge: ITechAgeDefinition = { from: 0, to: 1, name: () => t(L.StoneAge) };
//    BronzeAge: ITechAgeDefinition = { from: 2, to: 3, name: () => t(L.BronzeAge) };
//    IronAge: ITechAgeDefinition = { from: 4, to: 5, name: () => t(L.IronAge) };
//    ClassicalAge: ITechAgeDefinition = { from: 6, to: 8, name: () => t(L.ClassicalAge) };
//    MiddleAge: ITechAgeDefinition = { from: 9, to: 10, name: () => t(L.MiddleAge) };
//    RenaissanceAge: ITechAgeDefinition = { from: 11, to: 13, name: () => t(L.RenaissanceAge) };
//    IndustrialAge: ITechAgeDefinition = { from: 14, to: 17, name: () => t(L.IndustrialAge) };
//    WorldWarAge: ITechAgeDefinition = { from: 18, to: 20, name: () => t(L.WorldWarAge) };
//    ColdWarAge: ITechAgeDefinition = { from: 21, to: 22, name: () => t(L.ColdWarAge) };
//    InformationAge: ITechAgeDefinition = { from: 23, to: 25, name: () => t(L.InformationAge) };
// }

// export type TechAge = keyof TechAgeDefinitions;

// export class TechDefinitions {
//    Fire: ITechDefinition = {
//       name: () => t(L.Fire),
//       column: 0,
//       revealDeposit: ["Wood"],
//    };

//    StoneTools: ITechDefinition = {
//       name: () => t(L.StoneTools),
//       column: 0,
//       revealDeposit: ["Stone"],
//       unlockBuilding: ["StoneQuarry"],
//    };

//    Logging: ITechDefinition = {
//       name: () => t(L.Logging),
//       column: 0,
//       revealDeposit: ["Water"],
//       unlockBuilding: ["LoggingCamp"],
//    };

//    Shelter: ITechDefinition = { name: () => t(L.Shelter), column: 0, unlockBuilding: ["Hut"] };

//    Masonry: ITechDefinition = {
//       name: () => t(L.Masonry),
//       column: 1,
//       // unlockBuilding: ["StonemasonsWorkshop", "Stonehenge"],
//    };

//    Herding: ITechDefinition = { name: () => t(L.Herding), column: 1, unlockBuilding: ["LivestockFarm"] };
//    Farming: ITechDefinition = { name: () => t(L.Farming), column: 1, unlockBuilding: ["Farmland"] };

//    Bronze: ITechDefinition = {
//       name: () => t(L.BronzeTech),
//       column: 2,
//       unlockBuilding: ["CopperMiningCamp"],
//       revealDeposit: ["Copper"],
//    };

//    Housing: ITechDefinition = {
//       name: () => t(L.Housing),
//       column: 2,
//       buildingModifier: { StonemasonsWorkshop: { input: { Stone: 1 }, output: { Brick: 1 } } },
//       // unlockBuilding: ["House"],
//    };

//    Counting: ITechDefinition = {
//       name: () => t(L.Counting),
//       column: 2,
//       buildingMultiplier: {
//          LivestockFarm: { output: 1, storage: 1 },
//       },
//       // unlockBuilding: ["HatshepsutTemple"],
//       additionalUpgrades: [() => t(L.TechProductionPriority)],
//    };

//    Pictograph: ITechDefinition = {
//       name: () => t(L.Pictograph),
//       column: 2,
//       globalMultiplier: { sciencePerBusyWorker: 1 },
//       buildingMultiplier: {
//          Farmland: { output: 1, storage: 1 },
//          LoggingCamp: { storage: 1 },
//          StoneQuarry: { storage: 1 },
//       },
//       additionalUpgrades: [() => t(L.TechStockpileMode)],
//    };

//    Metallurgy: ITechDefinition = { name: () => t(L.Metallurgy), column: 3 };
//    Stateship: ITechDefinition = { name: () => t(L.Stateship), column: 3 };
//    Geometry: ITechDefinition = { name: () => t(L.Geometry), column: 3 };
//    Arithmetic: ITechDefinition = { name: () => t(L.Arithmetic), column: 3 };
//    Writing: ITechDefinition = { name: () => t(L.Writing), column: 3 };

//    Iron: ITechDefinition = { name: () => t(L.IronTech), column: 4, revealDeposit: ["Iron"] };
//    RoadAndWheel: ITechDefinition = { name: () => t(L.RoadAndWheel), column: 4 };
//    Astronomy: ITechDefinition = { name: () => t(L.Astronomy), column: 4 };

//    Shamanism: ITechDefinition = { name: () => t(L.Shamanism), column: 5 };
//    Construction: ITechDefinition = { name: () => t(L.Construction), column: 5 };
//    Music: ITechDefinition = { name: () => t(L.Music), column: 5 };
//    Calendar: ITechDefinition = { name: () => t(L.Calendar), column: 5 };

//    Engineering: ITechDefinition = { name: () => t(L.Engineering), column: 6 };
//    GoldAndSilver: ITechDefinition = { name: () => t(L.GoldAndSilver), column: 6 };
//    Market: ITechDefinition = { name: () => t(L.Market), column: 6 };
//    CityState: ITechDefinition = { name: () => t(L.CityState), column: 6 };
//    Literature: ITechDefinition = { name: () => t(L.Literature), column: 6 };

//    Machinery: ITechDefinition = { name: () => t(L.Machinery), column: 7 };
//    Currency: ITechDefinition = { name: () => t(L.Currency), column: 7 };
//    LandTrade: ITechDefinition = { name: () => t(L.LandTrade), column: 7 };
//    Politics: ITechDefinition = { name: () => t(L.Politics), column: 7 };
//    Theater: ITechDefinition = { name: () => t(L.Theater), column: 7 };

//    Architecture: ITechDefinition = { name: () => t(L.Architecture), column: 8 };
//    Democracy: ITechDefinition = { name: () => t(L.Democracy), column: 8 };
//    Autocracy: ITechDefinition = { name: () => t(L.Autocracy), column: 8 };
//    Religion: ITechDefinition = { name: () => t(L.Religion), column: 8 };

//    Geography: ITechDefinition = { name: () => t(L.Geography), column: 9 };
//    Physics: ITechDefinition = { name: () => t(L.Physics), column: 9 };
//    Discourse: ITechDefinition = { name: () => t(L.Discourse), column: 9 };
//    Feudalism: ITechDefinition = { name: () => t(L.Feudalism), column: 9 };
//    Theocracy: ITechDefinition = { name: () => t(L.Theocracy), column: 9 };
//    Education: ITechDefinition = { name: () => t(L.Education), column: 9 };

//    Navigation: ITechDefinition = { name: () => t(L.Navigation), column: 10 };
//    CivilService: ITechDefinition = { name: () => t(L.CivilService), column: 10 };
//    RoyalCourt: ITechDefinition = { name: () => t(L.RoyalCourt), column: 10 };
//    Cathedral: ITechDefinition = { name: () => t(L.Cathedral), column: 10 };
//    Printing: ITechDefinition = { name: () => t(L.Printing), column: 10 };

//    Exploration: ITechDefinition = { name: () => t(L.Exploration), column: 11 };
//    Banking: ITechDefinition = { name: () => t(L.Banking), column: 11 };
//    University: ITechDefinition = { name: () => t(L.University), column: 11 };
//    HolyEmpire: ITechDefinition = { name: () => t(L.HolyEmpire), column: 11 };
//    Renaissance: ITechDefinition = { name: () => t(L.Renaissance), column: 11 };

//    SeaTrade: ITechDefinition = { name: () => t(L.SeaTrade), column: 12 };
//    Chemistry: ITechDefinition = { name: () => t(L.Chemistry), column: 12 };
//    Economics: ITechDefinition = { name: () => t(L.Economics), column: 12 };
//    Enlightenment: ITechDefinition = { name: () => t(L.Enlightenment), column: 12 };
//    NewtonianPhysics: ITechDefinition = { name: () => t(L.NewtonianPhysics), column: 12 };

//    Steam: ITechDefinition = { name: () => t(L.Steam), column: 13 };
//    PrivateOwnership: ITechDefinition = { name: () => t(L.PrivateOwnership), column: 13 };
//    Republic: ITechDefinition = { name: () => t(L.Republic), column: 13 };
//    Constitution: ITechDefinition = { name: () => t(L.Constitution), column: 13 };
//    Library: ITechDefinition = { name: () => t(L.Library), column: 13 };

//    Engine: ITechDefinition = { name: () => t(L.Engine), column: 14 };
//    Capitalism: ITechDefinition = { name: () => t(L.Capitalism), column: 14 };
//    Industrialization: ITechDefinition = { name: () => t(L.Industrialization), column: 14 };
//    PublicSchool: ITechDefinition = { name: () => t(L.PublicSchool), column: 14 };

//    Colonialism: ITechDefinition = { name: () => t(L.Colonialism), column: 15 };
//    Factory: ITechDefinition = { name: () => t(L.Factory), column: 15 };
//    Newspaper: ITechDefinition = { name: () => t(L.Newspaper), column: 15 };
//    Railway: ITechDefinition = { name: () => t(L.Railway), column: 15 };
//    Olympics: ITechDefinition = { name: () => t(L.Olympics), column: 15 };

//    OceanLiner: ITechDefinition = { name: () => t(L.OceanLiner), column: 16 };
//    Imperialism: ITechDefinition = { name: () => t(L.Imperialism), column: 16 };
//    StockMarket: ITechDefinition = { name: () => t(L.StockMarket), column: 16 };
//    Electricity: ITechDefinition = { name: () => t(L.Electricity), column: 16 };
//    SocialWelfare: ITechDefinition = { name: () => t(L.SocialWelfare), column: 16 };

//    Automobile: ITechDefinition = { name: () => t(L.Automobile), column: 17 };
//    Marconi: ITechDefinition = { name: () => t(L.Marconi), column: 17 };
//    PowerGrid: ITechDefinition = { name: () => t(L.PowerGrid), column: 17 };
//    Camera: ITechDefinition = { name: () => t(L.Camera), column: 17 };
//    Urbanization: ITechDefinition = { name: () => t(L.Urbanization), column: 17 };

//    Aeroplane: ITechDefinition = { name: () => t(L.Aeroplane), column: 18 };
//    AtomTheory: ITechDefinition = { name: () => t(L.AtomTheory), column: 18 };
//    Movie: ITechDefinition = { name: () => t(L.Movie), column: 18 };

//    Jet: ITechDefinition = { name: () => t(L.Jet), column: 19 };
//    Medicine: ITechDefinition = { name: () => t(L.Medicine), column: 19 };
//    Hospital: ITechDefinition = { name: () => t(L.Hospital), column: 19 };
//    Greenhouse: ITechDefinition = { name: () => t(L.Greenhouse), column: 19 };

//    Rocket: ITechDefinition = { name: () => t(L.Rocket), column: 20 };
//    Semiconductor: ITechDefinition = { name: () => t(L.Semiconductor), column: 20 };
//    Vaccine: ITechDefinition = { name: () => t(L.Vaccine), column: 20 };
//    Refrigeration: ITechDefinition = { name: () => t(L.Refrigeration), column: 20 };

//    SpaceProgram: ITechDefinition = { name: () => t(L.SpaceProgram), column: 21 };
//    Television: ITechDefinition = { name: () => t(L.Television), column: 21 };
//    Tourism: ITechDefinition = { name: () => t(L.Tourism), column: 21 };
//    Skyscrapper: ITechDefinition = { name: () => t(L.Skyscrapper), column: 21 };

//    Computer: ITechDefinition = { name: () => t(L.Computer), column: 22 };
//    Globalization: ITechDefinition = { name: () => t(L.Globalization), column: 22 };
//    UnitedNation: ITechDefinition = { name: () => t(L.UnitedNation), column: 22 };
//    Metropolitan: ITechDefinition = { name: () => t(L.Metropolitan), column: 22 };

//    NuclearFission: ITechDefinition = { name: () => t(L.NuclearFission), column: 23 };
//    Internet: ITechDefinition = { name: () => t(L.Internet), column: 23 };
//    Nanotechnology: ITechDefinition = { name: () => t(L.Nanotechnology), column: 23 };
//    Genetics: ITechDefinition = { name: () => t(L.Genetics), column: 23 };
//    Conglomerate: ITechDefinition = { name: () => t(L.Conglomerate), column: 23 };

//    Robotics: ITechDefinition = { name: () => t(L.Robotics), column: 24 };
//    SocialNetwork: ITechDefinition = { name: () => t(L.SocialNetwork), column: 24 };
//    Smartphone: ITechDefinition = { name: () => t(L.Smartphone), column: 24 };
//    UniversalHealthcare: ITechDefinition = { name: () => t(L.UniversalHealthcare), column: 24 };
//    VentureCapital: ITechDefinition = { name: () => t(L.VentureCapital), column: 24 };

//    ArtificialIntelligence: ITechDefinition = {
//       name: () => t(L.ArtificialIntelligence),
//       column: 25,
//       unlockBuilding: [],
//    };

//    CloudComputing: ITechDefinition = { name: () => t(L.CloudComputing), column: 25 };
//    VirtualReality: ITechDefinition = { name: () => t(L.VirtualReality), column: 25 };
//    Cryptocurrency: ITechDefinition = { name: () => t(L.Cryptocurrency), column: 25 };
// }

// export type Tech = keyof TechDefinitions;

// export const TechUnlockDefinitions: Record<Tech, Readonly<Tech[]>> = Object.freeze({
//    Fire: [],
//    Logging: [],
//    Shelter: [],
//    StoneTools: [],
//    Herding: ["Logging", "StoneTools"],
//    Masonry: ["Fire", "StoneTools"],
//    Farming: ["Shelter", "Logging"],
//    Bronze: ["Masonry"],
//    Housing: ["Masonry", "Herding"],
//    Counting: ["Herding", "Farming"],
//    Pictograph: ["Farming"],
//    Metallurgy: ["Bronze"],
//    Stateship: ["Housing"],
//    Geometry: ["Housing", "Counting"],
//    Arithmetic: ["Counting", "Pictograph"],
//    Writing: ["Pictograph"],
//    Iron: ["Metallurgy", "Stateship"],
//    RoadAndWheel: ["Geometry", "Arithmetic", "Stateship"],
//    Astronomy: ["Arithmetic", "Writing"],
//    Shamanism: ["Iron", "RoadAndWheel"],
//    Construction: ["RoadAndWheel"],
//    Music: ["Astronomy", "RoadAndWheel"],
//    Calendar: ["Astronomy"],
//    GoldAndSilver: ["Shamanism"],
//    Engineering: ["Shamanism"],
//    Market: ["Construction"],
//    CityState: ["Construction"],
//    Literature: ["Calendar", "Music"],
//    Currency: ["GoldAndSilver"],
//    Machinery: ["GoldAndSilver", "Engineering"],
//    LandTrade: ["Market", "CityState", "GoldAndSilver"],
//    Politics: ["CityState"],
//    Theater: ["CityState", "Literature"],
//    Architecture: ["Currency", "Machinery"],
//    Democracy: ["Politics", "LandTrade"],
//    Autocracy: ["Politics", "Theater"],
//    Religion: ["Theater"],
//    Geography: ["Architecture"],
//    Physics: ["Architecture"],
//    Discourse: ["Democracy"],
//    Feudalism: ["Autocracy"],
//    Theocracy: ["Autocracy", "Religion"],
//    Education: ["Religion"],
//    Navigation: ["Geography", "Physics"],
//    CivilService: ["Discourse"],
//    RoyalCourt: ["Feudalism"],
//    Cathedral: ["Theocracy"],
//    Printing: ["Education"],
//    Exploration: ["Navigation"],
//    Banking: ["CivilService", "Navigation"],
//    University: ["RoyalCourt", "CivilService"],
//    HolyEmpire: ["RoyalCourt", "Cathedral", "Printing"],
//    Renaissance: ["Printing"],
//    SeaTrade: ["Exploration", "Banking"],
//    Chemistry: ["Banking"],
//    Economics: ["Banking", "University"],
//    Enlightenment: ["University", "HolyEmpire", "Renaissance"],
//    NewtonianPhysics: ["Renaissance"],
//    Steam: ["SeaTrade", "Chemistry", "Economics"],
//    PrivateOwnership: ["Economics"],
//    Republic: ["Economics", "Enlightenment"],
//    Constitution: ["Enlightenment"],
//    Library: ["Enlightenment", "NewtonianPhysics"],
//    Engine: ["Steam"],
//    Capitalism: ["PrivateOwnership", "Republic"],
//    Industrialization: ["Republic", "Constitution"],
//    PublicSchool: ["Constitution", "Library"],
//    Colonialism: ["Engine", "Capitalism"],
//    Factory: ["Capitalism"],
//    Newspaper: ["Industrialization"],
//    Railway: ["Industrialization"],
//    Olympics: ["PublicSchool"],
//    OceanLiner: ["Colonialism", "Factory"],
//    Imperialism: ["Factory"],
//    StockMarket: ["Newspaper", "Railway"],
//    Electricity: ["Railway"],
//    SocialWelfare: ["Railway", "Olympics"],
//    Automobile: ["OceanLiner", "Imperialism"],
//    Marconi: ["StockMarket"],
//    PowerGrid: ["Electricity"],
//    Camera: ["Electricity"],
//    Urbanization: ["Electricity", "SocialWelfare"],
//    Aeroplane: ["Automobile", "Marconi"],
//    AtomTheory: ["PowerGrid"],
//    Movie: ["PowerGrid", "Camera", "Urbanization"],
//    Jet: ["Aeroplane", "AtomTheory"],
//    Medicine: ["AtomTheory"],
//    Hospital: ["AtomTheory"],
//    Greenhouse: ["AtomTheory", "Movie"],
//    Rocket: ["Jet"],
//    Semiconductor: ["Jet", "Medicine"],
//    Vaccine: ["Hospital", "Medicine", "Greenhouse"],
//    Refrigeration: ["Greenhouse"],
//    SpaceProgram: ["Rocket", "Semiconductor"],
//    Television: ["Semiconductor"],
//    Tourism: ["Vaccine", "Semiconductor"],
//    Skyscrapper: ["Vaccine", "Refrigeration"],
//    Computer: ["SpaceProgram", "Television"],
//    Globalization: ["Tourism", "Television"],
//    UnitedNation: ["Tourism"],
//    Metropolitan: ["Skyscrapper"],
//    NuclearFission: ["Computer"],
//    Internet: ["Computer", "Globalization"],
//    Nanotechnology: ["Globalization"],
//    Genetics: ["UnitedNation"],
//    Conglomerate: ["UnitedNation", "Metropolitan"],
//    Robotics: ["NuclearFission", "Internet"],
//    SocialNetwork: ["Internet"],
//    Smartphone: ["Internet", "Nanotechnology"],
//    UniversalHealthcare: ["Genetics"],
//    VentureCapital: ["Conglomerate"],
//    ArtificialIntelligence: ["Robotics", "SocialNetwork"],
//    CloudComputing: ["SocialNetwork"],
//    VirtualReality: ["SocialNetwork", "Smartphone"],
//    Cryptocurrency: ["VentureCapital"],
// });

export {};
