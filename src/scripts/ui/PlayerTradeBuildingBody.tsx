import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingInputModeComponent } from "./BuildingInputModeComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { PlayerTradeComponent } from "./PlayerTradeComponent";
import { ResourceImportComponent } from "./ResourceImportComponent";

export function PlayerTradeBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   return (
      <div className="window-body">
         <BuildingUpgradeComponent gameState={gameState} xy={xy} key={xy} />
         <PlayerTradeComponent gameState={gameState} xy={xy} />
         <ResourceImportComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent gameState={gameState} xy={xy} />
         <BuildingWorkerComponent gameState={gameState} xy={xy} />
         <BuildingProductionPriorityComponent gameState={gameState} xy={xy} />
         <BuildingInputModeComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </div>
   );
}
