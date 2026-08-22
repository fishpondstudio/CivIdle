import { Config } from "../../../shared/logic/Config";
import { SUPERINTEL_SCIENCE_RATIO } from "../../../shared/logic/Constants";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getAllTechUnlockCost, tryDeductScience } from "../../../shared/logic/TechLogic";
import { formatNumber } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { playClick, playError } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";

export function SuperintelligenceBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const totalScience = getAllTechUnlockCost();
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            {building.level > 1 && (
               <div className="row">
                  <div className="f1">{$t(L.ScienceCarryingOver)}</div>
                  <div className="text-strong">{formatNumber(totalScience)}</div>
               </div>
            )}
            {building.level <= 1 && (
               <div className="row">
                  <div className="f1">{$t(L.ResearchCost)}</div>
                  <div className="text-strong">
                     {formatNumber(totalScience * SUPERINTEL_SCIENCE_RATIO)} {Config.Material.Science.name()}
                  </div>
               </div>
            )}
            <div className="separator" />
            <div className="row">
               <button
                  disabled={building.level > 1}
                  className="f1"
                  onClick={() => {
                     if (building.level > 1) {
                        return;
                     }
                     if (!tryDeductScience(totalScience * SUPERINTEL_SCIENCE_RATIO, gameState)) {
                        playError();
                        return;
                     }
                     playClick();
                     ++building.level;
                     notifyGameStateUpdate();
                  }}
               >
                  <div className="row">
                     <div className="m-icon small">psychology</div>
                     <div className="text-strong text-center f1">{$t(L.ResearchSuperintelligence)}</div>
                  </div>
               </button>
            </div>
         </fieldset>
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
