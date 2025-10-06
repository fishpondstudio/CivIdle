import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useState } from "react";
import { TableVirtuoso } from "react-virtuoso";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import { TRADE_CANCEL_REFUND_PERCENT } from "../../../shared/logic/Constants";
import type { GameState } from "../../../shared/logic/GameState";
import { unlockedResources } from "../../../shared/logic/IntraTickCache";
import { getTradePercentage, hasResourceForPlayerTrade } from "../../../shared/logic/PlayerTradeLogic";
import { addResourceTo, getAvailableStorage } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { UserAttributes, type IClientTrade } from "../../../shared/utilities/Database";
import {
   CURRENCY_PERCENT_EPSILON,
   cls,
   formatNumber,
   formatPercent,
   hasFlag,
   keysOf,
   mathSign,
   safeParseInt,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { AccountLevelNames } from "../logic/AccountLevel";
import { client, useTrades, useUser } from "../rpc/RPCClient";
import { getOwnedTradeTile } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { getCountryName } from "../utilities/CountryCode";
import { Singleton } from "../utilities/Singleton";
import { playError, playKaching } from "../visuals/Sound";
import { AddTradeComponent } from "./AddTradeComponent";
import { ConfirmModal } from "./ConfirmModal";
import { FillPlayerTradeModal } from "./FillPlayerTradeModal";
import { FixedLengthText } from "./FixedLengthText";
import { showModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { RenderHTML } from "./RenderHTMLComponent";
import { AccountLevelComponent, MiscTextureComponent, PlayerFlagComponent } from "./TextureSprites";
import { WarningComponent } from "./WarningComponent";

const savedResourceWantFilters: Set<Resource> = new Set();
const savedResourceOfferFilters: Set<Resource> = new Set();
let savedPlayerNameFilter = "";
let savedMaxTradeAmountFilter = 0;
const playerTradesSortingState = { column: 0, asc: true };

export function PlayerTradeNewComponent({ gameState }: { gameState: GameState }): React.ReactNode {
   const [resourceWantFilters, setResourceWantFilters] = useState(savedResourceWantFilters);
   const [resourceOfferFilters, setResourceOfferFilters] = useState(savedResourceOfferFilters);
   const [showFilters, setShowFilters] = useState(false);
   const [playerNameFilter, setPlayerNameFilter] = useState<string>(savedPlayerNameFilter);
   const [tradeAmountFilter, setTradeAmountFilter] = useState<number>(savedMaxTradeAmountFilter);
   const trades = useTrades();
   const user = useUser();
   const myXy = getOwnedTradeTile();
   if (!myXy) {
      return (
         <WarningComponent icon="info">
            <div>{t(L.PlayerTradeClaimTileFirstWarning)}</div>
            <div
               className="text-strong text-link row"
               onClick={() => Singleton().sceneManager.loadScene(PlayerMapScene)}
            >
               {t(L.PlayerTradeClaimTileFirst)}
            </div>
         </WarningComponent>
      );
   }

   const clearFilters = () => {
      savedResourceWantFilters.clear();
      setResourceWantFilters(new Set(savedResourceWantFilters));
      savedResourceOfferFilters.clear();
      setResourceOfferFilters(new Set(savedResourceOfferFilters));
      savedPlayerNameFilter = "";
      setPlayerNameFilter(savedPlayerNameFilter);
      savedMaxTradeAmountFilter = 0;
      setTradeAmountFilter(savedMaxTradeAmountFilter);
      setShowFilters(false);
   };

   const resources = keysOf(unlockedResources(gameState, "Koti")).filter((r) => !NoStorage[r] && !NoPrice[r]);
   return (
      <>
         <div className="sep5" />
         <AddTradeComponent gameState={gameState} />
         {showFilters ? (
            <fieldset>
               <legend>{t(L.PlayerTradeFilters)}</legend>
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
                           .sort((a, b) => Config.Resource[a].name().localeCompare(Config.Resource[b].name()))
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
                                       <div className="m-icon small text-desc">check_box_outline_blank</div>
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
                                       <div className="m-icon small text-desc">check_box_outline_blank</div>
                                    )}
                                 </td>
                              </tr>
                           ))}
                     </tbody>
                  </table>
               </div>
               <div className="row mt10">
                  <div style={{ width: 100 }}>{t(L.PlayerTradePlayerNameFilter)}</div>
                  <input
                     type="text"
                     className="f1"
                     size={1}
                     value={playerNameFilter}
                     onChange={(e) => {
                        savedPlayerNameFilter = e.target.value;
                        setPlayerNameFilter(savedPlayerNameFilter);
                     }}
                     onClick={(e) => (e.target as HTMLInputElement)?.select()}
                  />
               </div>
               <div className="sep10" />
               <div className="row">
                  <div style={{ width: 100 }}>{t(L.PlayerTradeMaxTradeAmountFilter)}</div>
                  <input
                     type="text"
                     className="f1"
                     size={1}
                     value={tradeAmountFilter}
                     onChange={(e) => {
                        savedMaxTradeAmountFilter = safeParseInt(e.target.value, 0);
                        setTradeAmountFilter(savedMaxTradeAmountFilter);
                     }}
                     onClick={(e) => (e.target as HTMLInputElement)?.select()}
                  />
               </div>
               <div className="row mt10">
                  <button
                     className="f1 text-center text-strong"
                     onClick={() => {
                        setShowFilters(false);
                     }}
                  >
                     {t(L.PlayerTradeFiltersApply)}
                  </button>
                  <button className="f1 text-center" onClick={clearFilters}>
                     {t(L.PlayerTradeFiltersClear)}
                  </button>
               </div>
            </fieldset>
         ) : (
            <div className="row mb10">
               <button
                  className="row f1 jcc"
                  onClick={() => {
                     setShowFilters(true);
                  }}
               >
                  <div className="m-icon small">filter_list</div>
                  <div className="text-strong f1">
                     {t(L.PlayerTradeFilters)} (
                     {resourceWantFilters.size +
                        resourceOfferFilters.size +
                        (playerNameFilter.length > 0 ? 1 : 0)}
                     )
                  </div>
               </button>
               <Tippy content={t(L.PlayerTradeFilterWhatIHave)}>
                  <button
                     onClick={() => {
                        clearFilters();
                        resources.forEach((res) => {
                           if (hasResourceForPlayerTrade(res)) {
                              savedResourceWantFilters.add(res);
                           }
                        });
                        setResourceWantFilters(new Set(savedResourceWantFilters));
                        setResourceOfferFilters(new Set(savedResourceOfferFilters));
                     }}
                  >
                     <div className="m-icon small">database</div>
                  </button>
               </Tippy>
               <Tippy content={t(L.PlayerTradeClearFilter)}>
                  <button onClick={clearFilters}>
                     <div className="m-icon small">cancel</div>
                  </button>
               </Tippy>
            </div>
         )}
         <div className="table-view">
            <TableVirtuoso
               style={{ height: "70vh" }}
               data={trades.filter((trade) => {
                  const resourceFilter =
                     (resourceWantFilters.size === 0 && resourceOfferFilters.size === 0) ||
                     resourceWantFilters.has(trade.buyResource) ||
                     resourceOfferFilters.has(trade.sellResource);

                  const filterNames = playerNameFilter
                     .toLowerCase()
                     .split(" ")
                     .map((name) => name.trim())
                     .filter((name) => name.length > 0);

                  const nameFilter =
                     filterNames.length === 0 ||
                     filterNames.some((name) => trade.from.toLowerCase().includes(name));

                  const amountFilter =
                     tradeAmountFilter === 0 ||
                     (tradeAmountFilter > 0 && trade.buyAmount <= tradeAmountFilter);

                  return (
                     (resourceFilter && nameFilter && amountFilter) || (user && user.userId === trade.fromId)
                  );
               })}
               fixedHeaderContent={() => {
                  return (
                     <tr>
                        <th colSpan={2}>{t(L.PlayerTradeWant)}</th>
                        <th colSpan={2}>{t(L.PlayerTradeOffer)}</th>
                        <th></th>
                        <th>{t(L.PlayerTradeFrom)}</th>
                        <th></th>
                     </tr>
                  );
               }}
               itemContent={(index, trade) => {
                  return <PlayerTradeTableRow index={index} trade={trade} />;
               }}
            />
         </div>
      </>
   );
}

