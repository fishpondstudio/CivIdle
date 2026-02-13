import { getWonderExtraLevel } from "../../../shared/logic/BuildingLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import type { IItaipuDamBuildingData } from "../../../shared/logic/Tile";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { UpgradeableWonderComponent } from "./UpgradeableWonderComponent";

export function ItaipuDamBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const itaipuDam = building as IItaipuDamBuildingData;
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            <div className="row">
               <div>{t(L.BuildingLevelBoost)}</div>
               <div className="f1"></div>
               <div>{t(L.ProductionMultiplier)}</div>
            </div>
            <div className="row">
               <div className="m-icon" style={{ marginLeft: -8 }}>
                  south
               </div>
               <div className="f1"></div>
               <div className="m-icon" style={{ marginRight: -8 }}>
                  south
               </div>
            </div>
            <div className="row mb10">
               <div className="text-strong">
                  {building.level + getWonderExtraLevel(building.type) - itaipuDam.productionMultiplier}
               </div>
               <div className="f1"></div>
               <div className="text-strong">{itaipuDam.productionMultiplier}</div>
            </div>
            <div>
               <input
                  type="range"
                  min={0}
                  max={building.level + getWonderExtraLevel(building.type)}
                  step={1}
                  value={itaipuDam.productionMultiplier}
                  onChange={(e) => {
                     itaipuDam.productionMultiplier = Number.parseInt(e.target.value);
                     notifyGameStateUpdate();
                  }}
               />
            </div>
         </fieldset>
         <UpgradeableWonderComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
