import classNames from "classnames";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { applyToAllBuildings, getMarketPrice, totalMultiplierFor } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import type { IMarketBuildingData } from "../../../shared/logic/Tile";
import { MarketOptions } from "../../../shared/logic/Tile";
import { convertPriceIdToTime } from "../../../shared/logic/Update";
import {
   CURRENCY_EPSILON,
   formatHMS,
   formatPercent,
   hasFlag,
   keysOf,
   mathSign,
   round,
   toggleFlag,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingInputModeComponent } from "./BuildingInputModeComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStockpileComponent } from "./BuildingStockpileComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { FormatNumber } from "./HelperComponents";
import { TableView } from "./TableView";
import { TextWithHelp } from "./TextWithHelpComponent";

export function MarketBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IMarketBuildingData;
   if (building == null || !building.sellResources) {
      return null;
   }
   const market = building as IMarketBuildingData;
   const capacity = building.capacity * building.level * totalMultiplierFor(xy, "output", 1, gameState);
   const getBuyResourceAndAmount = (sellResource: Resource) => {
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

   const tradeValues: Map<Resource, number> = new Map();

   keysOf(market.availableResources).forEach((res) => {
      const buy = getBuyResourceAndAmount(res);
      const sellValue = Config.ResourcePrice[res]! * capacity;
      const buyValue = Config.ResourcePrice[buy.resource]! * buy.amount;

      tradeValues.set(res, buyValue / sellValue - 1);
   });

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
         <TableView
            header={[
               { name: t(L.MarketYouPay), sortable: true },
               { name: t(L.MarketYouGet), sortable: true },
               { name: "", sortable: true },
               { name: t(L.Storage), sortable: true },
               { name: t(L.MarketSell), sortable: false },
            ]}
            data={keysOf(market.availableResources)}
            compareFunc={(a, b, i) => {
               switch (i) {
                  case 0:
                     return Config.Resource[a].name().localeCompare(Config.Resource[b].name());
                  case 1: {
                     const aRes = market.availableResources[a]!;
                     const bRes = market.availableResources[b]!;
                     return Config.Resource[aRes].name().localeCompare(Config.Resource[bRes].name());
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
            renderRow={(res) => {
               const r = Config.Resource[res];
               if (!r || NoPrice[res] || NoStorage[res]) {
                  return null;
               }
               const buy = getBuyResourceAndAmount(res);
               const tradeValue = tradeValues.get(res) ?? 0;

               return (
                  <tr key={res}>
                     <td>
                        <div>{r.name()}</div>
                        <div className="text-small text-desc text-strong">
                           <FormatNumber value={capacity} />
                        </div>
                     </td>
                     <td>
                        <div>{Config.Resource[buy.resource].name()}</div>
                        <div className="text-small text-desc text-strong">
                           <FormatNumber value={buy.amount} />
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
                           {mathSign(tradeValue, CURRENCY_EPSILON)}
                           {formatPercent(Math.abs(tradeValue), 0)}
                        </TextWithHelp>
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
            }}
         />
         <div className="sep10"></div>
         <BuildingUpgradeComponent gameState={gameState} xy={xy} />
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
