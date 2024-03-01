import { getTotalBuildingUpgrades } from "../../../shared/logic/BuildingLogic";
import { OXFORD_SCIENCE_PER_UPGRADE } from "../../../shared/logic/Constants";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";

export function OxfordUniversityBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.Science)}</div>
               <div className="text-strong">
                  +<FormatNumber value={OXFORD_SCIENCE_PER_UPGRADE * getTotalBuildingUpgrades(gameState)} />
               </div>
            </div>
         </fieldset>
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
