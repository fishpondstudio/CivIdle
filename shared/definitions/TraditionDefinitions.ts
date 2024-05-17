import { L, t } from "../utilities/i18n";
import type { Upgrade } from "./UpgradeDefinitions";

export class TraditionDefinitions {
   Cultivation: ITradition = {
      name: () => t(L.TraditionCultivation),
      content: ["Cultivation1", "Cultivation2", "Cultivation3", "Cultivation4"],
   };
   Commerce: ITradition = {
      name: () => t(L.TraditionCommerce),
      content: ["Commerce1", "Commerce2", "Commerce3", "Commerce4"],
   };
   Expansion: ITradition = {
      name: () => t(L.TraditionExpansion),
      content: ["Expansion1", "Expansion2", "Expansion3", "Expansion4"],
   };
   Honor: ITradition = {
      name: () => t(L.TraditionHonor),
      content: ["Honor1", "Honor2", "Honor3", "Honor4"],
   };
}

export type Tradition = keyof TraditionDefinitions;
export type ITradition = { name: () => string; content: [Upgrade, Upgrade, Upgrade, Upgrade] };
