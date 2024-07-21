import { L, t } from "../utilities/i18n";
import type { IUpgradeGroup } from "./UpgradeDefinitions";

export class IdeologyDefinitions {
   Liberalism: IUpgradeGroup = {
      name: () => t(L.Liberalism),
      content: ["Liberalism1", "Liberalism2", "Liberalism3", "Liberalism4", "Liberalism5"],
   };
   Conservatism: IUpgradeGroup = {
      name: () => t(L.Conservatism),
      content: ["Conservatism1", "Conservatism2", "Conservatism3", "Conservatism4", "Conservatism5"],
   };
   Socialism: IUpgradeGroup = {
      name: () => t(L.Socialism),
      content: ["Socialism1", "Socialism2", "Socialism3", "Socialism4", "Socialism5"],
   };
   Communism: IUpgradeGroup = {
      name: () => t(L.Communism),
      content: ["Communism1", "Communism2", "Communism3", "Communism4", "Communism5"],
   };
}
export type Ideology = keyof IdeologyDefinitions;
