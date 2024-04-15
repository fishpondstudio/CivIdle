import { useState } from "react";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import { unlockedResources } from "../../../shared/logic/IntraTickCache";
import {
   getBuyAmountRange,
   getMaxActiveTrades,
   getUserTradePriceRange,
   type IClientAddTradeRequest,
} from "../../../shared/logic/PlayerTradeLogic";
import { combineResources, deductResourceFrom } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import {
   clamp,
   formatPercent,
   isNullOrUndefined,
   keysOf,
   safeParseInt,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { client, useTrades, useUser } from "../rpc/RPCClient";
import { playError, playKaching } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { TextWithHelp } from "./TextWithHelpComponent";

const INPUT_WIDTH = 100;

export function AddTradeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const user = useUser();
   const trades = useTrades();
   const enabled =
      !isNullOrUndefined(user) &&
      trades.filter((t) => t.fromId === user.userId).length < getMaxActiveTrades(user);
   const buyResources = keysOf(unlockedResources(gameState)).filter((r) => !NoStorage[r] && !NoPrice[r]);
   const availableResources = combineResources(
      Array.from(Tick.current.playerTradeBuildings.values()).map((m) => m.resources),
   );
   const sellResources = keysOf(availableResources);
   const [trade, setTrade] = useState<IClientAddTradeRequest>({
      buyResource: buyResources[0],
      buyAmount: 0,
      sellResource: sellResources[0],
      sellAmount: 0,
   });
   const [showTrade, setShowTrade] = useState(false);
   const percentage = getUserTradePriceRange(user);
   const buyAmountRange = getBuyAmountRange(trade, user);

   function isTradeValid(trade: IClientAddTradeRequest): boolean {
      if (trade.buyResource === trade.sellResource) {
         return false;
      }
      if (trade.buyAmount < 1) {
         return false;
      }
      if (trade.buyAmount > buyAmountRange.max || trade.buyAmount < buyAmountRange.min) {
         return false;
      }
      if (trade.sellAmount < 0 || trade.sellAmount > (availableResources[trade.sellResource] ?? 0)) {
         return false;
      }
      return true;
   }

   if (showTrade) {
      return (
         <fieldset>
            <div className="text-strong mb5">{t(L.PlayerTradeIOffer)}</div>
            <div className="row">
               <select
                  className="f1 mr10"
                  value={trade.sellResource}
                  onChange={(e) => {
                     if (e.target.value in Config.Resource) {
                        setTrade({ ...trade, sellResource: e.target.value as Resource });
                     }
                  }}
               >
                  {sellResources
                     .sort((a, b) => {
                        return Config.Resource[a].name().localeCompare(Config.Resource[b].name());
                     })
                     .map((res) => (
                        <option key={res} value={res}>
                           {Config.Resource[res].name()}
                        </option>
                     ))}
               </select>
               <input
                  style={{ width: INPUT_WIDTH }}
                  className="text-right"
                  type="text"
                  value={trade.sellAmount}
                  onChange={(e) => setTrade({ ...trade, sellAmount: safeParseInt(e.target.value) })}
               />
            </div>
            <div className="mt5 row text-desc text-small">
               <div className="f1">
                  0 ~ <FormatNumber value={availableResources[trade.sellResource] ?? 0} />
               </div>
               {[0.1, 0.25, 0.5, 1].map((pct) => {
                  return (
                     <div
                        className="text-link text-strong ml10"
                        onClick={() =>
                           setTrade({
                              ...trade,
                              sellAmount: Math.floor((availableResources[trade.sellResource] ?? 0) * pct),
                           })
                        }
                     >
                        {formatPercent(pct)}
                     </div>
                  );
               })}
            </div>
            <div className="separator" />
            <div className="text-strong mb5">{t(L.PlayerTradeIWant)}</div>
            <div className="row">
               <select
                  className="f1 mr10"
                  value={trade.buyResource}
                  onChange={(e) => {
                     if (e.target.value in Config.Resource) {
                        setTrade({ ...trade, buyResource: e.target.value as Resource });
                     }
                  }}
               >
                  {buyResources
                     .sort((a, b) => {
                        return Config.Resource[a].name().localeCompare(Config.Resource[b].name());
                     })
                     .map((res) => (
                        <option key={res} value={res}>
                           {Config.Resource[res].name()}
                        </option>
                     ))}
               </select>
               <input
                  style={{ width: INPUT_WIDTH }}
                  className="text-right"
                  type="text"
                  value={trade.buyAmount}
                  onChange={(e) => setTrade({ ...trade, buyAmount: safeParseInt(e.target.value) })}
               />
            </div>
            <div className="row text-desc text-small mt5">
               <div>
                  <FormatNumber value={buyAmountRange.min} /> ~ <FormatNumber value={buyAmountRange.max} />
               </div>
               <div className="f1" />
               {[-percentage, -percentage / 2, 0, percentage / 2, percentage].map((pct) => {
                  return (
                     <div
                        className="text-link text-strong ml10"
                        onClick={() =>
                           setTrade({
                              ...trade,
                              buyAmount: clamp(
                                 Math.round(buyAmountRange.amount * (1 + pct)),
                                 buyAmountRange.min,
                                 buyAmountRange.max,
                              ),
                           })
                        }
                     >
                        {formatPercent(pct)}
                     </div>
                  );
               })}
            </div>
            <div className="sep10" />
            <div className="row">
               <button
                  className="row f1 jcc"
                  disabled={!isTradeValid(trade) || !enabled}
                  onClick={async () => {
                     if (
                        !isTradeValid(trade) ||
                        !enabled ||
                        (availableResources[trade.sellResource] ?? 0) < trade.sellAmount
                     ) {
                        playError();
                        showToast(t(L.OperationNotAllowedError));
                        return;
                     }
                     // Note: we deduct the resources first otherwise resource can go negative if a player
                     // clicks really fast. If the trade fails, we refund the player
                     const transaction = deductResourceFrom(
                        trade.sellResource,
                        trade.sellAmount,
                        Array.from(Tick.current.playerTradeBuildings.keys()),
                        gameState,
                     );
                     try {
                        // The deduction might not be 100% successful, we need to correct the actual amount
                        // based on the result!
                        const percentage = transaction.amount / trade.sellAmount;
                        trade.sellAmount *= percentage;
                        trade.buyAmount *= percentage;
                        await client.addTrade(trade);
                        playKaching();
                        showToast(t(L.PlayerTradeAddSuccess));
                     } catch (error) {
                        transaction.rollback();
                        playError();
                        showToast(String(error));
                     }
                  }}
               >
                  <div className="m-icon small">shopping_cart</div>
                  <div className="text-strong">{t(L.PlayerTradePlaceTrade)}</div>
               </button>
               <div style={{ width: "10px" }}></div>
               <button
                  className="row f1 jcc"
                  onClick={() => {
                     setShowTrade(false);
                  }}
               >
                  {t(L.PlayerTradeAddTradeCancel)}
               </button>
            </div>
         </fieldset>
      );
   }
   return (
      <button
         className="row w100 jcc mb10"
         onClick={() => {
            if (enabled) {
               setShowTrade(true);
            } else {
               playError();
            }
         }}
         disabled={!enabled}
      >
         <div className="m-icon small">add_circle</div>
         <div className="text-strong f1">
            <TextWithHelp content={enabled ? null : t(L.PlayerTradeMaxTradeExceeded)} noStyle>
               {t(L.PlayerTradeNewTrade)}
            </TextWithHelp>
         </div>
      </button>
   );
}
