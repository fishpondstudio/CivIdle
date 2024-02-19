import { getWarehouseIdleCapacity } from "../../../shared/logic/BuildingLogic";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import type { IWarehouseBuildingData } from "../../../shared/logic/Tile";
import { WarehouseOptions } from "../../../shared/logic/Tile";
import { formatNumber, hasFlag, toggleFlag } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { ResourceImportComponent } from "./ResourceImportComponent";
import { WarningComponent } from "./WarningComponent";

export function WarehouseBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const warehouse = gameState.tiles.get(xy)?.building as IWarehouseBuildingData;
   if (!warehouse) {
      return null;
   }
   const idleCapacity = getWarehouseIdleCapacity(warehouse);
   return (
      <div className="window-body">
         <BuildingUpgradeComponent gameState={gameState} xy={xy} />
         {hasFeature(GameFeature.WarehouseUpgrade, gameState) ? (
            <>
               <WarningComponent icon="info">{t(L.WarehouseUpgradeDesc)}</WarningComponent>
               <div className="sep10"></div>
            </>
         ) : null}
         <ResourceImportComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent gameState={gameState} xy={xy} />
         {!hasFeature(GameFeature.WarehouseUpgrade, gameState) ? null : (
            <fieldset>
               <legend>{t(L.WarehouseSettings)}</legend>
               <div className="row">
                  <div className="f1">
                     {t(L.WarehouseSettingsAutopilot)}
                     <div className="text-small text-desc">
                        {t(L.WarehouseSettingsAutopilotDesc, { capacity: formatNumber(idleCapacity) })}
                     </div>
                  </div>
                  <div
                     className="pointer"
                     onClick={() => {
                        playClick();
                        warehouse.warehouseOptions = toggleFlag(
                           warehouse.warehouseOptions,
                           WarehouseOptions.Autopilot,
                        );
                        notifyGameStateUpdate();
                     }}
                  >
                     {hasFlag(warehouse.warehouseOptions, WarehouseOptions.Autopilot) ? (
                        <div className="m-icon text-green">toggle_on</div>
                     ) : (
                        <div className="m-icon text-desc">toggle_off</div>
                     )}
                  </div>
               </div>
               <div className="sep5"></div>
            </fieldset>
         )}
         <BuildingWorkerComponent gameState={gameState} xy={xy} />
         <BuildingProductionPriorityComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </div>
   );
}
