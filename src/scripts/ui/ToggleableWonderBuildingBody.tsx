import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";

export function ToggleWonderBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.ToggleWonderEffect)}</div>
               <div
                  className="pointer"
                  onClick={() => {
                     playClick();
                     if (building.capacity > 0) {
                        building.capacity = 0;
                     } else {
                        building.capacity = 1;
                     }
                     notifyGameStateUpdate();
                  }}
               >
                  {building.capacity > 0 ? (
                     <div className="m-icon text-green">toggle_on</div>
                  ) : (
                     <div className="m-icon text-red">toggle_off</div>
                  )}
               </div>
            </div>
         </fieldset>
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
