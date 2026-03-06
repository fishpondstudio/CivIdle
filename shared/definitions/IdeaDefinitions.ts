export interface IdeaConfig {
   name: () => string;
   desc: () => string;
}

export interface IdeaDefinition<T> extends IdeaConfig {
   parent: T | null;
}

export class CarthaginianIdeasDefinitions {
   RiseOfPunic: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Rise of Punic",
      desc: () => "+1 Science From Idle Workers",
      parent: null,
   };
   PhoenicianAlphabet: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Phoenician Alphabet",
      desc: () => "+1 Production Multiplier for all buildings",
      parent: "RiseOfPunic",
   };
   HillfortSettlements: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Hillfort Settlements",
      desc: () => "+5 Storage Multiplier for all buildings",
      parent: "RiseOfPunic",
   };
   RitualSanctuaries: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Ritual Sanctuaries",
      desc: () => "-10% Research Cost",
      parent: "PhoenicianAlphabet",
   };
   HannibalSpirit: IdeaDefinition<CarthaginianIdea> = {
      name: () => "Hannibal Spirit",
      desc: () => "-10% Research Cost",
      parent: "PhoenicianAlphabet",
   };
}

export type CarthaginianIdea = keyof CarthaginianIdeasDefinitions;
export const CarthaginianIdeas = new CarthaginianIdeasDefinitions();
