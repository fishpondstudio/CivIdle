import { L, t } from "../utilities/i18n";
import { Resource } from "./ResourceDefinitions";
import { PartialSet, PartialTabulate } from "./TypeDefinitions";

export enum BuildingSpecial {
   HQ,
   WorldWonder,
   NaturalWonder,
}

export interface IBuildingDefinition {
   name: () => string;
   input: PartialTabulate<Resource>;
   construction?: PartialTabulate<Resource>;
   output: PartialTabulate<Resource>;
   vision?: number;
   deposit?: PartialSet<Resource>;
   max?: number;
   wikipedia?: string;
   desc?: () => string;
   special?: BuildingSpecial;
}

export const BUILDING_DEFAULT_VISION = 2;

export class BuildingDefinitions {
   Headquarter: IBuildingDefinition = {
      name: () => t(L.Headquarter),
      input: {},
      output: { Worker: 10 },
      vision: 3,
      max: 0,
      special: BuildingSpecial.HQ,
   };

   Hut: IBuildingDefinition = {
      name: () => t(L.Hut),
      input: {},
      output: { Worker: 1 },
      construction: { Wood: 1 },
   };

   WheatFarm: IBuildingDefinition = {
      name: () => t(L.WheatFarm),
      input: {},
      output: { Wheat: 1 },
      construction: { Wood: 1 },
   };

   FlourMill: IBuildingDefinition = {
      name: () => t(L.FlourMill),
      input: { Wheat: 2 },
      output: { Flour: 1 },
      construction: { Brick: 1, Wood: 1 },
   };

   LivestockFarm: IBuildingDefinition = {
      name: () => t(L.LivestockFarm),
      input: { Wheat: 2 },
      output: { Meat: 1, Milk: 1 },
   };

   Stable: IBuildingDefinition = {
      name: () => t(L.Stable),
      input: { Wheat: 2 },
      output: { Horse: 1 },
   };

   ChariotWorkshop: IBuildingDefinition = {
      name: () => t(L.ChariotWorkshop),
      input: { Horse: 2, Lumber: 2, Copper: 1 },
      output: { Chariot: 1 },
   };

   KnightCamp: IBuildingDefinition = {
      name: () => t(L.KnightCamp),
      input: { Horse: 1, Armor: 1, Sword: 1 },
      output: { Knight: 1 },
   };

   PaperMaker: IBuildingDefinition = {
      name: () => t(L.PaperMaker),
      input: { Wood: 1, Water: 1 },
      output: { Paper: 1 },
   };

   Pizzeria: IBuildingDefinition = {
      name: () => t(L.Pizzeria),
      input: { Water: 1, Flour: 2, Cheese: 1, Meat: 1 },
      output: { Pizza: 1 },
   };

   Bakery: IBuildingDefinition = {
      name: () => t(L.Bakery),
      input: { Water: 1, Flour: 2 },
      output: { Bread: 1 },
   };

   CheeseMaker: IBuildingDefinition = {
      name: () => t(L.CheeseMaker),
      input: { Milk: 2 },
      output: { Cheese: 1 },
   };

   WritersGuild: IBuildingDefinition = {
      name: () => t(L.WritersGuild),
      input: { Paper: 2 },
      output: { Poem: 1 },
   };

   MusiciansGuild: IBuildingDefinition = {
      name: () => t(L.MusiciansGuild),
      input: { Alcohol: 2 },
      output: { Music: 1 },
   };

   ActorsGuild: IBuildingDefinition = {
      name: () => t(L.ActorsGuild),
      input: { Music: 1, Poem: 1 },
      output: { Opera: 2 },
   };

   StoneQuarry: IBuildingDefinition = {
      name: () => t(L.StoneQuarry),
      input: {},
      deposit: { Stone: true },
      output: { Stone: 1 },
      construction: { Wood: 1 },
   };

   LoggingCamp: IBuildingDefinition = {
      name: () => t(L.LoggingCamp),
      input: {},
      deposit: { Wood: true },
      output: { Wood: 1 },
      construction: { Stone: 1 },
   };

   LumberMill: IBuildingDefinition = {
      name: () => t(L.LumberMill),
      input: { Wood: 2 },
      output: { Lumber: 1 },
      construction: { Stone: 1, Wood: 1 },
   };

