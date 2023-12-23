import { L, t } from "../utilities/i18n";
import { Building, BuildingDefinitions } from "./BuildingDefinitions";
import { Deposit, ResourceDefinitions } from "./ResourceDefinitions";
import { TechDefinitions } from "./TechDefinitions";
import { PartialSet } from "./TypeDefinitions";

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
      },
      size: 40,
      override: (resource, building, tech) => {
         building.Headquarter.name = () => t(L.RomanForum);
         building.Statistics.name = () => t(L.CensorsOffice);
      },
      naturalWonders: { Alps: true },
   };
}

export type City = keyof CityDefinitions;

interface ICityDefinition {
   deposits: Record<Deposit, number>;
   size: number;
   name: () => string;
   override: (resource: ResourceDefinitions, building: BuildingDefinitions, tech: TechDefinitions) => void;
   naturalWonders: PartialSet<Building>;
}
