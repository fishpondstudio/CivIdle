import { notifyGameStateUpdate } from "../Global";
import { getWarehouseIdleCapacity } from "../logic/BuildingLogic";
import { IWarehouseBuildingData, WarehouseOptions } from "../logic/Tile";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { IBuildingComponentProps } from "./PlayerMapPage";
import { ResourceImportComponent } from "./ResourceImportComponent";
import { WarningComponent } from "./WarningComponent";

export function WarehouseBuildingBody({ gameState, xy }: IBuildingComponentProps) {
   const warehouse = gameState.tiles[xy].building as IWarehouseBuildingData;
   if (!warehouse) {
      return null;
   }
   const idleCapacity = getWarehouseIdleCapacity(warehouse);
   return (
      <div className="window-body">
         <BuildingUpgradeComponent gameState={gameState} xy={xy} />
         {gameState.features.WarehouseUpgrade ? (
            <>
               <WarningComponent icon="info">{t(L.WarehouseUpgradeDesc)}</WarningComponent>
               <div className="sep10"></div>
            </>
         ) : null}

         <ResourceImportComponent gameState={gameState} xy={xy} />
         {!gameState.features.WarehouseUpgrade ? null : (
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
                        warehouse.warehouseOptions ^= WarehouseOptions.Autopilot;
                        notifyGameStateUpdate();
                     }}
                  >
                     {warehouse.warehouseOptions & WarehouseOptions.Autopilot ? (
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
