import { isWorldOrNaturalWonder } from "../logic/BuildingLogic";
import { Config } from "../logic/Config";
import { L, t } from "../utilities/i18n";
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
