import { notifyGameStateUpdate } from "../Global";
import { getWarehouseIdleCapacity } from "../logic/BuildingLogic";
import { GameFeature, hasFeature } from "../logic/FeatureLogic";
import type { IWarehouseBuildingData} from "../logic/Tile";
import { WarehouseOptions } from "../logic/Tile";
import { hasFlag, toggleFlag } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { ResourceImportComponent } from "./ResourceImportComponent";
import { WarningComponent } from "./WarningComponent";

export function WarehouseBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const warehouse = gameState.tiles[xy].building as IWarehouseBuildingData;
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
         {!hasFeature(GameFeature.WarehouseUpgrade, gameState) ? null : (
            <fieldset>
               <legend>{t(L.WarehouseSettings)}</legend>
               <div className="row">
                  <div className="f1">
                     {t(L.WarehouseSettingsAutopilot)}
                     <div className="text-small text-desc">
                        {t(L.WarehouseSettingsAutopilotDesc, { capacity: idleCapacity })}
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
