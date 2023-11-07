import { notifyGameOptionsUpdate, useGameOptions } from "../Global";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";

export function BuildingColorComponent({ gameState, xy }: IBuildingComponentProps) {
   const tile = gameState.tiles[xy];
   const building = tile.building;
   if (!building) {
      return null;
   }
   const gameOptions = useGameOptions();
   return (
      <fieldset>
         <div className="row">
            <div className="f1">{t(L.BuildingColor)}</div>
            <div>
               <input
                  type="color"
                  value={gameOptions.buildingColors[building.type] ?? "#ffffff"}
                  onChange={(v) => {
                     gameOptions.buildingColors[building.type] = v.target.value;
                     notifyGameOptionsUpdate();
                  }}
               />
            </div>
         </div>
      </fieldset>
   );
}
