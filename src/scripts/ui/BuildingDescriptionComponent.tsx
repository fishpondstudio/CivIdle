import { isWorldOrNaturalWonder } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { L, t } from "../../../shared/utilities/i18n";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingDescriptionComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const type = gameState.tiles.get(xy)?.building?.type;
   if (!type) {
      return null;
   }
   const building = Config.Building[type];
   if (!building.desc) {
      return null;
   }
   return (
      <fieldset>
         {isWorldOrNaturalWonder(type) ? <legend>{t(L.Wonder)}</legend> : null}
         {building.desc()}
      </fieldset>
   );
}