   Aqueduct: IBuildingDefinition = {
      name: () => t(L.Aqueduct),
      input: {},
      deposit: { Water: true },
      output: { Water: 1 },
      construction: { Stone: 1 },
   };

   FishPond: IBuildingDefinition = {
      name: () => t(L.FishPond),
      input: {},
      deposit: { Water: true },
      output: { Fish: 1 },
      construction: { Brick: 1 },
   };

   OlivePlantation: IBuildingDefinition = {
      name: () => t(L.OlivePlantation),
      input: {},
      output: { Olive: 1 },
      construction: { Wood: 1 },
   };

   CottonPlantation: IBuildingDefinition = {
      name: () => t(L.CottonPlantation),
      input: {},
      output: { Cotton: 1 },
      construction: { Wood: 1 },
   };

   CottonMill: IBuildingDefinition = {
      name: () => t(L.CottonMill),
      input: { Cotton: 2 },
      output: { Cloth: 1 },
   };

   GarmentWorkshop: IBuildingDefinition = {
      name: () => t(L.GarmentWorkshop),
      input: { Cloth: 2 },
      output: { Garment: 1 },
   };

   FurnitureWorkshop: IBuildingDefinition = {
      name: () => t(L.FurnitureWorkshop),
      input: { Lumber: 2, Copper: 1 },
      output: { Furniture: 1 },
   };

   Vineyard: IBuildingDefinition = {
      name: () => t(L.Vineyard),
      input: {},
      output: { Grape: 1 },
      construction: { Wood: 1 },
   };

   OilPress: IBuildingDefinition = {
      name: () => t(L.OilPress),
      input: { Olive: 2 },
      output: { OliveOil: 1 },
      construction: { Brick: 1 },
   };

   Caravansary: IBuildingDefinition = {
      name: () => t(L.Caravansary),
      input: {},
      output: {},
      construction: { Brick: 2 },
   };

   // GarumMaker: IBuildingDefinition = {
   //    name: () => t(L.GarumMaker),
   //    input: { Water: 1, Fish: 1 },
   //    output: { Garum: 1 },
   //    construction: { Brick: 1, Copper: 1 },
   // };

   Blacksmith: IBuildingDefinition = {
      name: () => t(L.Blacksmith),
      input: { Copper: 1, Wood: 1 },
      output: { Tool: 1 },
   };

   IronForge: IBuildingDefinition = {
      name: () => t(L.IronForge),
      input: { Iron: 1 },
      output: { Tool: 1 },
   };

   SwordForge: IBuildingDefinition = {
      name: () => t(L.SwordForge),
      input: { Tool: 2 },
      output: { Sword: 1 },
   };

   Armory: IBuildingDefinition = {
      name: () => t(L.Armory),
      input: { Tool: 2 },
      output: { Armor: 1 },
   };

   Brickworks: IBuildingDefinition = {
      name: () => t(L.Brickworks),
      input: { Stone: 2 },
      output: { Brick: 1 },
   };

   Marbleworks: IBuildingDefinition = {
      name: () => t(L.Marbleworks),
      input: { Stone: 2, Tool: 1 },
      output: { Marble: 1 },
   };

   SiegeWorkshop: IBuildingDefinition = {
      name: () => t(L.SiegeWorkshop),
      input: { Lumber: 2, Iron: 2, Tool: 1 },
      output: { SiegeRam: 1 },
   };

   CaravelBuilder: IBuildingDefinition = {
      name: () => t(L.CaravelBuilder),
      input: { Lumber: 5, Cloth: 2, Tool: 2 },
      output: { Caravel: 1 },
   };

   GalleonBuilder: IBuildingDefinition = {
      name: () => t(L.GalleonBuilder),
      input: { Caravel: 1, Sword: 1, SiegeRam: 1, Armor: 1 },
      output: { Galleon: 1 },
   };

   Castrum: IBuildingDefinition = {
      name: () => t(L.Castrum),
      input: { Sword: 2 },
      output: { Legion: 1 },
      construction: { Sword: 2, Stone: 2 },
   };

   IronMiningCamp: IBuildingDefinition = {
      name: () => t(L.IronMiningCamp),
      input: {},
      deposit: { Iron: true },
      output: { Iron: 1 },
      construction: { Stone: 1 },
   };