function PlayerTradeTableRow({ trade, index }: { trade: IClientTrade; index: number }): React.ReactNode {
   const user = useUser();
   const gameState = useGameState();
   const disableFill = user === null || trade.fromId === user.userId;
   const percentage = getTradePercentage(trade);
   const hasResource = hasResourceForPlayerTrade(trade.buyResource);
   const evenodd = index % 2 === 0 ? "white" : "grey";
   return (
      <>
         <td className={cls(hasResource ? "text-strong" : null, evenodd)}>
            {Config.Resource[trade.buyResource].name()}
         </td>
         <td className={cls("text-right", hasResource ? "text-strong" : null, evenodd)}>
            <FormatNumber value={trade.buyAmount} />
         </td>
         <td className={evenodd}>{Config.Resource[trade.sellResource].name()}</td>
         <td className={cls("text-right", evenodd)}>
            <FormatNumber value={trade.sellAmount} />
         </td>
         <td
            className={classNames({
               [evenodd]: true,
               "text-right": true,
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
         <td className={evenodd}>
            <div className="row">
               <Tippy content={getCountryName(trade.fromFlag)}>
                  <PlayerFlagComponent name={trade.fromFlag} scale={0.7} />
               </Tippy>
               {trade.fromLevel > 0 ? (
                  <Tippy content={AccountLevelNames[trade.fromLevel]()}>
                     <AccountLevelComponent level={trade.fromLevel} scale={0.17} />
                  </Tippy>
               ) : null}
               {hasFlag(trade.fromAttr, UserAttributes.DLC1) ? (
                  <Tippy content={t(L.AccountSupporter)}>
                     <MiscTextureComponent name="Supporter" scale={0.17} />
                  </Tippy>
               ) : null}
               <div className="ml5">
                  <FixedLengthText text={trade.from} length={16} />
               </div>
            </div>
         </td>
         <td className={evenodd}>
            {trade.fromId === user?.userId ? (
               <div
                  className="m-icon small text-link"
                  onClick={() => {
                     const availableStorage = getAvailableStorage(
                        Array.from(Tick.current.playerTradeBuildings.keys()),
                        gameState,
                     );
                     let storageOverflow = trade.sellAmount * TRADE_CANCEL_REFUND_PERCENT - availableStorage;
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
                        showModal(<FillPlayerTradeModal tradeId={trade.id} />);
                     }
                  }}
               >
                  {t(L.PlayerTradeFill)}
               </div>
            )}
         </td>
      </>
   );
}
