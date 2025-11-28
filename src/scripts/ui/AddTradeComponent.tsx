import Tippy from "@tippyjs/react";
import { useState } from "react";
import { NoPrice, NoStorage, type Material } from "../../../shared/definitions/MaterialDefinitions";
import { Config } from "../../../shared/logic/Config";
import { DISABLE_PLAYER_TRADES } from "../../../shared/logic/Constants";
import type { GameState } from "../../../shared/logic/GameState";
import { getGameState, notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { unlockedResources } from "../../../shared/logic/IntraTickCache";
import {
   getBuyAmountRange,
   getMaxActiveTrades,
   getUserTradePriceRange,
} from "../../../shared/logic/PlayerTradeLogic";
import { combineResources, deductResourceFrom } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import type { IAddTradeRequest } from "../../../shared/utilities/Database";
import {
   clamp,
   formatPercent,
   isNullOrUndefined,
   keysOf,
   safeParseInt,
   uuid4,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { client, useTrades, useUser } from "../rpc/RPCClient";
import { playClick, playError, playKaching } from "../visuals/Sound";
import { showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";

const INPUT_WIDTH = 100;

export function AddTradeComponent({ gameState }: { gameState: GameState }): React.ReactNode {
   const [showTrade, setShowTrade] = useState(false);
   if (showTrade) {
      return (
         <AddTradeFormComponent
            hideModal={() => {}}
            onCancel={() => setShowTrade(false)}
            gameState={gameState}
         />
      );
   }
   return <AddTradeButtonComponent onClick={() => setShowTrade(true)} />;
}

export function AddTradeFormComponent({
   gameState,
   onCancel,
   hideModal,
}: { gameState: GameState; onCancel: () => void; hideModal: () => void }): React.ReactNode {
   const user = useUser();
   const trades = useTrades();
   const options = useGameOptions();
   const enabled =
      !isNullOrUndefined(user) &&
      trades.filter((t) => t.fromId === user.userId).length < getMaxActiveTrades(user);
   const buyResources = keysOf(unlockedResources(gameState, "Koti")).filter(
      (r) => !NoStorage[r] && !NoPrice[r],
   );
   const availableResources = combineResources(
      Array.from(Tick.current.playerTradeBuildings.values()).map((m) => m.resources),
   );
   const sellResources = keysOf(availableResources);
   const [trade, setTrade] = useState<IAddTradeRequest>({
      buyResource: buyResources[0],
      buyAmount: 0,
      sellResource: sellResources[0],
      sellAmount: 0,
   });
   const percentage = getUserTradePriceRange(user);
   const buyAmountRange = getBuyAmountRange(trade, getUserTradePriceRange(user));

   function isTradeValid(trade: IAddTradeRequest): boolean {
      if (trade.buyResource === trade.sellResource) {
         return false;
      }
      if (trade.buyAmount < 1) {
         return false;
      }
      if (trade.buyAmount > buyAmountRange.max || trade.buyAmount < buyAmountRange.min) {
         return false;
      }
      if (trade.sellAmount < 0 || trade.sellAmount > (availableResources[trade.sellResource] ?? 0)) {
         return false;
      }
      return true;
   }

   return (
      <>
         <div className="text-strong mb5">{t(L.PlayerTradeIOffer)}</div>
         <div className="row">
            <select
               className="f1 mr10"
               value={trade.sellResource}
               onChange={(e) => {
                  if (e.target.value in Config.Material) {
                     setTrade({ ...trade, sellResource: e.target.value as Material });
                  }
               }}
            >
               {sellResources
                  .sort((a, b) => {
                     return Config.Material[a].name().localeCompare(Config.Material[b].name());
                  })
                  .map((res) => (
                     <option key={res} value={res}>
                        {Config.Material[res].name()}
                     </option>
                  ))}
            </select>
            <input
               style={{ width: INPUT_WIDTH }}
               className="text-right"
               type="text"
               value={trade.sellAmount}
               onChange={(e) => setTrade({ ...trade, sellAmount: safeParseInt(e.target.value) })}
            />
         </div>
         <div className="mt5 row text-desc text-small">
            <div className="f1">
               0 ~ <FormatNumber value={availableResources[trade.sellResource] ?? 0} />
            </div>
            {[0.1, 0.25, 0.5, 1].map((pct) => {
               return (
                  <div
                     key={pct}
                     className="text-link text-strong ml10"
                     onClick={() =>
                        setTrade({
                           ...trade,
                           sellAmount: Math.floor((availableResources[trade.sellResource] ?? 0) * pct),
                        })
                     }
                  >
                     {formatPercent(pct)}
                  </div>
               );
            })}
         </div>
         <div className="separator" style={{ margin: "8px -8px" }} />
         <div className="text-strong mb5">{t(L.PlayerTradeIWant)}</div>
         <div className="row">
            <select
               className="f1 mr10"
               value={trade.buyResource}
               onChange={(e) => {
                  if (e.target.value in Config.Material) {
                     setTrade({ ...trade, buyResource: e.target.value as Material });
                  }
               }}
            >
               {buyResources
                  .sort((a, b) => {
                     return Config.Material[a].name().localeCompare(Config.Material[b].name());
                  })
                  .map((res) => (
                     <option key={res} value={res}>
                        {Config.Material[res].name()}
                     </option>
                  ))}
            </select>
            <input
               style={{ width: INPUT_WIDTH }}
               className="text-right"
               type="text"
               value={trade.buyAmount}
               onChange={(e) => setTrade({ ...trade, buyAmount: safeParseInt(e.target.value) })}
            />
         </div>
         <div className="row text-desc text-small mt5">
            <div>
               <FormatNumber value={buyAmountRange.min} /> ~ <FormatNumber value={buyAmountRange.max} />
            </div>
            <div className="f1" />
            {[-percentage, -percentage / 2, 0, percentage / 2, percentage].map((pct) => {
               return (
                  <div
                     key={pct}
                     className="text-link text-strong ml10"
                     onClick={() =>
                        setTrade({
                           ...trade,
                           buyAmount: clamp(
                              Math.round(buyAmountRange.amount * (1 + pct)),
                              buyAmountRange.min,
                              buyAmountRange.max,
                           ),
                        })
                     }
                  >
                     {formatPercent(pct)}
                  </div>
               );
            })}
         </div>
         <div className="sep10" />
         <div className="inset-shallow row" style={{ padding: "2px 8px" }}>
            <div className="f1">{t(L.KeepTheWindowOpenAfterPlacingTrade)}</div>
            <div
               className="pointer"
               onClick={() => {
                  playClick();
                  options.keepNewTradeWindowOpen = !options.keepNewTradeWindowOpen;
                  notifyGameOptionsUpdate(options);
               }}
            >
               {options.keepNewTradeWindowOpen ? (
                  <div className="m-icon text-green">toggle_on</div>
               ) : (
                  <div className="m-icon text-grey">toggle_off</div>
               )}
            </div>
         </div>
         <div className="sep10" />
         <div className="row">
            <button
               className="row f1 jcc"
               onClick={() => {
                  onCancel();
               }}
            >
               {t(L.PlayerTradeAddTradeCancel)}
            </button>
            <button
               className="row f1 jcc"
               disabled={!isTradeValid(trade) || !enabled}
               onClick={async () => {
                  if (
                     !isTradeValid(trade) ||
                     !enabled ||
                     (availableResources[trade.sellResource] ?? 0) < trade.sellAmount
                  ) {
                     playError();
                     showToast(t(L.OperationNotAllowedError));
                     return;
                  }
                  // Note: we deduct the resources first otherwise resource can go negative if a player
                  // clicks really fast. If the trade fails, we refund the player
                  const transaction = deductResourceFrom(
                     trade.sellResource,
                     trade.sellAmount,
                     Array.from(Tick.current.playerTradeBuildings.keys()),
                     gameState,
                  );
                  try {
                     // The deduction might not be 100% successful, we need to correct the actual amount
                     // based on the result!
                     const percentage = transaction.amount / trade.sellAmount;
                     trade.sellAmount *= percentage;
                     trade.buyAmount *= percentage;
                     await client.addTrade(trade);
                     const token = uuid4();
                     await client.updateGameId(token);
                     getGameState().id = token;
                     playKaching();
                     showToast(t(L.PlayerTradeAddSuccess));
                     if (!options.keepNewTradeWindowOpen) {
                        hideModal();
                     }
                  } catch (error) {
                     transaction.rollback();
                     playError();
                     showToast(String(error));
                  }
               }}
            >
               <div className="m-icon small">shopping_cart</div>
               <div className="text-strong">{t(L.PlayerTradePlaceTrade)}</div>
            </button>
         </div>
      </>
   );
}

export function AddTradeButtonComponent({ onClick }: { onClick: () => void }): React.ReactNode {
   const user = useUser();
   const trades = useTrades();
   const enabled =
      !isNullOrUndefined(user) &&
      trades.filter((t) => t.fromId === user.userId).length < getMaxActiveTrades(user);
   let disabledReason: string | null = null;
   if (DISABLE_PLAYER_TRADES) {
      disabledReason = t(L.PlayerTradeDisabledBeta);
   } else if (!enabled) {
      disabledReason = t(L.PlayerTradeMaxTradeExceeded);
   }
   return (
      <button
         className="row f1 jcc"
         onClick={() => {
            if (disabledReason) {
               playError();
            } else {
               onClick();
            }
         }}
         disabled={!!disabledReason}
      >
         <div className="m-icon small">add_circle</div>
         <Tippy content={disabledReason} disabled={!disabledReason}>
            <div className="f1">{t(L.PlayerTradeNewTrade)}</div>
         </Tippy>
      </button>
   );
}
