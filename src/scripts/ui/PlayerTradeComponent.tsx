import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useState } from "react";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import { TRADE_CANCEL_REFUND_PERCENT } from "../../../shared/logic/Constants";
import { unlockedResources } from "../../../shared/logic/IntraTickCache";
import { getTradePercentage, hasResourceForPlayerTrade } from "../../../shared/logic/PlayerTradeLogic";
import { addResourceTo, getAvailableStorage } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { UserAttributes } from "../../../shared/utilities/Database";
import {
   CURRENCY_PERCENT_EPSILON,
   formatNumber,
   formatPercent,
   hasFlag,
   keysOf,
   mathSign,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import Supporter from "../../images/Supporter.png";
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
import { RenderHTML } from "./RenderHTMLComponent";
import { TableView } from "./TableView";
import { WarningComponent } from "./WarningComponent";

const savedResourceWantFilters: Set<Resource> = new Set();
const savedResourceOfferFilters: Set<Resource> = new Set();
let savedPlayerNameFilters = "";
let savedMaxTradeAmountFilter = 0;
const playerTradesSortingState = { column: 0, asc: true };

export function PlayerTradeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   const [resourceWantFilters, setResourceWantFilters] = useState(savedResourceWantFilters);
   const [resourceOfferFilters, setResourceOfferFilters] = useState(savedResourceOfferFilters);
   const [showFilters, setShowFilters] = useState(false);
   const [playerNameFilter, setPlayerNameFilter] = useState<string>(savedPlayerNameFilters);
   const [tradeAmountFilter, setTradeAmountFilter] = useState<number>(savedMaxTradeAmountFilter);
   if (!building) {
      return null;
   }
   const trades = useTrades();

   const user = useUser();
   const myXy = getMyMapXy();
   if (!myXy) {
      return (
         <article role="tabpanel" className="f1 column" style={{ padding: "8px" }}>
            <WarningComponent icon="info">
               <div>{t(L.PlayerTradeClaimTileFirstWarning)}</div>
               <div
                  className="text-strong text-link row"
                  onClick={() => Singleton().sceneManager.loadScene(PlayerMapScene)}
               >
                  {t(L.PlayerTradeClaimTileFirst)}
               </div>
            </WarningComponent>
         </article>
      );
   }

   const resources = keysOf(unlockedResources(gameState)).filter((r) => !NoStorage[r] && !NoPrice[r]);
   return (
      <article role="tabpanel" className="f1 column" style={{ padding: "8px" }}>
         <fieldset>
            <legend>{t(L.PlayerTrade)}</legend>
            <AddTradeComponent gameState={gameState} xy={xy} />
            {showFilters ? (
               <fieldset>
                  <legend className="text-strong">{t(L.PlayerTradeFilters)}</legend>
                  <div className="table-view sticky-header" style={{ overflowY: "auto", maxHeight: "200px" }}>
                     <table>
                        <thead>
                           <tr>
                              <th>{t(L.PlayerTradeResource)}</th>
                              <th>{t(L.PlayerTradeWant)}</th>
                              <th>{t(L.PlayerTradeOffer)}</th>
                           </tr>
                        </thead>
                        <tbody>
                           {resources
                              .sort((a, b) =>
                                 Config.Resource[a].name().localeCompare(Config.Resource[b].name()),
                              )
                              .map((res) => (
                                 <tr key={res}>
                                    <td>{Config.Resource[res].name()}</td>
                                    <td
                                       style={{ width: 0 }}
                                       className="text-strong"
                                       onClick={() => {
                                          if (savedResourceWantFilters.has(res)) {
                                             savedResourceWantFilters.delete(res);
                                          } else {
                                             savedResourceWantFilters.add(res);
                                          }
                                          setResourceWantFilters(new Set(savedResourceWantFilters));
                                       }}
                                    >
                                       {savedResourceWantFilters.has(res) ? (
                                          <div className="m-icon small text-blue">check_box</div>
                                       ) : (
                                          <div className="m-icon small text-desc">
                                             check_box_outline_blank
                                          </div>
                                       )}
                                    </td>
                                    <td
                                       style={{ width: 0 }}
                                       className="text-strong"
                                       onClick={() => {
                                          if (savedResourceOfferFilters.has(res)) {
                                             savedResourceOfferFilters.delete(res);
                                          } else {
                                             savedResourceOfferFilters.add(res);
                                          }
                                          setResourceOfferFilters(new Set(savedResourceOfferFilters));
                                       }}
                                    >
                                       {savedResourceOfferFilters.has(res) ? (
                                          <div className="m-icon small text-blue">check_box</div>
                                       ) : (
                                          <div className="m-icon small text-desc">
                                             check_box_outline_blank
                                          </div>
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
                           savedResourceWantFilters.clear();
                           setResourceWantFilters(new Set(savedResourceWantFilters));
                           savedResourceOfferFilters.clear();
                           setResourceOfferFilters(new Set(savedResourceOfferFilters));
                           setShowFilters(false);
                        }}
                     >
                        {t(L.PlayerTradeFiltersClear)}
                     </button>
                  </div>
                  <div className="sep10"></div>
                  <div className="row">
                     <div>{t(L.PlayerTradePlayerNameFilter)}</div>
                     <input
                        type="text"
                        className="ml5 f1"
                        value={playerNameFilter}
                        onChange={(e) => {
                           savedPlayerNameFilters = e.target.value;
                           setPlayerNameFilter(savedPlayerNameFilters);
                        }}
                        onClick={(e) => (e.target as HTMLInputElement)?.select()}
                     />
                  </div>
                  <div className="sep10"></div>
                  <div className="row">
                     <div>{t(L.PlayerTradeMaxTradeAmountFilter)}</div>
                     <input
                        type="number"
                        className="ml5 f1"
                        value={tradeAmountFilter}
                        onChange={(e) => {
                           savedMaxTradeAmountFilter = Number(e.target.value);
                           setTradeAmountFilter(savedMaxTradeAmountFilter);
                        }}
                        onClick={(e) => (e.target as HTMLInputElement)?.select()}
                     />
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
                     {t(L.PlayerTradeFilters)} (
                     {resourceWantFilters.size +
                        resourceOfferFilters.size +
                        (playerNameFilter.length > 0 ? 1 : 0) +
                        (tradeAmountFilter > 0 ? 1 : 0)}
                     )
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
                     ((resourceWantFilters.size === 0 && resourceOfferFilters.size === 0) ||
                        resourceWantFilters.has(trade.buyResource) ||
                        resourceOfferFilters.has(trade.sellResource)) &&
                     trade.from.toLocaleLowerCase().includes(playerNameFilter) &&
                     (tradeAmountFilter === 0 ||
                        (tradeAmountFilter > 0 && trade.buyAmount <= tradeAmountFilter)),
               )}
               compareFunc={(a, b, col, asc) => {
                  if (a.fromId === user?.userId && b.fromId !== user?.userId) {
                     return -asc;
                  }
                  if (a.fromId !== user?.userId && b.fromId === user?.userId) {
                     return asc;
                  }
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
                     <tr key={trade.id} className={classNames({ blue: trade.fromId === user?.userId })}>
                        <td>
                           <div
                              className={classNames({
                                 "text-strong": hasResourceForPlayerTrade(trade.buyResource),
                              })}
                           >
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
                              <Tippy content={getCountryName(trade.fromFlag)}>
                                 <img src={getFlagUrl(trade.fromFlag)} className="player-flag game-cursor" />
                              </Tippy>
                              {trade.fromLevel > 0 ? (
                                 <Tippy content={AccountLevelNames[trade.fromLevel]()}>
                                    <img src={AccountLevelImages[trade.fromLevel]} className="player-flag" />
                                 </Tippy>
                              ) : null}
                              {hasFlag(trade.fromAttr, UserAttributes.DLC1) ? (
                                 <Tippy content={t(L.AccountSupporter)}>
                                    <img src={Supporter} className="player-flag" />
                                 </Tippy>
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
                                    const availableStorage = getAvailableStorage(
                                       Array.from(Tick.current.playerTradeBuildings.keys()),
                                       gameState,
                                    );
                                    let storageOverflow =
                                       trade.sellAmount * TRADE_CANCEL_REFUND_PERCENT - availableStorage;
                                    if (storageOverflow <= 0) {
                                       storageOverflow = 0;
                                    }
                                    showModal(
                                       <ConfirmModal
                                          title={t(L.PlayerTradeCancelTrade)}
                                          onConfirm={async () => {
                                             try {
                                                const cancelledTrade = await client.cancelTrade(trade.id);
                                                addResourceTo(
                                                   cancelledTrade.sellResource,
                                                   cancelledTrade.sellAmount * TRADE_CANCEL_REFUND_PERCENT,
                                                   Array.from(Tick.current.playerTradeBuildings.keys()),
                                                   gameState,
                                                );
                                                playKaching();
                                             } catch (error) {
                                                showToast(String(error));
                                                playError();
                                             }
                                          }}
                                       >
                                          <RenderHTML
                                             html={t(L.PlayerTradeCancelDescHTML, {
                                                percent: formatPercent(1 - TRADE_CANCEL_REFUND_PERCENT),
                                                res: `${formatNumber(
                                                   trade.sellAmount * TRADE_CANCEL_REFUND_PERCENT,
                                                )} ${Config.Resource[trade.sellResource].name()}`,
                                                discard: formatNumber(storageOverflow),
                                             })}
                                          />
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
      </article>
   );
}
