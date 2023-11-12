import { isWorldOrNaturalWonder } from "../logic/BuildingLogic";
import { Tick } from "../logic/TickLogic";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";

export function BuildingDescriptionComponent({ gameState, xy }: IBuildingComponentProps) {
   const type = gameState.tiles[xy].building?.type;
   if (!type) {
      return null;
   }
   const building = Tick.current.buildings[type];
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
