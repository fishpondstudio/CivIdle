import { L, t } from "../utilities/i18n";
import type { IUpgradeGroup } from "./UpgradeDefinitions";

export class ReligionDefinitions {
   Christianity: IUpgradeGroup = {
      name: () => t(L.ReligionChristianity),
      content: ["Christianity1", "Christianity2", "Christianity3", "Christianity4", "Christianity5"],
   };
   Islam: IUpgradeGroup = {
      name: () => t(L.ReligionIslam),
      content: ["Islam1", "Islam2", "Islam3", "Islam4", "Islam5"],
   };
   Buddhism: IUpgradeGroup = {
      name: () => t(L.ReligionBuddhism),
      content: ["Buddhism1", "Buddhism2", "Buddhism3", "Buddhism4", "Buddhism5"],
   };
   Polytheism: IUpgradeGroup = {
      name: () => t(L.ReligionPolytheism),
      content: ["Polytheism1", "Polytheism2", "Polytheism3", "Polytheism4", "Polytheism5"],
   };
}
export type Religion = keyof ReligionDefinitions;
