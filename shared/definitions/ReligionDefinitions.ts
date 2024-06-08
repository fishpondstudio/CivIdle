import { L, t } from "../utilities/i18n";
import type { IUpgradeGroup } from "./UpgradeDefinitions";

export class ReligionDefinitions {
   Christianity: IUpgradeGroup = {
      name: () => t(L.ReligionChristianity),
      content: ["Christianity1", "Christianity2", "Christianity3", "Christianity4", "Christianity5"],
   };
   Islam: IUpgradeGroup = {
      name: () => t(L.ReligionIslam),
      content: ["Islam1"],
   };
   Buddhism: IUpgradeGroup = {
      name: () => t(L.ReligionBuddhism),
      content: ["Expansion1", "Expansion2", "Expansion3", "Expansion4"],
   };
   Polytheism: IUpgradeGroup = {
      name: () => t(L.ReligionPolytheism),
      content: ["Honor1", "Honor2", "Honor3", "Honor4"],
   };
}
export type Religion = keyof ReligionDefinitions;