   CopperMiningCamp: IBuildingDefinition = {
      name: () => t(L.CopperMiningCamp),
      input: {},
      deposit: { Copper: true },
      output: { Copper: 1 },
      construction: { Brick: 1 },
   };

   GoldMiningCamp: IBuildingDefinition = {
      name: () => t(L.GoldMiningCamp),
      input: {},
      deposit: { Gold: true },
      output: { Gold: 1 },
      construction: { Stone: 1 },
   };

   House: IBuildingDefinition = {
      name: () => t(L.House),
      input: { Wheat: 1, Water: 1 },
      output: { Worker: 4 },
      construction: { Brick: 2 },
   };

   Shrine: IBuildingDefinition = {
      name: () => t(L.Shrine),
      input: { Horse: 1, Alcohol: 1 },
      output: { Faith: 1 },
   };

   Church: IBuildingDefinition = {
      name: () => t(L.Church),
      input: { Music: 1, Poem: 1 },
      output: { Faith: 3 },
   };

   Mosque: IBuildingDefinition = {
      name: () => t(L.Mosque),
      input: { Cheese: 1, Marble: 1 },
      output: { Faith: 3 },
   };

   School: IBuildingDefinition = {
      name: () => t(L.School),
      input: { Pizza: 1, Opera: 1 },
      output: { Science: 100 },
   };

   Cathedral: IBuildingDefinition = {
      name: () => t(L.Cathedral),
      input: { Sword: 1, Armor: 1 },
      output: { Faith: 6 },
   };

   PrintingPress: IBuildingDefinition = {
      name: () => t(L.PrintingPress),
      input: { Paper: 1, Poem: 1 },
      output: { Newspaper: 1 },
   };

   Apartment: IBuildingDefinition = {
      name: () => t(L.Apartment),
      input: { Wheat: 2, Meat: 2, Water: 2 },
      output: { Worker: 16 },
      construction: { Brick: 2, Lumber: 2 },
   };

   Brewery: IBuildingDefinition = {
      name: () => t(L.Brewery),
      input: { Wheat: 1, Water: 1 },
      output: { Alcohol: 1 },
      construction: { Lumber: 1, Brick: 1, Copper: 1 },
   };

   Winery: IBuildingDefinition = {
      name: () => t(L.Winery),
      input: { Grape: 1, Water: 1 },
      output: { Wine: 1 },
      construction: { Stone: 1, Marble: 1 },
   };

   Library: IBuildingDefinition = {
      name: () => t(L.Library),
      input: { Paper: 1 },
      output: { Science: 5 },
      construction: { Marble: 2, Stone: 2 },
   };

   Domus: IBuildingDefinition = {
      name: () => t(L.Domus),
      input: { Alcohol: 1, Meat: 1, Wheat: 1 },
      output: { Worker: 10, Science: 4 },
      construction: { Brick: 1, Iron: 1, Marble: 1 },
   };

   Market: IBuildingDefinition = {
      name: () => t(L.Market),
      input: {},
      output: {},
      construction: { Brick: 2, Copper: 2, Lumber: 2 },
   };

   Warehouse: IBuildingDefinition = {
      name: () => t(L.Warehouse),
      input: {},
      output: {},
      construction: { Brick: 1, Iron: 1 },
   };

