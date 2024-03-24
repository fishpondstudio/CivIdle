import type { PartialSet } from "../utilities/TypeDefinitions";
import { L, t } from "../utilities/i18n";
import type { Building } from "./BuildingDefinitions";
import type { Deposit } from "./ResourceDefinitions";
import type { Tech } from "./TechDefinitions";

export class CityDefinitions {
   Rome: ICityDefinition = {
      name: () => t(L.Rome),
      deposits: {
         Water: 0.02,
         Copper: 0.02,
         Iron: 0.02,
         Wood: 0.02,
         Stone: 0.02,
         Gold: 0.02,
         Coal: 0.02,
         Oil: 0.02,
         Aluminum: 0.02,
         NaturalGas: 0.02,
         Uranium: 0.02,
      },
      size: 40,
      buildingNames: {
         Headquarter: () => t(L.RomanForum),
         Statistics: () => t(L.CensorsOffice),
      },
      uniqueBuildings: {
         CircusMaximus: "CivilService",
         Colosseum: "Theater",
      },
      naturalWonders: { Alps: true, GrottaAzzurra: true },
   };
   Athens: ICityDefinition = {
      name: () => t(L.Athens),
      deposits: {
         Water: 0.01,
         Copper: 0.03,
         Iron: 0.01,
         Wood: 0.01,
         Stone: 0.04,
         Gold: 0.01,
         Coal: 0.03,
         Oil: 0.02,
         Aluminum: 0.02,
         NaturalGas: 0.03,
         Uranium: 0.01,
      },
      size: 40,
      buildingNames: {
         Headquarter: () => t(L.Acropolis),
      },
      uniqueBuildings: { StatueOfZeus: "Theater", Parthenon: "Democracy" },
      naturalWonders: { Aphrodite: true, Poseidon: true },
   };
   Memphis: ICityDefinition = {
      name: () => t(L.Memphis),
      deposits: {
         Water: 0.01,
         Copper: 0.01,
         Iron: 0.025,
         Wood: 0.025,
         Stone: 0.025,
         Gold: 0.025,
         Coal: 0.025,
         Oil: 0.01,
         Aluminum: 0.025,
         NaturalGas: 0.015,
         Uranium: 0.025,
      },
      size: 50,
      buildingNames: {
         Headquarter: () => t(L.TempleOfPtah),
      },
      uniqueBuildings: {
         AbuSimbel: "Housing",
         GreatSphinx: "Arithmetic",
      },
      naturalWonders: { NileRiver: true, MountSinai: true },
   };
}

export type City = keyof CityDefinitions;

interface ICityDefinition {
   deposits: Record<Deposit, number>;
   size: number;
   name: () => string;
   naturalWonders: PartialSet<Building>;
   buildingNames: Partial<Record<Building, () => string>>;
   uniqueBuildings: Partial<Record<Building, Tech>>;
}
