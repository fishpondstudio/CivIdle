import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { IBuildingComponentProps } from "./PlayerMapPage";
import { PlayerTradeComponent } from "./PlayerTradeComponent";
import { ResourceImportComponent } from "./ResourceImportComponent";

export function PlayerTradeBuildingBody({ gameState, xy }: IBuildingComponentProps) {
   return (
      <div className="window-body">
         <BuildingUpgradeComponent gameState={gameState} xy={xy} />
         <PlayerTradeComponent gameState={gameState} xy={xy} />
         <ResourceImportComponent gameState={gameState} xy={xy} />
         <BuildingWorkerComponent gameState={gameState} xy={xy} />
         <BuildingProductionPriorityComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </div>
   );
}
