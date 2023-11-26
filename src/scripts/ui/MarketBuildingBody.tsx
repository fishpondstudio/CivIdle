import { notifyGameStateUpdate } from "../Global";
import { applyToAllBuildings, getMarketPrice, totalMultiplierFor } from "../logic/BuildingLogic";
import { Config } from "../logic/Constants";
import { Tick } from "../logic/TickLogic";
import { IMarketBuildingData, MarketOptions } from "../logic/Tile";
import { convertPriceIdToTime } from "../logic/Update";
import { formatHMS, keysOf, round } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStockpileComponent } from "./BuildingStockpileComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { FormatNumber } from "./HelperComponents";

export function MarketBuildingBody({ gameState, xy }: IBuildingComponentProps) {
   const building = gameState.tiles[xy].building as IMarketBuildingData;
   if (building == null || !building.sellResources) {
      return null;
   }
   const market = building as IMarketBuildingData;
   const capacity = building.capacity * building.level * totalMultiplierFor(xy, "output", 1, gameState);
   return (
      <div className="window-body">
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.NextMarketUpdateIn)}</div>
               <div className="text-strong">
                  {formatHMS(convertPriceIdToTime(gameState.lastPriceUpdated + 1) - Date.now())}
               </div>
            </div>
         </fieldset>
         <div className="table-view">
            <table>
               <thead>
                  <tr>
                     <th>
                        <FormatNumber value={capacity} />x
                     </th>
                     <th className="right">{t(L.MarketYouGet)}</th>
                     <th className="right">{t(L.Storage)}</th>
                     <th style={{ width: 0 }}>{t(L.MarketSell)}</th>
                  </tr>
               </thead>
               <tbody>
                  {keysOf(market.availableResources)
                     .sort((a, b) => (Config.ResourcePrice[b] ?? 0) - (Config.ResourcePrice[a] ?? 0))
                     .map((res) => {
                        const r = Tick.current.resources[res];
                        if (!r.canPrice || !r.canStore) {
                           return null;
                        }
                        const buyResource = market.availableResources[res]!;
                        const buyAmount = round(
                           (capacity * getMarketPrice(res, xy, gameState)) / getMarketPrice(buyResource, xy, gameState),
                           1
                        );
                        return (
                           <tr key={res}>
                              <td>{r.name()}</td>
                              <td className="right">
                                 <FormatNumber value={buyAmount} /> x {Tick.current.resources[buyResource].name()}
                              </td>
                              <td className="right">
                                 <FormatNumber value={building.resources[res] ?? 0} />
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
         <fieldset>
            <legend>{t(L.MarketSettings)}</legend>
            <div className="row">
               <div className="f1">{t(L.ClearAfterUpdate)}</div>
               <div
                  className="pointer"
                  onClick={() => {
                     playClick();
                     market.marketOptions ^= MarketOptions.ClearAfterUpdate;
                     notifyGameStateUpdate();
                  }}
               >
                  {market.marketOptions & MarketOptions.ClearAfterUpdate ? (
                     <div className="m-icon text-green">toggle_on</div>
                  ) : (
                     <div className="m-icon text-desc">toggle_off</div>
                  )}
               </div>
            </div>
            <div className="sep5"></div>
            <div
               className="text-link text-small"
               onClick={() => {
                  playClick();
                  applyToAllBuildings<IMarketBuildingData>(
                     market.type,
                     { marketOptions: market.marketOptions },
                     gameState
                  );
               }}
            >
               {t(L.ApplyToAll, { building: Tick.current.buildings[building.type].name() })}
            </div>
         </fieldset>
         <BuildingColorComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </div>
   );
}
