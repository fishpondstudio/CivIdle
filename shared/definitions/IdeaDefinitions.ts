export interface IdeaConfig {
   name: () => string;
   desc: () => string;
}

export interface IdeaDefinition<T> extends IdeaConfig {
   requires: T[];
}

export class CarthaginianIdeasDefinitions {
   RiseOfPunic: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Rise of Punic",
      desc: () => "+1 Science From Busy Workers",
      requires: [],
   };
   PhoenicianAlphabet: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Phoenician Alphabet",
      desc: () => "+1 Production Multiplier for all buildings",
      requires: ["RiseOfPunic"],
   };
   HillfortSettlements: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Hillfort Settlements",
      desc: () => "+5 Storage Multiplier for all buildings",
      requires: ["RiseOfPunic"],
   };
   PunicCoinage: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Punic Coinage",
      desc: () => "+1 Building Level Boost for all buildings",
      requires: ["PhoenicianAlphabet"],
   };
   RitualSanctuaries: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Ritual Sanctuaries",
      desc: () => "+5 Happiness",
      requires: ["PhoenicianAlphabet"],
   };
   IrrigatedEstate: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Irrigated Estate",
      desc: () => "Generate one-time science equal to the cheapest technology of the current age",
      requires: ["RitualSanctuaries"],
   };
   HarborWarehouse: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Harbor Warehouse",
      desc: () => "+100% Base Storage for Market, Warehouse and Caravansary",
      requires: ["IrrigatedEstate"],
   };
   PunicLegalCodex: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Punic Legal Codex",
      desc: () => "+5 Builder Capacity",
      requires: ["HarborWarehouse"],
   };
   TreatyDiplomacy: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Treaty Diplomacy",
      desc: () => "+5 Storage Multiplier for all buildings",
      requires: ["HarborWarehouse"],
   };
   WarElephants: IdeaDefinition<CarthaginianIdea> = {
      name: () => "War Elephants",
      desc: () => "+5 Builder Capacity",
      requires: ["HillfortSettlements"],
   };
   HannibalStrategy: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Hannibal's Strategy",
      desc: () => "Generate one-time Koti equal to 10% of the total building value",
      requires: ["WarElephants"],
   };
   CaravansaryNetwork: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Caravansary Network",
      desc: () => "+100% Base Storage for Market, Warehouse and Caravansary",
      requires: ["PunicCoinage"],
   };
   MediterraneanTrades: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Mediterranean Trades",
      desc: () => "+5 Storage Multiplier for all buildings",
      requires: ["PunicCoinage"],
   };
   CouncilOfElders: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Council of Elders",
      desc: () => "+1 Science from Idle Workers, +2 Science from Busy Workers",
      requires: ["MediterraneanTrades"],
   };
   SuffeteAdministration: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Suffete Administration",
      desc: () => "+2 Building Level Boost for all buildings",
      requires: ["CouncilOfElders"],
   };
   BerberAlliance: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Berber Alliance",
      desc: () => "+5 Great Person from the current age",
      requires: ["CouncilOfElders"],
   };
   SacredBand: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Sacred Band",
      desc: () => "-5% Research Cost",
      requires: ["HannibalStrategy"],
   };
   CothonDockyards: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Cothon Dockyards",
      desc: () => "+5 Builder Capacity",
      requires: ["HannibalStrategy"],
   };
   PurpleDyeMonopoly: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Purple Dye Monopoly",
      desc: () => "+10 Happiness",
      requires: ["CaravansaryNetwork"],
   };
   PunicGoldenAge: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Punic Golden Age",
      desc: () => "-10% Research Cost",
      requires: ["PurpleDyeMonopoly"],
   };
   IberianColonies: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Iberian Colonies",
      desc: () => "Generate one-time warp that refills all available warp storage",
      requires: ["PurpleDyeMonopoly"],
   };
   AlpineLogistics: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Alpine Logistics",
      desc: () => "+5 Transport Capacity Multiplier",
      requires: ["SacredBand"],
   };
   MercenaryCommand: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Mercenary Command",
      desc: () => "+2 Production Multiplier for all buildings",
      requires: ["CothonDockyards"],
   };
   ExarchateOfAfrica: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Exarchate of Africa",
      desc: () => "+10 Storage Multiplier for all buildings",
      requires: ["PunicGoldenAge", "IberianColonies", "SuffeteAdministration"],
   };
   ChurchOfCarthage: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Church of Carthage",
      desc: () => "+15 Happiness",
      requires: ["AlpineLogistics", "PunicLegalCodex", "TreatyDiplomacy", "BerberAlliance"],
   };
   MedinaOfTunis: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Medina of Tunis",
      desc: () => "Generate one-time science equal to the cost of the cheapest technology of the current age",
      requires: ["MercenaryCommand", "AlpineLogistics"],
   };
   ProvinceOfIfriqiya: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Province of Ifriqiya",
      desc: () => "+3 Building Level Boost for all buildings",
      requires: ["MedinaOfTunis"],
   };
   HafsidDynasty: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Hafsid Dynasty",
      desc: () => "+2 Science from Idle Workers, +3 Science from Busy Workers",
      requires: ["MedinaOfTunis"],
   };
   AcropoliumOfCarthage: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Acropolium of Carthage",
      desc: () => "Generate one-time Koti equal to 5% of the total empire value",
      requires: ["ChurchOfCarthage", "ExarchateOfAfrica"],
   };
   HusainidDynasty: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Husainid Dynasty",
      desc: () => "+3 Production Multiplier for all buildings",
      requires: ["HafsidDynasty"],
   };
}

export type CarthaginianIdea = keyof CarthaginianIdeasDefinitions;
export const CarthaginianIdeas = new CarthaginianIdeasDefinitions();
