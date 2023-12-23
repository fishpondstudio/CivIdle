import { L, t } from "../utilities/i18n";
import { Building } from "./BuildingDefinitions";
import { Deposit } from "./ResourceDefinitions";
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
      buildingNameOverrides: {
         Headquarter: () => t(L.RomanForum),
         Statistics: () => t(L.CensorsOffice),
      },
      naturalWonders: { Alps: true },
   };
}

export type City = keyof CityDefinitions;

interface ICityDefinition {
   deposits: Record<Deposit, number>;
   size: number;
   name: () => string;
   buildingNameOverrides: Partial<Record<Building, () => string>>;
   naturalWonders: PartialSet<Building>;
}
