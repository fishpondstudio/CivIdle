import { useState } from "react";
import type { Resource, ResourceDefinitions } from "../../../shared/definitions/ResourceDefinitions";
import { applyToAllBuildings, getMarketPrice, totalMultiplierFor } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import type { IMarketBuildingData } from "../../../shared/logic/Tile";
import { MarketOptions } from "../../../shared/logic/Tile";
import { convertPriceIdToTime } from "../../../shared/logic/Update";
import { formatHMS, hasFlag, keysOf, round, toggleFlag } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStockpileComponent } from "./BuildingStockpileComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { FormatNumber } from "./HelperComponents";

interface IMarketFiltersProps {
   resourceFilterParams: {
      resourceFilter: Resource | null;
      setResourceFilter: (newFilter: Resource | null) => void;
   };
   resources: (keyof ResourceDefinitions)[];
}
function MarketFilters({ resourceFilterParams, resources }: IMarketFiltersProps): React.ReactNode {
   const { resourceFilter, setResourceFilter } = resourceFilterParams;

   return (
      <fieldset>
         <legend>{t(L.MarketFilters)}</legend>
         <div className="row">
            <div style={{ width: "80px" }}>{t(L.MarketFilterResource)}</div>
            <select
               className="f1"
               value={resourceFilter ? resourceFilter : ""}
               onChange={(e) => {
                  if (e.target.value in Config.Resource || e.target.value === "") {
                     setResourceFilter(e.target.value === "" ? null : (e.target.value as Resource));
                  }
               }}
            >
               <option value=""></option>
               {resources.map((res) => (
                  <option key={res} value={res}>
                     {Config.Resource[res].name()}
                  </option>
               ))}
            </select>
         </div>
      </fieldset>
   );
}

export function MarketBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IMarketBuildingData;
   if (building == null || !building.sellResources) {
      return null;
   }
   const market = building as IMarketBuildingData;
   const capacity = building.capacity * building.level * totalMultiplierFor(xy, "output", 1, gameState);

   const [resourceFilter, setResourceFilter] = useState<Resource | null>(null);
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
         <MarketFilters
            resourceFilterParams={{ resourceFilter, setResourceFilter }}
            resources={keysOf(market.availableResources)}
         />
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
                     .filter((res) => {
                        if (
                           res === resourceFilter ||
                           !resourceFilter ||
                           market.availableResources[res]! === resourceFilter
                        ) {
                           return true;
                        }
                        return false;
                     })
                     .map((res) => {
                        const r = Config.Resource[res];
                        if (!r || !r.canPrice || !r.canStore) {
                           return null;
                        }
                        const buyResource = market.availableResources[res]!;
                        const buyAmount = round(
                           (capacity * getMarketPrice(res, xy, gameState)) /
                              getMarketPrice(buyResource, xy, gameState),
                           1,
                        );
                        return (
                           <tr key={res}>
                              <td>{r.name()}</td>
                              <td className="right">
                                 <FormatNumber value={buyAmount} /> x {Config.Resource[buyResource].name()}
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
                     market.marketOptions = toggleFlag(market.marketOptions, MarketOptions.ClearAfterUpdate);
                     notifyGameStateUpdate();
                  }}
               >
                  {hasFlag(market.marketOptions, MarketOptions.ClearAfterUpdate) ? (
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
                     () => ({ marketOptions: market.marketOptions }),
                     gameState,
                  );
               }}
            >
               {t(L.ApplyToAll, { building: Config.Building[building.type].name() })}
            </div>
         </fieldset>
         <BuildingColorComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </div>
   );
}
