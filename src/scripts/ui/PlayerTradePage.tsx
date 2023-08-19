import { useState } from "react";
import { IAddTradeRequest } from "../../../server/src/Database";
import { Resource } from "../definitions/ResourceDefinitions";
import { getSellAmountRange, isTradeValid } from "../logic/PlayerTradeLogic";
import { Tick } from "../logic/TickLogic";
import { client, useTrades } from "../rpc/RPCClient";
import { keysOf, safeParseInt } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playError } from "../visuals/Sound";
import { FillPlayerTradeModal } from "./FillPlayerTradeModal";
import { showModal } from "./GlobalModal";

export function PlayerTradePage() {
   const resources = keysOf(Tick.next.resourcesByBuilding).filter(
      (res) => Tick.current.resources[res].canPrice && Tick.current.resources[res].canStore
   );
   const trades = useTrades();

   const [trade, setTrade] = useState<IAddTradeRequest>({
      buyResource: resources[0],
      buyAmount: 0,
      sellResource: resources[1],
      sellAmount: 0,
   });

   const [rangeMin, rangeMax] = getSellAmountRange(trade);

   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerTrade)}</div>
         </div>
         <div className="window-body">
            <fieldset>
               <legend>{t(L.PlayerTradeIWant)}</legend>
               <div className="row">
                  <div style={{ width: "80px" }}>{t(L.PlayerTradeResource)}</div>
                  <select
                     className="f1"
                     value={trade.buyResource}
                     onChange={(e) => {
                        setTrade({ ...trade, buyResource: e.target.value });
                     }}
                  >
                     {resources.map((res) => (
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
            </fieldset>
            <fieldset>
               <legend>{t(L.PlayerTradeIOffer)}</legend>
               <div className="row">
                  <div style={{ width: "80px" }}>{t(L.PlayerTradeResource)}</div>
                  <select
                     className="f1"
                     value={trade.sellResource}
                     onChange={(e) => {
                        setTrade({ ...trade, sellResource: e.target.value });
                     }}
                  >
                     {resources.map((res) => (
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
               <div className="row">
                  <div style={{ width: "80px" }}></div>
                  <div className="f1 text-desc text-small text-right">
                     {rangeMin} ~ {rangeMax}
                  </div>
               </div>
            </fieldset>
            <button
               className="row w100 jcc"
               disabled={!isTradeValid(trade)}
               onClick={() => {
                  if (isTradeValid(trade)) {
                     client.addTrade(trade);
                  } else {
                     playError();
                  }
               }}
            >
               <div className="m-icon small mr5">shopping_cart</div>
               <div className="text-strong">{t(L.PlayerTradePlaceTrade)}</div>
            </button>

            <div className="sep10"></div>
            <div className="table-view">
               <table>
                  <tbody>
                     <tr>
                        <th>{t(L.PlayerTradeWant)}</th>
                        <th>{t(L.PlayerTradeOffer)}</th>
                        <th>{t(L.PlayerTradeFrom)}</th>
                        <th></th>
                     </tr>
                     {trades.map((trade) => {
                        return (
                           <tr key={trade.id}>
                              <td>
                                 {Tick.current.resources[trade.buyResource as Resource].name()} x {trade.buyAmount}
                              </td>
                              <td>
                                 {Tick.current.resources[trade.sellResource as Resource].name()} x {trade.sellAmount}
                              </td>
                              <td>{trade.from}</td>
                              <td
                                 className="text-link text-strong"
                                 onClick={() => {
                                    showModal(<FillPlayerTradeModal trade={trade} />);
                                 }}
                              >
                                 {t(L.PlayerTradeFill)}
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
