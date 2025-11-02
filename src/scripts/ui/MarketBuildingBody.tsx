import classNames from "classnames";
import { NoPrice, NoStorage, type Material } from "../../../shared/definitions/MaterialDefinitions";
import { getMarketBuyAmount, getMarketSellAmount } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import type { IMarketBuildingData } from "../../../shared/logic/Tile";
import { MarketOptions } from "../../../shared/logic/Tile";
import { convertPriceIdToTime } from "../../../shared/logic/Update";
import {
   CURRENCY_PERCENT_EPSILON,
   copyFlag,
   forEach,
   formatHMS,
   formatPercent,
   hasFlag,
   keysOf,
   mathSign,
   toggleFlag,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { ApplyToAllComponent, ApplyToAllFlag } from "./ApplyToAllComponent";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingInputModeComponent } from "./BuildingInputModeComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStockpileComponent } from "./BuildingStockpileComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { FormatNumber } from "./HelperComponents";
import { TableView } from "./TableView";
import { TextWithHelp } from "./TextWithHelpComponent";

const marketSortingState = { column: 0, asc: true };

export function MarketBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IMarketBuildingData;
   if (building == null || !building.sellResources) {
      return null;
   }
   const market = building as IMarketBuildingData;
   const tradeValues: Map<Material, number> = new Map();

   forEach(market.availableResources, (sellResource, buyResource) => {
      const sellAmount = getMarketSellAmount(sellResource, xy, gameState);
      const buyAmount = getMarketBuyAmount(sellResource, sellAmount, buyResource, xy, gameState);
      const sellValue = Config.MaterialPrice[sellResource]! * sellAmount;
      const buyValue = Config.MaterialPrice[buyResource]! * buyAmount;
      const tradeValue = buyValue / sellValue - 1;
      tradeValues.set(sellResource, tradeValue);
   });

   return (
      <div className="window-body">
         <BuildingUpgradeComponent gameState={gameState} xy={xy} key={xy} />
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.NextMarketUpdateIn)}</div>
               <div className="text-strong">
                  {formatHMS(convertPriceIdToTime(gameState.lastPriceUpdated + 1) - Date.now())}
               </div>
            </div>
         </fieldset>
         <fieldset>
            <TableView
               header={[
                  { name: t(L.MarketYouPay), sortable: true },
                  { name: t(L.MarketYouGet), sortable: true },
                  { name: "", sortable: true },
                  { name: t(L.Storage), sortable: true },
                  { name: t(L.MarketSell), sortable: false },
               ]}
               sortingState={marketSortingState}
               data={keysOf(market.availableResources)}
               compareFunc={(a, b, i) => {
                  switch (i) {
                     case 0:
                        return Config.Material[a].name().localeCompare(Config.Material[b].name());
                     case 1: {
                        const aRes = market.availableResources[a]!;
                        const bRes = market.availableResources[b]!;
                        return Config.Material[aRes].name().localeCompare(Config.Material[bRes].name());
                     }
                     case 2: {
                        return (tradeValues.get(a) ?? 0) - (tradeValues.get(b) ?? 0);
                     }
                     case 3: {
                        return (building.resources[a] ?? 0) - (building.resources[b] ?? 0);
                     }
                     default:
                        return 0;
                  }
               }}
               renderRow={(sellResource) => {
                  const r = Config.Material[sellResource];
                  if (!r || NoPrice[sellResource] || NoStorage[sellResource]) {
                     return null;
                  }
                  const sellAmount = getMarketSellAmount(sellResource, xy, gameState);
                  const buyResource = market.availableResources[sellResource]!;
                  const buyAmount = getMarketBuyAmount(sellResource, sellAmount, buyResource, xy, gameState);
                  const tradeValue = tradeValues.get(sellResource) ?? 0;
                  return (
                     <tr key={sellResource}>
                        <td>
                           <div>{r.name()}</div>
                           <div className="text-small text-desc text-strong">
                              <FormatNumber value={sellAmount} />
                           </div>
                        </td>
                        <td>
                           <div>{Config.Material[buyResource].name()}</div>
                           <div className="text-small text-desc text-strong">
                              <FormatNumber value={buyAmount} />
                           </div>
                        </td>
                        <td
                           className={classNames({
                              "text-green": tradeValue > 0,
                              "text-red": tradeValue < 0,
                              "text-right text-small": true,
                           })}
                        >
                           <TextWithHelp
                              content={t(L.MarketValueDesc, { value: formatPercent(tradeValue, 0) })}
                              noStyle
                           >
                              {mathSign(tradeValue, CURRENCY_PERCENT_EPSILON)}
                              {formatPercent(Math.abs(tradeValue), 0)}
                           </TextWithHelp>
                        </td>
                        <td className="right">
                           <FormatNumber value={building.resources[sellResource] ?? 0} />
                        </td>
                        <td
                           className="pointer"
                           onClick={() => {
                              playClick();
                              if (building.sellResources[sellResource]) {
                                 delete building.sellResources[sellResource];
                              } else {
                                 building.sellResources[sellResource] = true;
                              }
                              notifyGameStateUpdate();
                           }}
                        >
                           {building.sellResources[sellResource] ? (
                              <div className="m-icon text-green">toggle_on</div>
                           ) : (
                              <div className="m-icon text-grey">toggle_off</div>
                           )}
                        </td>
                     </tr>
                  );
               }}
            />
            <div className="sep10" />
            <ApplyToAllComponent
               xy={xy}
               getOptions={() => {
                  return {
                     sellResources: structuredClone(building.sellResources),
                  } as IMarketBuildingData;
               }}
               gameState={gameState}
               flags={ApplyToAllFlag.NoDefault}
            />
         </fieldset>
         <BuildingWorkerComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent gameState={gameState} xy={xy} />
         <BuildingProductionPriorityComponent gameState={gameState} xy={xy} />
         <BuildingStockpileComponent gameState={gameState} xy={xy} />
         <BuildingInputModeComponent gameState={gameState} xy={xy} />
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
            <div className="sep10"></div>
            <ApplyToAllComponent
               xy={xy}
               getOptions={(s) => {
                  return {
                     marketOptions: copyFlag(
                        market.marketOptions,
                        (s as IMarketBuildingData).marketOptions,
                        MarketOptions.ClearAfterUpdate,
                     ),
                  } as IMarketBuildingData;
               }}
               gameState={gameState}
            />
         </fieldset>
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </div>
   );
}
