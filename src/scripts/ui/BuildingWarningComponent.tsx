import { BuildingNotProducingReasons } from "../logic/Tile";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";
import { WarningComponent } from "./WarningComponent";

export function BuildingWarningComponent({ xy, gameState }: IBuildingComponentProps) {
   const building = gameState.tiles[xy].building;
   if (!building || !building.notProducingReason) {
      return null;
   }
   return (
      <WarningComponent icon="warning" bottom={10}>
         {t(L.NotProducingReasons, {
            reason: BuildingNotProducingReasons[building.notProducingReason](),
         })}
      </WarningComponent>
   );
}
