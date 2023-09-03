import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { IBuildingComponentProps } from "./PlayerMapPage";
import { PlayerTradeComponent } from "./PlayerTradeComponent";

export function PlayerTradeBuildingBody({ gameState, xy }: IBuildingComponentProps) {
   return (
      <div className="window-body">
         <PlayerTradeComponent gameState={gameState} xy={xy} />
         <BuildingUpgradeComponent gameState={gameState} xy={xy} />
         <BuildingWorkerComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent gameState={gameState} xy={xy} />
         <BuildingProductionPriorityComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </div>
   );
}
