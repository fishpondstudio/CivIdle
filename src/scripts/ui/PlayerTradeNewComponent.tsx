import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useCallback, useState } from "react";
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
import { getCountryName } from "../utilities/CountryCode";
import { useForceUpdate } from "../utilities/Hook";
import { playError, playKaching } from "../visuals/Sound";
import { AddTradeButtonComponent, AddTradeFormComponent } from "./AddTradeComponent";
import { ConfirmModal } from "./ConfirmModal";
import { FillPlayerTradeModal } from "./FillPlayerTradeModal";
import { FixedLengthText } from "./FixedLengthText";
import { showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { RenderHTML } from "./RenderHTMLComponent";
import { AccountLevelComponent, MiscTextureComponent, PlayerFlagComponent } from "./TextureSprites";

const savedResourceWantFilters: Set<Resource> = new Set();
const savedResourceOfferFilters: Set<Resource> = new Set();
let savedPlayerNameFilter = "";
let savedMaxTradeAmountFilter = 0;
const playerTradesSortingState: { column: keyof IClientTrade | "difference"; asc: boolean } = {
   column: "buyResource",
   asc: true,
};

function clearSavedFilters() {
   savedResourceWantFilters.clear();
   savedResourceOfferFilters.clear();
   savedPlayerNameFilter = "";
   savedMaxTradeAmountFilter = 0;
}

export function PlayerTradeNewComponent({
   gameState,
   showModal,
   hideModal,
}: {
   gameState: GameState;
   showModal: (modal: React.ReactNode) => void;
   hideModal: () => void;
}): React.ReactNode {
   const [resourceWantFilters, setResourceWantFilters] = useState(savedResourceWantFilters);
   const [resourceOfferFilters, setResourceOfferFilters] = useState(savedResourceOfferFilters);
   const [playerNameFilter, setPlayerNameFilter] = useState<string>(savedPlayerNameFilter);
   const [tradeAmountFilter, setTradeAmountFilter] = useState<number>(savedMaxTradeAmountFilter);
   const trades = useTrades();
   const user = useUser();
   const forceUpdate = useForceUpdate();

   const clearFilters = () => {
      clearSavedFilters();
      applyFilters();
   };

   const applyFilters = useCallback(() => {
      setResourceWantFilters(new Set(savedResourceWantFilters));
      setResourceOfferFilters(new Set(savedResourceOfferFilters));
      setPlayerNameFilter(savedPlayerNameFilter);
      setTradeAmountFilter(savedMaxTradeAmountFilter);
   }, []);

   const resources = keysOf(unlockedResources(gameState, "Koti")).filter((r) => !NoStorage[r] && !NoPrice[r]);
   return (
      <>
         <div className="row m5">
            <AddTradeButtonComponent onClick={() => showModal(<AddTradeModal hideModal={hideModal} />)} />
            <button
               className="row jcc"
               onClick={() => {
                  showModal(
                     <PlayerTradeFilterModal
                        hideModal={hideModal}
                        resources={resources}
                        applyFilters={applyFilters}
                     />,
                  );
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
                     clearSavedFilters();
                     resources.forEach((res) => {
                        if (hasResourceForPlayerTrade(res)) {
                           savedResourceWantFilters.add(res);
                        }
                     });
                     applyFilters();
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
         <div className="table-view">
            <TableVirtuoso
               style={{ height: "70vh" }}
               data={trades
                  .filter((trade) => {
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
                        (resourceFilter && nameFilter && amountFilter) ||
                        (user && user.userId === trade.fromId)
                     );
                  })
                  .sort((a, b) => {
                     const asc = playerTradesSortingState.asc ? 1 : -1;
                     if (a.fromId === user?.userId && b.fromId !== user?.userId) {
                        return -asc;
                     }
                     if (a.fromId !== user?.userId && b.fromId === user?.userId) {
                        return asc;
                     }
                     let result = asc;
                     switch (playerTradesSortingState.column) {
                        case "buyResource":
                           result *= Config.Resource[a.buyResource]
                              .name()
                              .localeCompare(Config.Resource[b.buyResource].name());
                           break;
                        case "buyAmount":
                           result *= a.buyAmount - b.buyAmount;
                           break;
                        case "sellResource":
                           result *= Config.Resource[a.sellResource]
                              .name()
                              .localeCompare(Config.Resource[b.sellResource].name());
                           break;
                        case "sellAmount":
                           result *= a.sellAmount - b.sellAmount;
                           break;
                        case "difference":
                           result *= getTradePercentage(a) - getTradePercentage(b);
                           break;
                        case "from":
                           result *= a.from.localeCompare(b.from);
                           break;
                     }
                     return result;
                  })}
               fixedHeaderContent={() => {
                  return (
                     <tr>
                        <th
                           className="pointer"
                           onClick={() => {
                              playerTradesSortingState.column = "buyResource";
                              playerTradesSortingState.asc = !playerTradesSortingState.asc;
                              forceUpdate();
                           }}
                        >
                           <div className="row pointer">
                              {t(L.PlayerTradeWant)}
                              {playerTradesSortingState.column === "buyResource" ? (
                                 <div className="m-icon small">
                                    {playerTradesSortingState.asc ? "arrow_upward" : "arrow_downward"}
                                 </div>
                              ) : null}
                           </div>
                        </th>
                        <th
                           className="pointer"
                           onClick={() => {
                              playerTradesSortingState.column = "buyAmount";
                              playerTradesSortingState.asc = !playerTradesSortingState.asc;
                              forceUpdate();
                           }}
                        >
                           {playerTradesSortingState.column === "buyAmount" ? (
                              <div className="m-icon small">
                                 {playerTradesSortingState.asc ? "arrow_upward" : "arrow_downward"}
                              </div>
                           ) : null}
                        </th>
                        <th
                           className="pointer"
                           onClick={() => {
                              playerTradesSortingState.column = "sellResource";
                              playerTradesSortingState.asc = !playerTradesSortingState.asc;
                              forceUpdate();
                           }}
                        >
                           <div className="row">
                              {t(L.PlayerTradeOffer)}
                              {playerTradesSortingState.column === "sellResource" ? (
                                 <div className="m-icon small">
                                    {playerTradesSortingState.asc ? "arrow_upward" : "arrow_downward"}
                                 </div>
                              ) : null}
                           </div>
                        </th>
                        <th
                           className="pointer"
                           onClick={() => {
                              playerTradesSortingState.column = "sellAmount";
                              playerTradesSortingState.asc = !playerTradesSortingState.asc;
                              forceUpdate();
                           }}
                        >
                           {playerTradesSortingState.column === "sellAmount" ? (
                              <div className="m-icon small">
                                 {playerTradesSortingState.asc ? "arrow_upward" : "arrow_downward"}
                              </div>
                           ) : null}
                        </th>
                        <th
                           className="pointer"
                           onClick={() => {
                              playerTradesSortingState.column = "difference";
                              playerTradesSortingState.asc = !playerTradesSortingState.asc;
                              forceUpdate();
                           }}
                        >
                           {playerTradesSortingState.column === "difference" ? (
                              <div className="m-icon small">
                                 {playerTradesSortingState.asc ? "arrow_upward" : "arrow_downward"}
                              </div>
                           ) : null}
                        </th>
                        <th>{t(L.PlayerTradeFrom)}</th>
                        <th
                           className="pointer"
                           onClick={() => {
                              playerTradesSortingState.column = "from";
                              playerTradesSortingState.asc = !playerTradesSortingState.asc;
                              forceUpdate();
                           }}
                        >
                           {playerTradesSortingState.column === "from" ? (
                              <div className="m-icon small">
                                 {playerTradesSortingState.asc ? "arrow_upward" : "arrow_downward"}
                              </div>
                           ) : null}
                        </th>
                        <th></th>
                     </tr>
                  );
               }}
               itemContent={(index, trade) => {
                  return (
                     <PlayerTradeTableRow
                        index={index}
                        trade={trade}
                        showModal={showModal}
                        hideModal={hideModal}
                     />
                  );
               }}
            />
         </div>
      </>
   );
}

function PlayerTradeTableRow({
   trade,
   index,
   showModal,
   hideModal,
}: {
   trade: IClientTrade;
   index: number;
   showModal: (modal: React.ReactNode) => void;
   hideModal: () => void;
}): React.ReactNode {
   const user = useUser();
   const gameState = useGameState();
   const disableFill = user === null || trade.fromId === user.userId;
   const percentage = getTradePercentage(trade);
   const hasResource = hasResourceForPlayerTrade(trade.buyResource);
   let evenodd = index % 2 === 0 ? "white" : "grey";
   if (trade.fromId === user?.userId) {
      evenodd = "blue";
   }
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
            </div>
         </td>
         <td className={evenodd}>
            <FixedLengthText text={trade.from} length={16} />
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
                           hideModalFunc={hideModal}
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
                        showModal(<FillPlayerTradeModal hideModal={hideModal} tradeId={trade.id} />);
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

function AddTradeModal({ hideModal }: { hideModal: () => void }): React.ReactNode {
   const gameState = useGameState();
   return (
      <div className="window" style={{ width: 500, maxWidth: "50vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerTradeFillTradeTitle)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body" style={{ padding: "5px 8px 0" }}>
            <AddTradeFormComponent onCancel={hideModal} onSuccess={hideModal} gameState={gameState} />
         </div>
      </div>
   );
}

function PlayerTradeFilterModal({
   hideModal,
   resources,
   applyFilters,
}: { hideModal: () => void; resources: Resource[]; applyFilters: () => void }): React.ReactNode {
   const forceUpdate = useForceUpdate();
   return (
      <div className="window" style={{ width: 350, maxWidth: "50vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerTradeFilters)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <div className="table-view sticky-header" style={{ overflowY: "auto", maxHeight: "30vh" }}>
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
                                    forceUpdate();
                                    applyFilters();
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
                                    forceUpdate();
                                    applyFilters();
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
            <div className="row g10">
               <div className="f1">
                  <div className="mv5">{t(L.PlayerTradePlayerNameFilter)}</div>
                  <input
                     className="w100"
                     type="text"
                     size={1}
                     value={savedPlayerNameFilter}
                     onChange={(e) => {
                        savedPlayerNameFilter = e.target.value;
                        forceUpdate();
                        applyFilters();
                     }}
                     onClick={(e) => (e.target as HTMLInputElement)?.select()}
                  />
               </div>
               <div className="f1">
                  <div className="mv5">{t(L.PlayerTradeMaxTradeAmountFilter)}</div>
                  <div>
                     <input
                        type="text"
                        className="w100"
                        size={1}
                        value={savedMaxTradeAmountFilter}
                        onChange={(e) => {
                           savedMaxTradeAmountFilter = safeParseInt(e.target.value, 0);
                           forceUpdate();
                           applyFilters();
                        }}
                        onClick={(e) => (e.target as HTMLInputElement)?.select()}
                     />
                  </div>
               </div>
            </div>
            <div className="row mt10">
               <button
                  className="f1 text-center"
                  onClick={() => {
                     savedResourceWantFilters.clear();
                     savedResourceOfferFilters.clear();
                     savedPlayerNameFilter = "";
                     savedMaxTradeAmountFilter = 0;
                     applyFilters();
                     hideModal();
                  }}
               >
                  {t(L.PlayerTradeFiltersClear)}
               </button>
               <button
                  className="f1 text-center text-strong"
                  onClick={() => {
                     applyFilters();
                     hideModal();
                  }}
               >
                  {t(L.PlayerTradeFiltersApply)}
               </button>
            </div>
         </div>
      </div>
   );
}
