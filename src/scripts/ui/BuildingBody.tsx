import { BuildingConsumeComponent } from "./BuildingConsumeComponent";
import { BuildingDepositComponent } from "./BuildingDepositComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProduceComponent } from "./BuildingProduceComponent";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStockpileComponent } from "./BuildingStockpileComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";

export function DefaultBuildingBody({ gameState, xy }: IBuildingComponentProps) {
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <BuildingUpgradeComponent gameState={gameState} xy={xy} />
         <BuildingDepositComponent gameState={gameState} xy={xy} />
         <BuildingConsumeComponent gameState={gameState} xy={xy} />
         <BuildingProduceComponent gameState={gameState} xy={xy} />
         <BuildingWorkerComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingProductionPriorityComponent gameState={gameState} xy={xy} />
         <BuildingStockpileComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </div>
   );
}
