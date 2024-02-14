import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import { getStorageFor } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { TRADE_CANCEL_REFUND_PERCENT } from "../../../shared/logic/Constants";
import { getMaxActiveTrades, getTradePercentage } from "../../../shared/logic/PlayerTradeLogic";
import { PendingClaimFlag, type IPendingClaim } from "../../../shared/utilities/Database";
import {
   CURRENCY_PERCENT_EPSILON,
   formatPercent,
   hasFlag,
   isNullOrUndefined,
   mathSign,
   safeAdd,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { AccountLevelImages, AccountLevelNames } from "../logic/AccountLevel";
import { OnNewPendingClaims, client, useTrades, useUser } from "../rpc/RPCClient";
import { getMyMapXy } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { useTypedEvent } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playError, playKaching } from "../visuals/Sound";
import { AddTradeComponent } from "./AddTradeComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { ConfirmModal } from "./ConfirmModal";
import { FillPlayerTradeModal } from "./FillPlayerTradeModal";
import { showModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
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

function PendingClaimComponent({ gameState, xy }: IBuildingComponentProps) {
   const [pendingClaims, setPendingClaims] = useState<IPendingClaim[]>([]);
   useEffect(() => {
      client.getPendingClaims().then(setPendingClaims);
   }, []);
   useTypedEvent(OnNewPendingClaims, () => {
      client.getPendingClaims().then(setPendingClaims);
   });

   if (pendingClaims.length === 0) {
      return null;
   }
   return (
      <>
         <button
            className="w100 jcc row mb10"
            onClick={async () => {
               try {
                  const building = gameState.tiles.get(xy)?.building;
                  if (!building) {
                     return;
                  }

                  const { total, used } = getStorageFor(xy, gameState);
                  const available = total - used;
                  const sorted = pendingClaims.slice(0).sort((a, b) => a.amount - b.amount);
                  const toClaim: string[] = [];

                  let storageNeeded = 0;
                  for (const claim of sorted) {
                     if (storageNeeded + claim.amount > available) {
                        break;
                     }
                     toClaim.push(claim.id);
                     storageNeeded += claim.amount;
                  }
                  playKaching();
                  const result = await client.claimTrades(toClaim);
                  setPendingClaims(result.pendingClaims);
                  const confirmed = new Set(result.claimedIds);
                  for (const claim of sorted) {
                     if (confirmed.has(claim.id)) {
                        safeAdd(building.resources, claim.resource, claim.amount);
                     }
                  }
                  showToast(t(L.PlayerTradeClaimAllMessage, { count: confirmed.size }));
               } catch (error) {
                  playError();
                  showToast(String(error));
               }
            }}
         >
            <div className="m-icon small">local_shipping</div>
            <div className="f1 text-strong">{t(L.PlayerTradeClaimAll)}</div>
         </button>
         <div className="table-view">
            <table>
               <tr>
                  <th style={{ width: "30px" }}></th>
                  <th>{t(L.PlayerTradeResource)}</th>
                  <th>{t(L.PlayerTradeFillBy)}</th>
                  <th className="text-right">{t(L.PlayerTradeAmount)}</th>
               </tr>
               {pendingClaims.map((trade) => {
                  return (
                     <tr key={trade.id}>
                        <td>
                           {hasFlag(trade.flag, PendingClaimFlag.Tariff) ? (
                              <Tippy content={t(L.PlayerTradeTariffTooltip)}>
                                 <div className="m-icon small text-center text-orange">currency_exchange</div>
                              </Tippy>
                           ) : null}
                        </td>
                        <td>{Config.Resource[trade.resource as Resource].name()}</td>
                        <td>{trade.fillBy}</td>
                        <td className="text-right">
                           <FormatNumber value={trade.amount} />
                        </td>
                     </tr>
                  );
               })}
            </table>
         </div>
         <div className="separator" />
      </>
   );
}
