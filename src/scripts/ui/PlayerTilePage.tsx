import { Config } from "../../../shared/logic/Config";
import { isTileReserved } from "../../../shared/logic/PlayerTradeLogic";
import { formatPercent } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { AccountLevelImages, AccountLevelNames } from "../logic/AccountLevel";
import { usePlayerMap, useTrades } from "../rpc/RPCClient";
import { getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { ClaimTileComponent } from "./ClaimTileComponent";
import { FillPlayerTradeModal } from "./FillPlayerTradeModal";
import { showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function PlayerTilePage({ xy }: { xy: string }): React.ReactNode {
   const playerMap = usePlayerMap();
   const tile = playerMap.get(xy);
   if (!tile) {
      return null;
   }
   const trades = useTrades();
   const isReserved = isTileReserved(tile);
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{tile.handle}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            {isReserved ? null : (
               <>
                  <WarningComponent icon="info" className="mb10">
                     <RenderHTML html={t(L.PlayerMapClaimTileNoLongerReserved, { name: tile.handle })} />
                  </WarningComponent>
                  <ClaimTileComponent xy={xy} />
               </>
            )}
            <fieldset>
               <legend className="row">
                  {tile.handle}
                  <img
                     src={getFlagUrl(tile.flag)}
                     className="player-flag ml5"
                     title={getCountryName(tile.flag)}
                  />
                  <img
                     src={AccountLevelImages[tile.level]}
                     className="player-flag ml5"
                     title={AccountLevelNames[tile.level]()}
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
               <div className="row mv5">
                  <div className="f1">{t(L.PlayerMapLastSeenAt)}</div>
                  <div className="text-strong">{new Date(tile.lastSeenAt).toLocaleDateString()}</div>
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
                                             showModal(<FillPlayerTradeModal tradeId={trade.id} />);
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
