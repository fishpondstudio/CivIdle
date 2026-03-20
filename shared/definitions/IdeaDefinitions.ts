import { Config } from "../logic/Config";
import { GlobalMultiplierNames } from "../logic/TickLogic";
import { forEach } from "../utilities/Helper";
import type { Upgrade } from "./UpgradeDefinitions";

export interface IdeaConfig {
   upgrade: Upgrade;
}

export interface IdeaDefinition<T> extends IdeaConfig {
   requires: T[];
}

export class CarthaginianIdeasDefinitions {
   RiseOfPunic: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "RiseOfPunic",
      requires: [],
   };
   PhoenicianAlphabet: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "PhoenicianAlphabet",
      requires: ["RiseOfPunic"],
   };
   HillfortSettlements: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "HillfortSettlements",
      requires: ["RiseOfPunic"],
   };
   PunicCoinage: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "PunicCoinage",
      requires: ["RitualSanctuaries"],
   };
   RitualSanctuaries: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "RitualSanctuaries",
      requires: ["PhoenicianAlphabet"],
   };
   IrrigatedEstate: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "IrrigatedEstate",
      requires: ["RitualSanctuaries"],
   };
   GranaryAdministration: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "GranaryAdministration",
      requires: ["IrrigatedEstate"],
   };
   HarborWarehouse: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "HarborWarehouse",
      requires: ["GranaryAdministration"],
   };
   PunicLegalCodex: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "PunicLegalCodex",
      requires: ["CouncilOfElders"],
   };
   TreatyDiplomacy: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "TreatyDiplomacy",
      requires: ["AlpineLogistics"],
   };
   WarElephants: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "WarElephants",
      requires: ["HillfortSettlements"],
   };
   HannibalStrategy: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "HannibalStrategy",
      requires: ["WarElephants"],
   };
   MerchantFleet: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "MerchantFleet",
      requires: ["PunicCoinage"],
   };
   CaravansaryNetwork: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "CaravansaryNetwork",
      requires: ["MerchantFleet"],
   };
   MediterraneanTrades: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "MediterraneanTrades",
      requires: ["CaravansaryNetwork"],
   };
   CouncilOfElders: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "CouncilOfElders",
      requires: ["HarborWarehouse"],
   };
   SuffeteAdministration: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "SuffeteAdministration",
      requires: ["CothonDockyards"],
   };
   BerberAlliance: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "BerberAlliance",
      requires: ["TreatyDiplomacy"],
   };
   SacredBand: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "SacredBand",
      requires: ["WarElephants"],
   };
   NavalSiegecraft: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "NavalSiegecraft",
      requires: ["SacredBand"],
   };
   CothonDockyards: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "CothonDockyards",
      requires: ["NavalSiegecraft"],
   };
   PurpleDyeMonopoly: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "PurpleDyeMonopoly",
      requires: ["CaravansaryNetwork"],
   };
   PunicGoldenAge: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "PunicGoldenAge",
      requires: ["PurpleDyeMonopoly"],
   };
   IberianColonies: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "IberianColonies",
      requires: ["MediterraneanTrades"],
   };
   AlpineLogistics: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "AlpineLogistics",
      requires: ["PincerMovement"],
   };
   PincerMovement: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "PincerMovement",
      requires: ["HannibalStrategy"],
   };
   MercenaryCommand: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "MercenaryCommand",
      requires: ["AlpineLogistics"],
   };
   ExarchateOfAfrica: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "ExarchateOfAfrica",
      requires: ["SuffeteAdministration"],
   };
   ChurchOfCarthage: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "ChurchOfCarthage",
      requires: ["HarborWarehouse"],
   };
   MedinaOfTunis: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "MedinaOfTunis",
      requires: ["CothonDockyards"],
   };
   ProvinceOfIfriqiya: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "ProvinceOfIfriqiya",
      requires: ["MercenaryCommand"],
   };
   HafsidDynasty: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "HafsidDynasty",
      requires: ["MedinaOfTunis"],
   };
   AcropoliumOfCarthage: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "AcropoliumOfCarthage",
      requires: ["ChurchOfCarthage"],
   };
}

export type CarthaginianIdea = keyof CarthaginianIdeasDefinitions;
export const CarthaginianIdeas = new CarthaginianIdeasDefinitions();

export function getIdeaDesc(upgrade: Upgrade): string {
   const result: string[] = [];
   const config = Config.Upgrade[upgrade];
   forEach(config.globalMultiplier, (key, value) => {
      result.push(`+${value} ${GlobalMultiplierNames[key]()}`);
   });
   config.additionalUpgrades?.().forEach((upgrade) => {
      result.push(upgrade);
   });
   return result.join(", ");
}
