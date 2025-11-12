import Tippy from "@tippyjs/react";
import { Config } from "../../../shared/logic/Config";
import { isTileReserved } from "../../../shared/logic/PlayerTradeLogic";
import { UserAttributes, UserColorsMapping } from "../../../shared/utilities/Database";
import { formatPercent, hasFlag } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { AccountLevelNames } from "../logic/AccountLevel";
import { usePlayerMap, useTrades } from "../rpc/RPCClient";
import { getCountryName } from "../utilities/CountryCode";
import { ClaimTileComponent } from "./ClaimTileComponent";
import { FillPlayerTradeModal } from "./FillPlayerTradeModal";
import { hideModal, showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { MapTileBonusComponent } from "./MapTileBonusComponent";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { AccountLevelComponent, MiscTextureComponent, PlayerFlagComponent } from "./TextureSprites";
import { TitleBarComponent } from "./TitleBarComponent";
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
         <TitleBarComponent>{tile.handle}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body">
            <MapTileBonusComponent xy={xy} />
            {isReserved ? null : (
               <>
                  <WarningComponent icon="info" className="mb10">
                     <RenderHTML html={t(L.PlayerMapClaimTileNoLongerReserved, { name: tile.handle })} />
                  </WarningComponent>
                  <ClaimTileComponent xy={xy} />
               </>
            )}
            <fieldset>
               <legend className="text-strong row">
                  <div style={{ color: UserColorsMapping[tile.color] }}>{tile.handle}</div>
                  <Tippy content={getCountryName(tile.flag)}>
                     <PlayerFlagComponent name={tile.flag} style={{ marginLeft: 5 }} scale={0.7} />
                  </Tippy>
                  <Tippy content={AccountLevelNames[tile.level]()}>
                     <AccountLevelComponent level={tile.level} scale={0.17} style={{ marginLeft: 5 }} />
                  </Tippy>
                  {hasFlag(tile.attr, UserAttributes.DLC1) ? (
                     <Tippy content={t(L.AccountSupporter)}>
                        <MiscTextureComponent name="Supporter" scale={0.17} style={{ marginLeft: 5 }} />
                     </Tippy>
                  ) : null}
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
                  <div className="f1">{t(L.Civilization)}</div>
                  <div className="text-strong">{tile.city ? Config.City[tile.city].name() : null}</div>
               </div>
               <div className="row mv5">
                  <div className="f1">{t(L.TechAge)}</div>
                  <div className="text-strong">
                     {tile.techAge ? Config.TechAge[tile.techAge].name() : null}
                  </div>
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
                                       {Config.Material[trade.buyResource].name()} x{" "}
                                       <FormatNumber value={trade.buyAmount} />
                                    </td>
                                    <td>
                                       {Config.Material[trade.sellResource].name()} x{" "}
                                       <FormatNumber value={trade.sellAmount} />
                                    </td>
                                    <td>
                                       <div
                                          className="text-strong text-blue pointer"
                                          onClick={() => {
                                             showModal(
                                                <FillPlayerTradeModal
                                                   hideModal={hideModal}
                                                   tradeId={trade.id}
                                                />,
                                             );
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