   Statistics: IBuildingDefinition = {
      name: () => t(L.Statistics),
      desc: () => t(L.StatisticsDesc),
      input: {},
      output: {},
      construction: { Brick: 100, Wood: 100, Lumber: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
   };

   Alps: IBuildingDefinition = {
      name: () => t(L.Alps),
      desc: () => t(L.AlpsDesc),
      input: {},
      output: {},
      construction: {},
      max: 0,
      wikipedia: "Alps",
      special: BuildingSpecial.NaturalWonder,
   };

   Colosseum: IBuildingDefinition = {
      name: () => t(L.Colosseum),
      desc: () => t(L.ColosseumDesc),
      input: {},
      output: {},
      construction: { Brick: 100, Marble: 100, Alcohol: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Colosseum",
   };

   Pantheon: IBuildingDefinition = {
      name: () => t(L.Pantheon),
      desc: () => t(L.PantheonDesc),
      input: {},
      output: {},
      construction: { Marble: 100, Sword: 100, Copper: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Pantheon,_Rome",
   };

   CircusMaximus: IBuildingDefinition = {
      name: () => t(L.CircusMaximus),
      desc: () => t(L.CircusMaximusDesc),
      input: {},
      output: {},
      construction: { Brick: 100, Iron: 100, Meat: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Circus_Maximus",
   };

   Stonehenge: IBuildingDefinition = {
      name: () => t(L.Stonehenge),
      desc: () => t(L.StonehengeDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Stonehenge",
      construction: { Stone: 300 },
   };

   HatshepsutTemple: IBuildingDefinition = {
      name: () => t(L.HatshepsutTemple),
      desc: () => t(L.HatshepsutTempleDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Mortuary_Temple_of_Hatshepsut",
      construction: { Stone: 100, Wood: 100, Copper: 100 },
   };

   // LighthouseOfAlexandria: IBuildingDefinition = {
   //    name: () => t(L.LighthouseOfAlexandria),
   //    desc: () => t(L.LighthouseOfAlexandriaDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Lighthouse_of_Alexandria",
   // };

   PyramidOfGiza: IBuildingDefinition = {
      name: () => t(L.PyramidOfGiza),
      desc: () => t(L.PyramidOfGizaDesc),
      input: {},
      output: {},
      construction: { Brick: 300 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Great_Pyramid_of_Giza",
   };

   // ColossusOfRhodes: IBuildingDefinition = {
   //    name: () => t(L.ColossusOfRhodes),
   //    desc: () => t(L.ColossusOfRhodesDesc),
   //    input: {},
   //    output: {},
   //    construction: { Stone: 300 },
   //    max: 1,
   //    wikipedia: "Colossus_of_Rhodes",
   // };

   HangingGarden: IBuildingDefinition = {
      name: () => t(L.HangingGarden),
      desc: () => t(L.HangingGardenDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Hanging_Gardens_of_Babylon",
   };

   TempleOfHeaven: IBuildingDefinition = {
      name: () => t(L.TempleOfHeaven),
      desc: () => t(L.TempleOfHeavenDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      construction: { Iron: 100, Bread: 100, Cheese: 100 },
      wikipedia: "Temple_of_Heaven",
   };

   Parthenon: IBuildingDefinition = {
      name: () => t(L.Parthenon),
      desc: () => t(L.ParthenonDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      construction: { Marble: 100, Poem: 100, Music: 100 },
      wikipedia: "Parthenon",
   };

   LuxorTemple: IBuildingDefinition = {
      name: () => t(L.LuxorTemple),
      desc: () => t(L.LuxorTempleDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      construction: { Tool: 100, Cloth: 100, Furniture: 100 },
      wikipedia: "Luxor_Temple",
   };

   ChichenItza: IBuildingDefinition = {
      name: () => t(L.ChichenItza),
      desc: () => t(L.ChichenItzaDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      construction: { Stone: 100, Armor: 100, SiegeRam: 100 },
      wikipedia: "Chichen_Itza",
   };

   // GreatDagonPagoda: IBuildingDefinition = {
   //    name: () => t(L.GreatDagonPagoda),
   //    desc: () => t(L.GreatDagonPagodaDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Shwedagon_Pagoda",
   // };

   // MausoleumAtHalicarnassus: IBuildingDefinition = {
   //    name: () => t(L.MausoleumAtHalicarnassus),
   //    desc: () => t(L.MausoleumAtHalicarnassusDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Mausoleum_at_Halicarnassus",
   // };

   // GreatDagonPagoda: IBuildingDefinition = {
   //    name: () => t(L.GreatDagonPagoda),
   //    desc: () => t(L.GreatDagonPagodaDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Shwedagon_Pagoda",
   // };

   // SagradaFamília: IBuildingDefinition = {
   //    name: () => t(L.SagradaFamília),
   //    desc: () => t(L.SagradaFamíliaDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Sagrada_Família",
   // };

   // Petra: IBuildingDefinition = {
   //    name: () => t(L.Petra),
   //    desc: () => t(L.PetraDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Petra",
   // };

   // Borobudur: IBuildingDefinition = {
   //    name: () => t(L.Borobudur),
   //    desc: () => t(L.BorobudurDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Borobudur",
   // };

   // ItsukushimaShrine: IBuildingDefinition = {
   //    name: () => t(L.ItsukushimaShrine),
   //    desc: () => t(L.ItsukushimaShrineDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Itsukushima_Shrine",
   // };

   // TempleOfHeaven: IBuildingDefinition = {
   //    name: () => t(L.TempleOfHeaven),
   //    desc: () => t(L.TempleOfHeavenDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Temple_of_Heaven",
   // };

   // HimejiCastle: IBuildingDefinition = {
   //    name: () => t(L.HimejiCastle),
   //    desc: () => t(L.HimejiCastleDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Himeji_Castle",
   // };

   // StatueOfLiberty: IBuildingDefinition = {
   //    name: () => t(L.StatueOfLiberty),
   //    desc: () => t(L.StatueOfLibertyDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Statue_of_Liberty",
   // };

   // Moai: IBuildingDefinition = {
   //    name: () => t(L.Moai),
   //    desc: () => t(L.MoaiDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Moai",
   // };

   // BranCastle: IBuildingDefinition = {
   //    name: () => t(L.BranCastle),
   //    desc: () => t(L.BranCastleDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Bran_Castle",
   // };

   // SaintBasilsCathedral: IBuildingDefinition = {
   //    name: () => t(L.SaintBasilsCathedral),
   //    desc: () => t(L.SaintBasilsCathedralDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Saint_Basil%27s_Cathedral",
   // };

   // GreatMosqueOfSamarra: IBuildingDefinition = {
   //    name: () => t(L.GreatMosqueOfSamarra),
   //    desc: () => t(L.GreatMosqueOfSamarraDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Great_Mosque_of_Samarra",
   // };

   // HagiaSophia: IBuildingDefinition = {
   //    name: () => t(L.HagiaSophia),
   //    desc: () => t(L.HagiaSophiaDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Hagia_Sophia",
   // };

   // AngkorWat: IBuildingDefinition = {
   //    name: () => t(L.AngkorWat),
   //    desc: () => t(L.AngkorWatDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Angkor_Wat",
   // };

   // TerracottaArmy: IBuildingDefinition = {
   //    name: () => t(L.TerracottaArmy),
   //    desc: () => t(L.TerracottaArmyDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Terracotta_Army",
   // };

   // Persepolis: IBuildingDefinition = {
   //    name: () => t(L.Persepolis),
   //    desc: () => t(L.PersepolisDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Persepolis",
   // };

   // ChoghaZanbil: IBuildingDefinition = {
   //    name: () => t(L.ChoghaZanbil),
   //    desc: () => t(L.ChoghaZanbilDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Chogha_Zanbil",
   // };

   // Neuschwanstein: IBuildingDefinition = {
   //    name: () => t(L.Neuschwanstein),
   //    desc: () => t(L.NeuschwansteinDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Neuschwanstein_Castle",
   // };

   // CristoRedentor: IBuildingDefinition = {
   //    name: () => t(L.CristoRedentor),
   //    desc: () => t(L.CristoRedentorDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Christ_the_Redeemer_(statue)",
   // };

   // GoldenGateBridge: IBuildingDefinition = {
   //    name: () => t(L.GoldenGateBridge),
   //    desc: () => t(L.GoldenGateBridgeDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Golden_Gate_Bridge",
   // };

   // BrandenburgGate: IBuildingDefinition = {
   //    name: () => t(L.BrandenburgGate),
   //    desc: () => t(L.BrandenburgGateDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Brandenburg_Gate",
   // };

   // ArcDeTriomphe: IBuildingDefinition = {
   //    name: () => t(L.ArcDeTriomphe),
   //    desc: () => t(L.ArcDeTriompheDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Arc_de_Triomphe",
   // };

   // SydneyOperaHouse: IBuildingDefinition = {
   //    name: () => t(L.SydneyOperaHouse),
   //    desc: () => t(L.SydneyOperaHouseDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Sydney_Opera_House",
   // };

   // MogaoCaves: IBuildingDefinition = {
   //    name: () => t(L.MogaoCaves),
   //    desc: () => t(L.MogaoCavesDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Mogao_Caves",
   // };
}
export type Building = keyof BuildingDefinitions;
