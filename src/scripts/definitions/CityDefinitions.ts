import { Config } from "../logic/Config";
import type { GameState } from "../logic/GameState";
import { forEach } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import type { Building } from "./BuildingDefinitions";
import type { Deposit } from "./ResourceDefinitions";
import type { Tech } from "./TechDefinitions";
import type { PartialSet } from "./TypeDefinitions";

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
      },
      size: 40,
      buildingNames: {
         Headquarter: () => t(L.Acropolis),
         Statistics: () => t(L.StatisticsOffice),
      },
      uniqueBuildings: { StatueOfZeus: "Theater", Parthenon: "Democracy" },
      naturalWonders: { Aphrodite: true, Poseidon: true },
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

// This method is called early during bootstrap!
export function setCityOverride(gameState: GameState) {
   const city = Config.City[gameState.city];
   forEach(city.buildingNames, (b, name) => {
      Config.Building[b].name = name;
   });
   forEach(city.uniqueBuildings, (building, tech) => {
      if (!Config.Tech[tech].unlockBuilding) {
         Config.Tech[tech].unlockBuilding = [];
      }
      Config.Tech[tech].unlockBuilding!.push(building);
   });
}
