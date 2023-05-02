import { notifyGameStateUpdate } from "../Global";
import { Config } from "../logic/Constants";
import { unlockedResources } from "../logic/IntraTickCache";
import { getCash } from "../logic/ResourceLogic";
import { Tick } from "../logic/TickLogic";
import { IMarketBuildingData } from "../logic/Tile";
import { keysOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStockpileComponent } from "./BuildingStockpileComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWarningComponent } from "./BuildingWarningComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { FormatNumber } from "./HelperComponents";

export function MarketBuildingBody({ gameState, xy }: IBuildingComponentProps) {
   const building = gameState.tiles[xy].building as IMarketBuildingData;
   if (building == null || !building.sellResources) {
      return null;
   }
   return (
      <div className="window-body">
         <BuildingWarningComponent gameState={gameState} xy={xy} />
         <fieldset>
            <div className="text-strong row">
               <div className="f1">{t(L.Cash)}</div>
               <div>
                  <FormatNumber value={getCash()} />
               </div>
            </div>
         </fieldset>
         <div className="table-view">
            <table>
               <thead>
                  <tr>
                     <th></th>
                     <th className="right">{t(L.MarketPrice)}</th>
                     <th className="right">{t(L.MarketAmount)}</th>
                     <th style={{ width: 0 }}>{t(L.MarketSell)}</th>
                  </tr>
               </thead>
               <tbody>
                  {keysOf(unlockedResources(gameState))
                     .sort((a, b) => (Config.ResourcePrice[b] ?? 0) - (Config.ResourcePrice[a] ?? 0))
                     .map((res) => {
                        const r = Tick.current.resources[res];
                        if (!r.canPrice || !r.canStore) {
                           return null;
                        }
                        return (
                           <tr key={res}>
                              <td>{r.name()}</td>
                              <td className="right">
                                 $<FormatNumber value={Config.ResourcePrice[res]} />
                              </td>
                              <td className="right">
                                 <FormatNumber
                                    value={
                                       Tick.current.resourcesByBuilding[res]?.reduce(
                                          (prev, curr) =>
                                             prev + (gameState.tiles[curr].building?.resources?.[res] ?? 0),
                                          0
                                       ) ?? 0
                                    }
                                 />
                              </td>
                              <td
                                 className="pointer"
                                 onClick={() => {
                                    playClick();
                                    if (building.sellResources[res]) {
                                       delete building.sellResources[res];
                                    } else {
                                       building.sellResources[res] = true;
                                    }
                                    notifyGameStateUpdate();
                                 }}
                              >
                                 {building.sellResources[res] ? (
                                    <div className="m-icon text-green">toggle_on</div>
                                 ) : (
                                    <div className="m-icon text-grey">toggle_off</div>
                                 )}
                              </td>
                           </tr>
                        );
                     })}
               </tbody>
            </table>
         </div>
         <div className="sep10"></div>
         <BuildingUpgradeComponent gameState={gameState} xy={xy} />
         <BuildingWorkerComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent gameState={gameState} xy={xy} />
         <BuildingProductionPriorityComponent gameState={gameState} xy={xy} />
         <BuildingStockpileComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </div>
   );
}
