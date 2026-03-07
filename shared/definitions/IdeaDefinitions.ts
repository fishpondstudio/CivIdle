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
      requires: ["PhoenicianAlphabet"],
   };
   RitualSanctuaries: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "RitualSanctuaries",
      requires: ["PhoenicianAlphabet"],
   };
   IrrigatedEstate: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "IrrigatedEstate",
      requires: ["RitualSanctuaries"],
   };
   HarborWarehouse: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "HarborWarehouse",
      requires: ["IrrigatedEstate"],
   };
   PunicLegalCodex: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "PunicLegalCodex",
      requires: ["HarborWarehouse"],
   };
   TreatyDiplomacy: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "TreatyDiplomacy",
      requires: ["PunicLegalCodex"],
   };
   WarElephants: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "WarElephants",
      requires: ["HillfortSettlements"],
   };
   HannibalStrategy: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "HannibalStrategy",
      requires: ["WarElephants"],
   };
   CaravansaryNetwork: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "CaravansaryNetwork",
      requires: ["PunicCoinage"],
   };
   MediterraneanTrades: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "MediterraneanTrades",
      requires: ["PunicCoinage"],
   };
   CouncilOfElders: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "CouncilOfElders",
      requires: ["MediterraneanTrades"],
   };
   SuffeteAdministration: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "SuffeteAdministration",
      requires: ["CouncilOfElders"],
   };
   BerberAlliance: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "BerberAlliance",
      requires: ["SuffeteAdministration"],
   };
   SacredBand: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "SacredBand",
      requires: ["HannibalStrategy"],
   };
   CothonDockyards: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "CothonDockyards",
      requires: ["HannibalStrategy"],
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
      requires: ["PunicGoldenAge"],
   };
   AlpineLogistics: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "AlpineLogistics",
      requires: ["SacredBand"],
   };
   MercenaryCommand: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "MercenaryCommand",
      requires: ["CothonDockyards"],
   };
   ExarchateOfAfrica: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "ExarchateOfAfrica",
      requires: ["IberianColonies", "BerberAlliance"],
   };
   ChurchOfCarthage: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "ChurchOfCarthage",
      requires: ["TreatyDiplomacy"],
   };
   MedinaOfTunis: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "MedinaOfTunis",
      requires: ["MercenaryCommand", "AlpineLogistics"],
   };
   ProvinceOfIfriqiya: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "ProvinceOfIfriqiya",
      requires: ["MedinaOfTunis"],
   };
   HafsidDynasty: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "HafsidDynasty",
      requires: ["MedinaOfTunis"],
   };
   AcropoliumOfCarthage: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "AcropoliumOfCarthage",
      requires: ["ChurchOfCarthage", "ExarchateOfAfrica"],
   };
   HusainidDynasty: IdeaDefinition<CarthaginianIdea> = {
      upgrade: "HusainidDynasty",
      requires: ["HafsidDynasty"],
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
