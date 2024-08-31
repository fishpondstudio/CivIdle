import Tippy from "@tippyjs/react";
import { getResourceImportIdleCapacity } from "../../../shared/logic/BuildingLogic";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import type { IWarehouseBuildingData } from "../../../shared/logic/Tile";
import { WarehouseOptions } from "../../../shared/logic/Tile";
import { copyFlag, formatNumber, hasFlag, toggleFlag } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { ApplyToAllComponent } from "./ApplyToAllComponent";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingInputModeComponent } from "./BuildingInputModeComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { ResourceImportComponent } from "./ResourceImportComponent";
import { WarningComponent } from "./WarningComponent";

export function WarehouseBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const warehouse = gameState.tiles.get(xy)?.building as IWarehouseBuildingData;
   if (!warehouse) {
      return null;
   }
   const idleCapacity = getResourceImportIdleCapacity(xy, gameState);
   return (
      <div className="window-body">
         <BuildingUpgradeComponent gameState={gameState} xy={xy} key={xy} />
         <ResourceImportComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent gameState={gameState} xy={xy} />
         {hasFeature(GameFeature.WarehouseUpgrade, gameState) ? (
            <>
               <WarningComponent className="mb10 text-small" icon="info">
                  {t(L.WarehouseUpgradeDesc)}
               </WarningComponent>
               <fieldset>
                  <legend>{t(L.WarehouseAutopilotSettings)}</legend>
                  <div className="row">
                     <div>{t(L.WarehouseAutopilotSettingsEnable)}</div>
                     <Tippy
                        content={t(L.WarehouseSettingsAutopilotDesc, {
                           capacity: formatNumber(idleCapacity),
                        })}
                     >
                        <div className="m-icon small ml5 text-desc help-cursor">help</div>
                     </Tippy>
                     <div className="f1"></div>
                     <div
                        className="pointer ml20"
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
                  <ApplyToAllComponent
                     xy={xy}
                     getOptions={(s) =>
                        ({
                           warehouseOptions: copyFlag(
                              warehouse.warehouseOptions,
                              (s as IWarehouseBuildingData).warehouseOptions,
                              WarehouseOptions.Autopilot,
                           ),
                        }) as IWarehouseBuildingData
                     }
                     gameState={gameState}
                  />
                  <div className="separator"></div>
                  <div className="row">
                     <div>{t(L.WarehouseAutopilotSettingsRespectCapSetting)}</div>
                     <Tippy content={t(L.WarehouseAutopilotSettingsRespectCapSettingTooltip)}>
                        <div className="m-icon small ml5 text-desc help-cursor">help</div>
                     </Tippy>
                     <div className="f1"></div>
                     <div
                        className="pointer ml20"
                        onClick={() => {
                           playClick();
                           warehouse.warehouseOptions = toggleFlag(
                              warehouse.warehouseOptions,
                              WarehouseOptions.AutopilotRespectCap,
                           );
                           notifyGameStateUpdate();
                        }}
                     >
                        {hasFlag(warehouse.warehouseOptions, WarehouseOptions.AutopilotRespectCap) ? (
                           <div className="m-icon text-green">toggle_on</div>
                        ) : (
                           <div className="m-icon text-desc">toggle_off</div>
                        )}
                     </div>
                  </div>
                  <ApplyToAllComponent
                     xy={xy}
                     getOptions={(s) =>
                        ({
                           warehouseOptions: copyFlag(
                              warehouse.warehouseOptions,
                              (s as IWarehouseBuildingData).warehouseOptions,
                              WarehouseOptions.AutopilotRespectCap,
                           ),
                        }) as IWarehouseBuildingData
                     }
                     gameState={gameState}
                  />
               </fieldset>
            </>
         ) : null}

         <BuildingWorkerComponent gameState={gameState} xy={xy} />
         <BuildingProductionPriorityComponent gameState={gameState} xy={xy} />
         <BuildingInputModeComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </div>
   );
}
