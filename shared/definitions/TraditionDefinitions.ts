import { L, t } from "../utilities/i18n";
import type { IUpgradeGroup } from "./UpgradeDefinitions";

export class TraditionDefinitions {
   Cultivation: IUpgradeGroup = {
      name: () => t(L.TraditionCultivation),
      content: ["Cultivation1", "Cultivation2", "Cultivation3", "Cultivation4"],
   };
   Commerce: IUpgradeGroup = {
      name: () => t(L.TraditionCommerce),
      content: ["Commerce1", "Commerce2", "Commerce3", "Commerce4"],
   };
   Expansion: IUpgradeGroup = {
      name: () => t(L.TraditionExpansion),
      content: ["Expansion1", "Expansion2", "Expansion3", "Expansion4"],
   };
   Honor: IUpgradeGroup = {
      name: () => t(L.TraditionHonor),
      content: ["Honor1", "Honor2", "Honor3", "Honor4"],
   };
}

export type Tradition = keyof TraditionDefinitions;
