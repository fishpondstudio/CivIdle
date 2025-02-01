import type React from "react";
import { formatPercent } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";

export function TowerBridgeBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <fieldset>
            <legend>{t(L.ProgressTowardsTheNextGreatPerson)}</legend>
            <ProgressBarComponent progress={(building.resources.Cycle ?? 0) / 3600}></ProgressBarComponent>
            <div className="row mt5 text-desc">
               <div>{formatPercent((building.resources.Cycle ?? 0) / 3600)}</div>
               <div className="f1"></div>
               <div>
                  <FormatNumber value={building.resources.Cycle ?? 0} />
                  /3600
               </div>
            </div>
         </fieldset>
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
