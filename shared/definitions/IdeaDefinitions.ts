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
      desc: () => "+1 Science from Idle and Busy workers",
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
   RitualSanctuaries: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Ritual Sanctuaries",
      desc: () => "+5 Happiness",
      requires: ["PhoenicianAlphabet"],
   };
   PunicCoinage: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Punic Coinage",
      desc: () => "+1 Building Level Boost for all buildings",
      requires: ["PhoenicianAlphabet"],
   };
   WarElephants: IdeaDefinition<CarthaginianIdea> = {
      name: () => "War Elephants",
      desc: () => "+5 Builder Capacity",
      requires: ["HillfortSettlements"],
   };
   HannibalStrategy: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Hannibal's Strategy",
      desc: () => "-5% Research Cost",
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
      requires: ["RitualSanctuaries"],
   };
   SacredBand: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Sacred Band",
      desc: () => "+2 Building Level Boost for all buildings",
      requires: ["HannibalStrategy"],
   };
   CothonDockyards: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Cothon Dockyards",
      desc: () => "+100% Base Storage for Market, Warehouse and Caravansary",
      requires: ["HannibalStrategy"],
   };
   PurpleDyeMonopoly: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Purple Dye Monopoly",
      desc: () => "+10 Happiness",
      requires: ["MediterraneanTrades", "CaravansaryNetwork"],
   };
   PunicGoldenAge: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Punic Golden Age",
      desc: () => "-10% Research Cost",
      requires: ["PurpleDyeMonopoly"],
   };
   AlpineLogistics: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Alpine Logistics",
      desc: () => "+5 Storage Multiplier for all buildings",
      requires: ["CothonDockyards"],
   };
   MercenaryCommand: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Mercenary Command",
      desc: () => "+2 Production Multiplier for all buildings",
      requires: ["SacredBand"],
   };
   FleetSyndicates: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Fleet Syndicates",
      desc: () => "+10 Builder Capacity",
      requires: ["PunicGoldenAge"],
   };
}

export type CarthaginianIdea = keyof CarthaginianIdeasDefinitions;
export const CarthaginianIdeas = new CarthaginianIdeasDefinitions();
