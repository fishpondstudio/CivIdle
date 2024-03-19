import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useState } from "react";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { getStorageFor } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { TRADE_CANCEL_REFUND_PERCENT } from "../../../shared/logic/Constants";
import { unlockedResources } from "../../../shared/logic/IntraTickCache";
import { getTradePercentage } from "../../../shared/logic/PlayerTradeLogic";
import {
   CURRENCY_PERCENT_EPSILON,
   formatPercent,
   keysOf,
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
import { FixedLengthText } from "./FixedLengthText";
import { showModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { PendingClaimComponent } from "./PendingClaimComponent";
import { TableView } from "./TableView";
import { WarningComponent } from "./WarningComponent";

const savedResourceFilters: Set<Resource> = new Set();
const playerTradesSortingState = { column: 0, asc: true };

export function PlayerTradeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   const [resourceFilters, setResourceFilters] = useState(savedResourceFilters);
   const [showFilters, setShowFilters] = useState(false);

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

   const resources = keysOf(unlockedResources(gameState)).filter((r) => !NoStorage[r] && !NoPrice[r]);
   return (
      <fieldset>
         <legend>{t(L.PlayerTrade)}</legend>
         <PendingClaimComponent gameState={gameState} xy={xy} />
         <AddTradeComponent gameState={gameState} xy={xy} />
         {showFilters ? (
            <fieldset>
               <legend className="text-strong">{t(L.PlayerTradeFilters)}</legend>
               <div className="table-view" style={{ overflowY: "auto", maxHeight: "200px" }}>
                  <table>
                     <tbody>
                        {resources
                           .sort((a, b) => Config.Resource[a].name().localeCompare(Config.Resource[b].name()))
                           .map((res) => (
                              <tr key={res}>
                                 <td>{Config.Resource[res].name()}</td>
                                 <td
                                    style={{ width: 0 }}
                                    className="text-strong"
                                    onClick={() => {
                                       if (savedResourceFilters.has(res)) {
                                          savedResourceFilters.delete(res);
                                       } else {
                                          savedResourceFilters.add(res);
                                       }
                                       setResourceFilters(new Set(savedResourceFilters));
                                    }}
                                 >
                                    {savedResourceFilters.has(res) ? (
                                       <div className="m-icon small text-blue">check_box</div>
                                    ) : (
                                       <div className="m-icon small text-desc">check_box_outline_blank</div>
                                    )}
                                 </td>
                              </tr>
                           ))}
                     </tbody>
                  </table>
               </div>
               <div className="sep10"></div>
               <div className="row">
                  <button
                     className="f1 text-center text-strong"
                     onClick={() => {
                        setShowFilters(false);
                     }}
                  >
                     {t(L.PlayerTradeFiltersApply)}
                  </button>
                  <div style={{ width: 10 }} />
                  <button
                     className="f1 text-center"
                     onClick={() => {
                        savedResourceFilters.clear();
                        setResourceFilters(new Set(savedResourceFilters));
                        setShowFilters(false);
                     }}
                  >
                     {t(L.PlayerTradeFiltersClear)}
                  </button>
               </div>
            </fieldset>
         ) : (
            <button
               className="row w100 jcc mb10"
               onClick={() => {
                  setShowFilters(true);
               }}
            >
               <div className="m-icon small">filter_list</div>
               <div className="text-strong f1">
                  {t(L.PlayerTradeFilters)} ({resourceFilters.size})
               </div>
            </button>
         )}
         <TableView
            header={[
               { name: t(L.PlayerTradeWant), sortable: true },
               { name: t(L.PlayerTradeOffer), sortable: true },
               { name: "", sortable: true },
               { name: t(L.PlayerTradeFrom), sortable: true },
               { name: "", sortable: false },
            ]}
            sortingState={playerTradesSortingState}
            data={trades.filter(
               (trade) =>
                  resourceFilters.size === 0 ||
                  resourceFilters.has(trade.buyResource) ||
                  resourceFilters.has(trade.sellResource),
            )}
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
                        <div className="text-small">
                           <FixedLengthText text={trade.from} length={10} />
                        </div>
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
                                    showModal(<FillPlayerTradeModal tradeId={trade.id} xy={xy} />);
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
