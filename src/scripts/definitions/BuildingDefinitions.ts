import { L, t } from "../utilities/i18n";
import { Resource } from "./ResourceDefinitions";
import { PartialSet, PartialTabulate } from "./TypeDefinitions";

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
}

export const BUILDING_DEFAULT_VISION = 1;

export class BuildingDefinitions {
   Headquarter: IBuildingDefinition = {
      name: () => t(L.Headquarter),
      input: {},
      output: { Worker: 10 },
      vision: 2,
      max: 1,
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
      output: { Crop: 1 },
      construction: { Wood: 1 },
   };

   OlivePlantation: IBuildingDefinition = {
      name: () => t(L.OlivePlantation),
      input: {},
      output: { Olive: 1 },
      construction: { Wood: 1 },
   };

   Vineyard: IBuildingDefinition = {
      name: () => t(L.Vineyard),
      input: {},
      output: { Grape: 1 },
      construction: { Wood: 1 },
   };

   LivestockFarm: IBuildingDefinition = {
      name: () => t(L.LivestockFarm),
      input: { Crop: 2 },
      output: { Meat: 1, Milk: 1 },
   };

   PaperMaker: IBuildingDefinition = {
      name: () => t(L.PaperMaker),
      input: { Wood: 1, Water: 1 },
      output: { Paper: 1 },
   };

   CheeseMaker: IBuildingDefinition = {
      name: () => t(L.CheeseMaker),
      input: { Milk: 2 },
      output: { Cheese: 1 },
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
      construction: { Stone: 1, Copper: 1 },
   };

   Aqueduct: IBuildingDefinition = {
      name: () => t(L.Aqueduct),
      input: {},
      deposit: { Water: true },
      output: { Water: 1 },
      construction: { Stone: 1 },
   };

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

   Brickworks: IBuildingDefinition = {
      name: () => t(L.Brickworks),
      input: { Stone: 1, Tool: 1 },
      output: { Brick: 1 },
   };

   Marbleworks: IBuildingDefinition = {
      name: () => t(L.Marbleworks),
      input: { Stone: 2, Tool: 1 },
      output: { Marble: 1 },
   };

   OilPress: IBuildingDefinition = {
      name: () => t(L.OilPress),
      input: { Olive: 2 },
      output: { OliveOil: 1 },
      construction: { Stone: 2 },
   };

   Armory: IBuildingDefinition = {
      name: () => t(L.Armory),
      input: { Tool: 2 },
      output: { Weapon: 1 },
      construction: { Tool: 2, Stone: 2 },
   };

   Castrum: IBuildingDefinition = {
      name: () => t(L.Castrum),
      input: { Weapon: 2 },
      output: { Legion: 1 },
      construction: { Weapon: 2, Stone: 2 },
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
      construction: { Stone: 1 },
   };

   Villa: IBuildingDefinition = {
      name: () => t(L.Villa),
      input: { Crop: 1, Water: 1 },
      output: { Worker: 4 },
      construction: { Brick: 2 },
   };

   Insula: IBuildingDefinition = {
      name: () => t(L.Insula),
      input: { Crop: 2, Meat: 2, Water: 2 },
      output: { Worker: 16 },
      construction: { Marble: 2, Iron: 1 },
   };

   Brewery: IBuildingDefinition = {
      name: () => t(L.Brewery),
      input: { Crop: 1, Water: 1 },
      output: { Alcohol: 1 },
      construction: { Brick: 1, Stone: 1 },
   };

   Winery: IBuildingDefinition = {
      name: () => t(L.Winery),
      input: { Grape: 1, Water: 1 },
      output: { Wine: 1 },
      construction: { Stone: 1, Marble: 1 },
   };

   Library: IBuildingDefinition = {
      name: () => t(L.Library),
      input: { Tool: 1, Alcohol: 1 },
      output: { Science: 20 },
      construction: { Marble: 2, Stone: 2 },
   };

