import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { getStorageFor } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { TRADE_CANCEL_REFUND_PERCENT } from "../../../shared/logic/Constants";
import { getMaxActiveTrades, getTradePercentage } from "../../../shared/logic/PlayerTradeLogic";
import {
   CURRENCY_PERCENT_EPSILON,
   formatPercent,
   isNullOrUndefined,
   mathSign,
   safeAdd,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { AccountLevelImages, AccountLevelNames } from "../logic/AccountLevel";
import { client, useTrades, useUser } from "../rpc/RPCClient";
import { getMyMapXy } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { Singleton } from "../utilities/Singleton";
import { playError, playKaching } from "../visuals/Sound";
import { AddTradeComponent } from "./AddTradeComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { ConfirmModal } from "./ConfirmModal";
import { FillPlayerTradeModal } from "./FillPlayerTradeModal";
import { showModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { PendingClaimComponent } from "./PendingClaimComponent";
import { TableView } from "./TableView";
import { WarningComponent } from "./WarningComponent";

export function PlayerTradeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const trades = useTrades();
   const user = useUser();
   const myXy = getMyMapXy();
   if (!myXy) {
      return (
         <>
            <WarningComponent icon="info">
               <div>{t(L.PlayerTradeClaimTileFirstWarning)}</div>
               <div
                  className="text-strong text-link row"
                  onClick={() => Singleton().sceneManager.loadScene(PlayerMapScene)}
               >
                  {t(L.PlayerTradeClaimTileFirst)}
               </div>
            </WarningComponent>
            <div className="sep10"></div>
         </>
      );
   }

   return (
      <fieldset>
         <legend>{t(L.PlayerTrade)}</legend>
         <PendingClaimComponent gameState={gameState} xy={xy} />
         <AddTradeComponent
            enabled={
               !isNullOrUndefined(user) &&
               trades.filter((t) => t.fromId === user.userId).length < getMaxActiveTrades(user)
            }
            gameState={gameState}
            xy={xy}
         />
         <TableView
            header={[
               { name: t(L.PlayerTradeWant), sortable: true },
               { name: t(L.PlayerTradeOffer), sortable: true },
               { name: "", sortable: true },
               { name: t(L.PlayerTradeFrom), sortable: true },
               { name: "", sortable: false },
            ]}
            data={trades}
            compareFunc={(a, b, col) => {
               switch (col) {
                  case 0:
                     return Config.Resource[a.buyResource]
                        .name()
                        .localeCompare(Config.Resource[b.buyResource].name());
                  case 1:
                     return Config.Resource[a.sellResource]
                        .name()
                        .localeCompare(Config.Resource[b.sellResource].name());
                  case 2:
                     return getTradePercentage(a) - getTradePercentage(b);
                  case 3:
                     return a.from.localeCompare(b.from);
                  default:
                     return 0;
               }
            }}
            renderRow={(trade) => {
               const disableFill = user === null || trade.fromId === user.userId;
               const percentage = getTradePercentage(trade);
               return (
                  <tr key={trade.id} className={classNames({ "text-strong": trade.fromId === user?.userId })}>
                     <td>
                        <div className={classNames({ "text-strong": building.resources[trade.buyResource] })}>
                           {Config.Resource[trade.buyResource].name()}
                        </div>
                        <div className="text-small text-strong text-desc">
                           <FormatNumber value={trade.buyAmount} />
                        </div>
                     </td>
                     <td>
                        <div>{Config.Resource[trade.sellResource].name()}</div>
                        <div className="text-small text-strong text-desc">
                           <FormatNumber value={trade.sellAmount} />
                        </div>
                     </td>
                     <td
                        className={classNames({
                           "text-small text-right": true,
                           "text-red": percentage <= -CURRENCY_PERCENT_EPSILON,
                           "text-green": percentage >= CURRENCY_PERCENT_EPSILON,
                           "text-desc": Math.abs(percentage) < CURRENCY_PERCENT_EPSILON,
                        })}
                     >
                        <Tippy content={t(L.MarketValueDesc, { value: formatPercent(percentage, 0) })}>
                           <div>
                              {mathSign(percentage, CURRENCY_PERCENT_EPSILON)}
                              {formatPercent(Math.abs(percentage), 0)}
                           </div>
                        </Tippy>
                     </td>
                     <td>
                        <div className="row">
                           <img
                              src={getFlagUrl(trade.fromFlag)}
                              className="player-flag game-cursor"
                              title={getCountryName(trade.fromFlag)}
                           />
                           {trade.fromLevel > 0 ? (
                              <img
                                 src={AccountLevelImages[trade.fromLevel]}
                                 className="player-flag"
                                 title={AccountLevelNames[trade.fromLevel]()}
                              />
                           ) : null}
                        </div>
                        <div className="text-small">{trade.from}</div>
                     </td>
                     <td>
                        {trade.fromId === user?.userId ? (
                           <div
                              className="m-icon small text-link"
                              onClick={() => {
                                 showModal(
                                    <ConfirmModal
                                       title={t(L.PlayerTradeCancelTrade)}
                                       onConfirm={async () => {
                                          try {
                                             const { total, used } = getStorageFor(xy, gameState);
                                             if (
                                                used + trade.sellAmount * TRADE_CANCEL_REFUND_PERCENT >
                                                total
                                             ) {
                                                throw new Error(t(L.PlayerTradeCancelTradeNotEnoughStorage));
                                             }
                                             const cancelledTrade = await client.cancelTrade(trade.id);
                                             safeAdd(
                                                building.resources,
                                                cancelledTrade.sellResource,
                                                cancelledTrade.sellAmount * TRADE_CANCEL_REFUND_PERCENT,
                                             );
                                             playKaching();
                                          } catch (error) {
                                             showToast(String(error));
                                             playError();
                                          }
                                       }}
                                    >
                                       {t(L.PlayerTradeCancelDesc, {
                                          percent: formatPercent(TRADE_CANCEL_REFUND_PERCENT),
                                       })}
                                    </ConfirmModal>,
                                 );
                              }}
                           >
                              delete
                           </div>
                        ) : (
                           <div
                              className={classNames({
                                 "text-link": !disableFill,
                                 "text-strong": true,
                                 "text-desc": disableFill,
                              })}
                              onClick={() => {
                                 if (!disableFill) {
                                    showModal(<FillPlayerTradeModal trade={trade} xy={xy} />);
                                 }
                              }}
                           >
                              {t(L.PlayerTradeFill)}
                           </div>
                        )}
                     </td>
                  </tr>
               );
            }}
         />
      </fieldset>
   );
}
