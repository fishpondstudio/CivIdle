import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import type { IDinosaurProvincialParkBuildingData } from "../../../shared/logic/Tile";
import { formatNumber } from "../../../shared/utilities/Helper";
import { playClick, playError } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";

export function DinosaurProvincialParkBuildingBody({
   gameState,
   xy,
}: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IDinosaurProvincialParkBuildingData;
   if (!building) {
      return null;
   }
   const koti = (Tick.current.totalValue * 0.25) / (Config.MaterialPrice.Koti ?? 1);
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         {building.used ? (
            <fieldset>
               <div className="row">
                  <div className="f1">{Config.Material.Koti.name()}</div>
                  <div className="text-strong">{formatNumber(building.resources.Koti)}</div>
               </div>
            </fieldset>
         ) : (
            <button
               className="w100 mb10"
               onClick={() => {
                  if (building.used) {
                     playError();
                     return;
                  }
                  building.resources.Koti = koti;
                  building.used = true;
                  notifyGameStateUpdate();
                  playClick();
               }}
            >
               + {formatNumber(koti)} {Config.Material.Koti.name()}
            </button>
         )}
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
