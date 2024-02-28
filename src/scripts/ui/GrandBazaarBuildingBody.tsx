import classNames from "classnames";
import { useState } from "react";
import { convertPriceIdToTime } from "../../../shared/logic/Update";
import {
   CURRENCY_EPSILON,
   formatHMS,
   formatPercent,
   keysOf,
   mathSign,
   round,
   type Tile,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { TableView } from "./TableView";
import { getBuildingsByType } from "../../../shared/logic/IntraTickCache";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { Config } from "../../../shared/logic/Config";
import type { IMarketBuildingData, ITileData } from "../../../shared/logic/Tile";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import { getMarketPrice, totalMultiplierFor } from "../../../shared/logic/BuildingLogic";
import { FormatNumber } from "./HelperComponents";
import { TextWithHelp } from "./TextWithHelpComponent";
import { playClick } from "../visuals/Sound";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { Singleton } from "../utilities/Singleton";
import { LookAtMode, WorldScene } from "../scenes/WorldScene";

interface IGrandBazaarMarketData {
   tile: number;
   youPay: { res: Resource; amount: number };
   youGet: { res: Resource; amount: number };
   tradeValue: number;
   selling: boolean;
}

function getResourcesFromAllMarkets(marketBuildings: Map<Tile, Required<ITileData>> | undefined) {
   const marketResources: Resource[] = [];
   marketBuildings?.forEach((tile, xy) => {
      const market = tile.building as IMarketBuildingData;
      keysOf(market.availableResources).forEach((res) => {
         if (!marketResources.includes(res)) {
            marketResources.push(res);
         }
      });
   });

   return marketResources.sort((a, b) => Config.Resource[a].name().localeCompare(Config.Resource[b].name()));
}

function getSellResourceFromBuyResource(market: IMarketBuildingData, buy: Resource | null) {
   if (!buy) {
      return null;
   }
   let resource = null;
   keysOf(market.availableResources).forEach((res) => {
      if (market.availableResources[res] === buy) {
         resource = res;
      }
   });
   return resource;
}

export function GrandBazaarBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const [youPayFilter, setYouPayFilter] = useState<Resource | null>(null);
   const [youGetFilter, setYouGetFilter] = useState<Resource | null>(null);

   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }

   const filterSellResource = (value: string) => {
      setYouPayFilter(value === "" ? null : (value as Resource));
   };
   const filterBuyResource = (value: string) => {
      setYouGetFilter(value === "" ? null : (value as Resource));
   };
   const getBuyResourceAndAmount = (
      market: IMarketBuildingData,
      sellResource: Resource,
      capacity: number,
      xy: Tile,
   ) => {
      const buyResource = market.availableResources[sellResource]!;
      return {
         resource: buyResource,
         amount: round(
            (capacity * getMarketPrice(sellResource, xy, gameState)) /
               getMarketPrice(buyResource, xy, gameState),
            1,
         ),
      };
   };
   const marketBuildings = getBuildingsByType("Market" as Building, gameState);
   const avaliableResources = getResourcesFromAllMarkets(marketBuildings);

   const marketBuildingData: IGrandBazaarMarketData[] = [];
   const addMarketData = (marketData: IGrandBazaarMarketData) => {
      marketBuildingData.push(marketData);
   };

   marketBuildings?.forEach((tile, xy) => {
      const market = tile.building as IMarketBuildingData;
      // Get input(sell) capacity for the market
      const capacity = market.capacity * market.level * totalMultiplierFor(xy, "output", 1, gameState);

      // Get the pay resource if filtering a get resource
      let sellResource: Resource | null = getSellResourceFromBuyResource(market, youGetFilter);
      if (youPayFilter) {
         if (sellResource && sellResource === youPayFilter) {
            // If filtering by both pay and get
            sellResource = youPayFilter;
         } else if (!sellResource) {
            // If filtering by pay
            sellResource = youPayFilter;
         } else {
            // If no filtering is set
            sellResource = null;
         }
      }

      // Only add data for the table if we have something to filter by
      if (sellResource) {
         const sellValue = Config.ResourcePrice[sellResource]! * capacity;
         const buy = getBuyResourceAndAmount(market, sellResource, capacity, xy);
         const buyValue = Config.ResourcePrice[buy.resource]! * buy.amount;
         addMarketData({
            tile: tile.tile,
            youPay: { res: sellResource, amount: capacity },
            youGet: { res: buy.resource, amount: buy.amount },
            tradeValue: buyValue / sellValue - 1,
            selling: market.sellResources[sellResource] ? true : false,
         });
      }
   });

   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />

         <fieldset>
            <div className="row">
               <div className="f1">{t(L.NextMarketUpdateIn)}</div>
               <div className="text-strong">
                  {formatHMS(convertPriceIdToTime(gameState.lastPriceUpdated + 1) - Date.now())}
               </div>
            </div>
         </fieldset>

         <fieldset>
            <legend>{t(L.GrandBazaarFilters)}</legend>
            <div className="row">
               <div style={{ width: "120px" }}>{t(L.GrandBazaarFilterYouPay)}</div>
               <select
                  className="f1"
                  value={youPayFilter ? youPayFilter : ""}
                  onChange={(e) => {
                     if (e.target.value in Config.Resource || e.target.value === "") {
                        filterSellResource(e.target.value);
                     }
                  }}
               >
                  <option value=""></option>
                  {avaliableResources.map((res) => (
                     <option key={res} value={res}>
                        {Config.Resource[res].name()}
                     </option>
                  ))}
               </select>
            </div>
            <div className="sep10"></div>
            <div className="row">
               <div style={{ width: "120px" }}>{t(L.GrandBazaarFilterYouGet)}</div>
               <select
                  className="f1"
                  value={youGetFilter ? youGetFilter : ""}
                  onChange={(e) => {
                     if (e.target.value in Config.Resource || e.target.value === "") {
                        filterBuyResource(e.target.value);
                     }
                  }}
               >
                  <option value=""></option>
                  {avaliableResources.map((res) => (
                     <option key={res} value={res}>
                        {Config.Resource[res].name()}
                     </option>
                  ))}
               </select>
            </div>
         </fieldset>

         <TableView
            classNames="sticky-header f1"
            header={[
               { name: t(L.MarketYouPay), sortable: true },
               { name: t(L.MarketYouGet), sortable: true },
               { name: "", sortable: true },
               { name: t(L.Storage), sortable: true },
               { name: t(L.MarketSell), sortable: false },
               { name: "", sortable: false },
            ]}
            data={marketBuildingData}
            compareFunc={(a, b, i) => {
               switch (i) {
                  case 1:
                     return (a.youGet.amount ?? 0) - (b.youGet.amount ?? 0);
                  case 2:
                     return (a.tradeValue ?? 0) - (b.tradeValue ?? 0);
                  default:
                     return 0;
               }
            }}
            renderRow={(item) => {
               const building = gameState.tiles.get(item.tile)?.building as IMarketBuildingData;
               const youPayResource = Config.Resource[item.youPay.res];
               const youGetResource = Config.Resource[item.youGet.res];
               return (
                  <tr>
                     <td>
                        <div>{youPayResource.name()}</div>
                        <div className="text-small text-desc text-strong">
                           <FormatNumber value={item.youPay.amount} />
                        </div>
                     </td>
                     <td>
                        <div>{youGetResource.name()}</div>
                        <div className="text-small text-desc text-strong">
                           <FormatNumber value={item.youGet.amount} />
                        </div>
                     </td>
                     <td
                        className={classNames({
                           "text-green": item.tradeValue > 0,
                           "text-red": item.tradeValue < 0,
                           "text-right text-small": true,
                        })}
                     >
                        <TextWithHelp
                           content={t(L.MarketValueDesc, {
                              value: formatPercent(item.tradeValue, 0),
                           })}
                           noStyle
                        >
                           {mathSign(item.tradeValue, CURRENCY_EPSILON)}
                           {formatPercent(Math.abs(item.tradeValue), 0)}
                        </TextWithHelp>
                     </td>
                     <td className="right">
                        <FormatNumber value={building.resources[item.youPay.res] ?? 0} />
                     </td>
                     <td
                        className="pointer"
                        onClick={() => {
                           playClick();
                           if (building.sellResources[item.youPay.res]) {
                              delete building.sellResources[item.youPay.res];
                           } else {
                              building.sellResources[item.youPay.res] = true;
                           }
                           notifyGameStateUpdate();
                        }}
                     >
                        {item.selling ? (
                           <div className="m-icon text-green">toggle_on</div>
                        ) : (
                           <div className="m-icon text-grey">toggle_off</div>
                        )}
                     </td>
                     <td>
                        <div
                           className="m-icon small pointer"
                           onPointerDown={() => {
                              playClick();
                              Singleton()
                                 .sceneManager.getCurrent(WorldScene)
                                 ?.lookAtTile(item.tile, LookAtMode.Select);
                           }}
                        >
                           open_in_new
                        </div>
                     </td>
                  </tr>
               );
            }}
         />

         <div className="sep10"></div>
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
