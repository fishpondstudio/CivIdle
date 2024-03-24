import { useState } from "react";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import { unlockedResources } from "../../../shared/logic/IntraTickCache";
import {
   getBuyAmountRange,
   getMaxActiveTrades,
   type IClientAddTradeRequest,
} from "../../../shared/logic/PlayerTradeLogic";
import { isNullOrUndefined, keysOf, safeParseInt } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { client, useTrades, useUser } from "../rpc/RPCClient";
import { playError, playKaching } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { TextWithHelp } from "./TextWithHelpComponent";

export function AddTradeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const user = useUser();
   const trades = useTrades();
   const enabled =
      !isNullOrUndefined(user) &&
      trades.filter((t) => t.fromId === user.userId).length < getMaxActiveTrades(user);
   const buyResources = keysOf(unlockedResources(gameState)).filter((r) => !NoStorage[r] && !NoPrice[r]);
   const resourcesInStorage = gameState.tiles.get(xy)?.building?.resources ?? {};
   const sellResources = keysOf(resourcesInStorage);
   const [trade, setTrade] = useState<IClientAddTradeRequest>({
      buyResource: buyResources[0],
      buyAmount: 0,
      sellResource: sellResources[0],
      sellAmount: 0,
   });
   const [showTrade, setShowTrade] = useState(false);
   const [rangeMin, rangeMax] = getBuyAmountRange(trade, user);

   function isTradeValid(trade: IClientAddTradeRequest): boolean {
      if (trade.buyResource === trade.sellResource) {
         return false;
      }
      if (trade.buyAmount < 1) {
         return false;
      }
      if (trade.buyAmount > rangeMax || trade.buyAmount < rangeMin) {
         return false;
      }
      if (trade.sellAmount < 0 || trade.sellAmount > (resourcesInStorage[trade.sellResource] ?? 0)) {
         return false;
      }
      return true;
   }

   if (showTrade) {
      return (
         <fieldset>
            <legend className="text-strong">{t(L.PlayerTradeIOffer)}</legend>
            <div className="sep10"></div>
            <div className="row">
               <div style={{ width: "80px" }}>{t(L.PlayerTradeResource)}</div>
               <select
                  className="f1"
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
            </div>
            <div className="sep10"></div>
            <div className="row">
               <div style={{ width: "80px" }}>{t(L.PlayerTradeAmount)}</div>
               <input
                  className="f1 text-right w100"
                  type="text"
                  value={trade.sellAmount}
                  onChange={(e) => setTrade({ ...trade, sellAmount: safeParseInt(e.target.value) })}
               />
            </div>
            <div className="sep5"></div>
            <div className="row text-desc text-small">
               <div style={{ width: "80px" }}></div>
               <div>
                  0 ~ <FormatNumber value={resourcesInStorage[trade.sellResource] ?? 0} />
               </div>
               <div className="f1"></div>
               <div
                  className="text-link text-strong mr10"
                  onClick={() =>
                     setTrade({
                        ...trade,
                        sellAmount: Math.floor((resourcesInStorage[trade.sellResource] ?? 0) * 0.5),
                     })
                  }
               >
                  {t(L.PlayerTradeSetHalf)}
               </div>
               <div
                  className="text-link text-strong"
                  onClick={() =>
                     setTrade({
                        ...trade,
                        sellAmount: Math.floor(resourcesInStorage[trade.sellResource] ?? 0),
                     })
                  }
               >
                  {t(L.PlayerTradeSetMax)}
               </div>
            </div>
            <div className="separator has-title">
               <div className="text-strong">{t(L.PlayerTradeIWant)}</div>
            </div>
            <div className="sep10" />
            <div className="row">
               <div style={{ width: "80px" }}>{t(L.PlayerTradeResource)}</div>
               <select
                  className="f1"
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
            </div>
            <div className="sep10"></div>
            <div className="row">
               <div style={{ width: "80px" }}>{t(L.PlayerTradeAmount)}</div>
               <input
                  className="f1 text-right w100"
                  type="text"
                  value={trade.buyAmount}
                  onChange={(e) => setTrade({ ...trade, buyAmount: safeParseInt(e.target.value) })}
               />
            </div>
            <div className="sep5" />
            <div className="row text-desc text-small">
               <div style={{ width: "80px" }}></div>
               <div>
                  <FormatNumber value={rangeMin} /> ~ <FormatNumber value={rangeMax} />
               </div>
               <div className="f1" />
               <div
                  className="text-link text-strong mr10"
                  onClick={() => setTrade({ ...trade, buyAmount: rangeMin })}
               >
                  {t(L.PlayerTradeSetMin)}
               </div>
               <div
                  className="text-link text-strong"
                  onClick={() => setTrade({ ...trade, buyAmount: rangeMax })}
               >
                  {t(L.PlayerTradeSetMax)}
               </div>
            </div>
            <div className="sep15"></div>
            <div className="row">
               <button
                  className="row f1 jcc"
                  disabled={!isTradeValid(trade) || !enabled}
                  onClick={async () => {
                     if (
                        !isTradeValid(trade) ||
                        !enabled ||
                        (resourcesInStorage[trade.sellResource] ?? 0) < trade.sellAmount
                     ) {
                        playError();
                        showToast(t(L.OperationNotAllowedError));
                        return;
                     }
                     try {
                        // Note: we deduct the resources first otherwise resource can go negative if a player
                        // clicks really fast. If the trade fails, we refund the player
                        resourcesInStorage[trade.sellResource]! -= trade.sellAmount;
                        await client.addTrade(trade);
                        playKaching();
                        showToast(t(L.PlayerTradeAddSuccess));
                     } catch (error) {
                        resourcesInStorage[trade.sellResource]! += trade.sellAmount;
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
