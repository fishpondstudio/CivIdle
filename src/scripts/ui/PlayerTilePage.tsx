import { Config } from "../logic/Config";
import { usePlayerMap, useTrades } from "../rpc/RPCClient";
import { getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { formatPercent } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { FillPlayerTradeModal } from "./FillPlayerTradeModal";
import { showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { MenuComponent } from "./MenuComponent";

export function PlayerTilePage({ xy }: { xy: string }): React.ReactNode {
   const playerMap = usePlayerMap();
   const tile = playerMap[xy];
   if (!tile) {
      return null;
   }
   const trades = useTrades();
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{tile.handle}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <fieldset>
               <legend className="row">
                  {tile.handle}{" "}
                  <img
                     src={getFlagUrl(tile.flag)}
                     className="player-flag ml5"
                     title={getCountryName(tile.flag)}
                  />
               </legend>
               <div className="row mv5">
                  <div className="f1">{t(L.PlayerMapTariff)}</div>
                  <div className="text-strong">{formatPercent(tile.tariffRate)}</div>
               </div>
               <div className="row mv5">
                  <div className="f1">{t(L.PlayerMapEstablishedSince)}</div>
                  <div className="text-strong">{new Date(tile.createdAt).toLocaleDateString()}</div>
               </div>
            </fieldset>
            <fieldset>
               <legend>{t(L.PlayerMapTradesFrom, { name: tile.handle })}</legend>
               <div className="table-view">
                  <table>
                     <tbody>
                        <tr>
                           <th>{t(L.PlayerTradeWant)}</th>
                           <th>{t(L.PlayerTradeOffer)}</th>
                           <th></th>
                        </tr>
                        {trades
                           .filter((t) => t.fromId === tile.userId)
                           .map((trade) => {
                              return (
                                 <tr key={trade.id}>
                                    <td>
                                       {Config.Resource[trade.buyResource].name()} x{" "}
                                       <FormatNumber value={trade.buyAmount} />
                                    </td>
                                    <td>
                                       {Config.Resource[trade.sellResource].name()} x{" "}
                                       <FormatNumber value={trade.sellAmount} />
                                    </td>
                                    <td>
                                       <div
                                          className="text-strong text-blue pointer"
                                          onClick={() => {
                                             showModal(<FillPlayerTradeModal trade={trade} />);
                                          }}
                                       >
                                          {t(L.PlayerTradeFill)}
                                       </div>
                                    </td>
                                 </tr>
                              );
                           })}
                     </tbody>
                  </table>
               </div>
            </fieldset>
         </div>
      </div>
   );
}
