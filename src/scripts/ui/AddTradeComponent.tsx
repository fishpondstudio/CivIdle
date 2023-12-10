import { useState } from "react";
import { Resource } from "../definitions/ResourceDefinitions";
import { IClientAddTradeRequest, getBuyAmountRange } from "../logic/PlayerTradeLogic";
import { Tick } from "../logic/TickLogic";
import { client } from "../rpc/RPCClient";
import { keysOf, safeParseInt } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playError } from "../visuals/Sound";
import { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";

export function AddTradeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const buyResources = keysOf(Tick.next.resourcesByXy).filter(
      (res) => Tick.current.resources[res].canPrice && Tick.current.resources[res].canStore,
   );
   const resourcesInStorage = gameState.tiles[xy].building?.resources ?? {};
   const sellResources = keysOf(resourcesInStorage);
   const [trade, setTrade] = useState<IClientAddTradeRequest>({
      buyResource: buyResources[0],
      buyAmount: 0,
      sellResource: sellResources[0],
      sellAmount: 0,
   });
   const [showTrade, setShowTrade] = useState(false);
   const [rangeMin, rangeMax] = getBuyAmountRange(trade);

   function isTradeValid(trade: IClientAddTradeRequest): boolean {
      if (trade.buyResource == trade.sellResource) {
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
                     if (e.target.value in Tick.current.resources) {
                        setTrade({ ...trade, sellResource: e.target.value as Resource });
                     }
                  }}
               >
                  {sellResources.map((res) => (
                     <option key={res} value={res}>
                        {Tick.current.resources[res].name()}
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
            <div className="text-desc text-small text-right">
               0 ~ <FormatNumber value={resourcesInStorage[trade.sellResource] ?? 0} />
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
                     if (e.target.value in Tick.current.resources) {
                        setTrade({ ...trade, buyResource: e.target.value as Resource });
                     }
                  }}
               >
                  {buyResources.map((res) => (
                     <option key={res} value={res}>
                        {Tick.current.resources[res].name()}
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
            <div className="text-desc text-small text-right">
               <FormatNumber value={rangeMin} /> ~ <FormatNumber value={rangeMax} />
            </div>
            <div className="sep15"></div>
            <div className="row">
               <button
                  className="row f1 jcc"
                  disabled={!isTradeValid(trade)}
                  onClick={() => {
                     if (isTradeValid(trade)) {
                        client.addTrade(trade);
                        resourcesInStorage[trade.sellResource]! -= trade.sellAmount;
                     } else {
                        playError();
                     }
                  }}
               >
                  <div className="m-icon small mr5">shopping_cart</div>
                  <div className="text-strong">{t(L.PlayerTradePlaceTrade)}</div>
               </button>
               <div style={{ width: "10px" }}></div>
               <button
                  className="row f1 jcc"
                  onClick={() => {
                     setShowTrade(false);
                  }}
               >
                  {t(L.PlayerTradeCancelTrade)}
               </button>
            </div>
         </fieldset>
      );
   }
   return (
      <button
         className="row w100 jcc mb10"
         onClick={() => {
            setShowTrade(true);
         }}
      >
         <div className="m-icon small mr5">add_circle</div>
         <div className="text-strong">{t(L.PlayerTradeNewTrade)}</div>
      </button>
   );
}
