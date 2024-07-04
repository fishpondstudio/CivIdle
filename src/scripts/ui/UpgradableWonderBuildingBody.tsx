import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";

export function UpgradableWonderBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.WonderUpgradeLevel)}</div>
               <div className="text-strong">{building.level}</div>
            </div>
            <div className="separator" />
            <button
               className="jcc w100 row"
               onClick={() => {
                  playClick();
                  building.desiredLevel = building.level + 1;
                  building.status = "upgrading";
                  notifyGameStateUpdate();
               }}
            >
               <div className="m-icon small">assistant_navigation</div>
               <div className="text-strong f1">{t(L.Upgrade)}</div>
            </button>
         </fieldset>
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
