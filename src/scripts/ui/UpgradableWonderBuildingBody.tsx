import { getWonderExtraLevel } from "../../../shared/logic/BuildingLogic";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { SpaceshipIdleComponent } from "./SpaceshipIdleComponent";
import { UpgradeableWonderComponent } from "./UpgradeableWonderComponent";

export function UpgradableWonderBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const [extraLevel, greatPerson] = getWonderExtraLevel(building.type);
   return (
      <div className="window-body">
         <SpaceshipIdleComponent gameState={gameState} type={building.type} />
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <UpgradeableWonderComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
