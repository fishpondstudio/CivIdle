import { getBuildingCost, getScienceFromWorkers } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { ILouvreBuildingData } from "../../../shared/logic/Tile";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { SpaceshipIdleComponent } from "./SpaceshipIdleComponent";

export function LouvreBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as ILouvreBuildingData;
   if (!building) {
      return null;
   }
   const currentAmount = building.resources.Culture ?? 0;
   const maxAmount = getBuildingCost(building).Culture ?? 0;
   const { workersBusy, workersAfterHappiness } = getScienceFromWorkers(gameState);
   const idleWorkers = workersAfterHappiness - workersBusy;
   const culture = idleWorkers / (Config.ResourcePrice.Culture ?? 1);
   return (
      <div className="window-body">
         <SpaceshipIdleComponent gameState={gameState} type={building.type} />
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.GreatPeople)}</div>
               <div className="text-strong">{building.greatPeopleCount}</div>
            </div>
         </fieldset>
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