   Domus: IBuildingDefinition = {
      name: () => t(L.Domus),
      input: { Alcohol: 1, Meat: 1, Crop: 1 },
      output: { Worker: 10, Science: 4 },
      construction: { Brick: 1, Iron: 1, Copper: 1, Stone: 1 },
   };

   Market: IBuildingDefinition = {
      name: () => t(L.Market),
      input: {},
      output: {},
      construction: { Brick: 2, Copper: 2, Wood: 2 },
   };

   Colosseum: IBuildingDefinition = {
      name: () => t(L.Colosseum),
      desc: () => t(L.ColosseumDesc),
      input: {},
      output: {},
      construction: { Brick: 1000, Marble: 1000, Alcohol: 1000 },
      max: 1,
      wikipedia: "Colosseum",
   };

   Pantheon: IBuildingDefinition = {
      name: () => t(L.Pantheon),
      desc: () => t(L.PantheonDesc),
      input: {},
      output: {},
      construction: { Marble: 1000, Weapon: 1000, Copper: 1000 },
      max: 1,
      wikipedia: "Pantheon,_Rome",
   };

   CircusMaximus: IBuildingDefinition = {
      name: () => t(L.CircusMaximus),
      desc: () => t(L.CircusMaximusDesc),
      input: {},
      output: {},
      construction: { Brick: 1000, Iron: 1000, Meat: 1000 },
      max: 1,
      wikipedia: "Circus_Maximus",
   };

   // House: IBuildingDefinition = {
   //    name: () => t(L.House),
   //    input: { Crop: 2, Meat: 1 },
   //    output: { Worker: 8 },
   //    construction: { Brick: 1, Tool: 1 },
   // };

   // Stonehenge: IBuildingDefinition = {
   //    name: () => t(L.Stonehenge),
   //    desc: () => t(L.StonehengeDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Stonehenge",
   //    construction: { Stone: 10 },
   // };

   // HatshepsutTemple: IBuildingDefinition = {
   //    name: () => t(L.HatshepsutTemple),
   //    desc: () => t(L.HatshepsutTempleDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Mortuary_Temple_of_Hatshepsut",
   //    construction: { Stone: 10 },
   // };

   // LighthouseOfAlexandria: IBuildingDefinition = {
   //    name: () => t(L.LighthouseOfAlexandria),
   //    desc: () => t(L.LighthouseOfAlexandriaDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Lighthouse_of_Alexandria",
   // };

   // PyramidOfGiza: IBuildingDefinition = {
   //    name: () => t(L.PyramidOfGiza),
   //    desc: () => t(L.PyramidOfGizaDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Great_Pyramid_of_Giza",
   // };

   // ColossusOfRhodes: IBuildingDefinition = {
   //    name: () => t(L.ColossusOfRhodes),
   //    desc: () => t(L.ColossusOfRhodesDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Colossus_of_Rhodes",
   // };

   // MausoleumAtHalicarnassus: IBuildingDefinition = {
   //    name: () => t(L.MausoleumAtHalicarnassus),
   //    desc: () => t(L.MausoleumAtHalicarnassusDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Mausoleum_at_Halicarnassus",
   // };

   // HangingGarden: IBuildingDefinition = {
   //    name: () => t(L.HangingGarden),
   //    desc: () => t(L.HangingGardenDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Hanging_Gardens_of_Babylon",
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

   // ChichenItza: IBuildingDefinition = {
   //    name: () => t(L.ChichenItza),
   //    desc: () => t(L.ChichenItzaDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Chichen_Itza",
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

   // Parthenon: IBuildingDefinition = {
   //    name: () => t(L.Parthenon),
   //    desc: () => t(L.ParthenonDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Parthenon",
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

   // LuxorTemple: IBuildingDefinition = {
   //    name: () => t(L.LuxorTemple),
   //    desc: () => t(L.LuxorTempleDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Luxor_Temple",
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
