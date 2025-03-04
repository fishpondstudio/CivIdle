import classNames from "classnames";
import { useEffect, useState } from "react";
import { getStorageFor, hasEnoughResource, hasEnoughStorage } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getSeaTileCost, getTotalSeaTileCost } from "../../../shared/logic/PlayerTradeLogic";
import { deductResourceFrom } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import {
   clamp,
   forEach,
   formatNumber,
   formatPercent,
   pointToXy,
   safeAdd,
   safeParseFloat,
   xyToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { client, usePlayerMap, useTrades, addSystemMessage } from "../rpc/RPCClient";
import { findPath, findUserOnMap, getMyMapXy } from "../scenes/PathFinder";
import { playError, playKaching } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { WarningComponent } from "./WarningComponent";

export function FillPlayerTradeModal({ tradeId, xy }: { tradeId: string; xy?: Tile }): React.ReactNode {
   const [tiles, setTiles] = useState<string[]>([]);
   const map = usePlayerMap();
   const gs = useGameState();
   const trades = useTrades();
   const trade = trades.find((t) => t.id === tradeId);
   const myXy = getMyMapXy();
   const allTradeBuildings = Tick.current.playerTradeBuildings;
   const [fills, setFills] = useState(new Map<Tile, number>());

   const DEFAULT_HINTS = "greedy";

   // added, to keep buildings in the order of best-ish subtrade candidates
   // filled later a few lines below "Array.from(allTradeBuildings.entries())"
   var allTradeBuildingsSorted = new Map();

   useEffect(() => {
      if (!trade) {
         return;
      }
      const targetXy = findUserOnMap(trade.fromId);
      if (!myXy || !targetXy) {
         return;
      }
      const path = findPath(xyToPoint(myXy), xyToPoint(targetXy));
      setTiles(path.map((x) => pointToXy(x)));
   }, [trade, myXy]);

   const seaTileCost = getTotalSeaTileCost(tiles, getSeaTileCost(gs));

   const totalTariff =
      seaTileCost +
      tiles.reduce((prev, xy, i) => {
         const tile = map.get(xy);
         if (!tile || i === 0 || i === tiles.length - 1) {
            return prev;
         }
         return prev + tile.tariffRate;
      }, 0);

   if (!trade) {
      hideModal();
      playError();
      return null;
   }
   if (!myXy) {
      hideModal();
      playError();
      showToast(t(L.PlayerTradeClaimTileFirstWarning));
      return null;
   }

   const hasValidPath = () => tiles.length > 0;

   const fillsHaveEnoughResource = (fills: Map<Tile, number>) => {
      for (const [tile, amount] of fills) {
         if (!hasEnoughResource(tile, trade.buyResource, amount, gs)) {
            return false;
         }
      }
      return true;
   };

   // major changes 2025-02-xx
   // param "hint" can be "greedy" or "fast" to tweak some limits
   // param "maxError" reserved for future use, to set tolerance for fluctuating, erronous or invalid values
   const calculateMaxFill = (hints = "auto", maxError = 0.03) => {
      const result = new Map<Tile, number>();

      // enable some tweaks only in large trades
      const isLargeTrade = trade.buyAmount >= 10000000; // 10 million

      // does it really help?
      // no, no longer needed with later tweaks as of 2025-02-xx
      // if(isLargeTrade) {
      //   amountLeft = amountLeft * 0.90;
      // }

      // of the goods we're sending to them. first is alias, second is calculated later
      const totalAmountTheyWant = trade.buyAmount;
      let totalAmountWeHave = 0;

      let amountLeftToSend = totalAmountTheyWant;

      // manual index for loop, note it's 1-based
      var currentSubtradeIndex = 0;

      // don't ignore subtrades below that number
      // mostly for the benefit of players with heavily clogged up storage
      var minSubtrades = 10;

      // max number of subtrades allowed. 200 seems reasonable as of b569/England
      var maxSubtrades = 200;

      if (typeof hints === "string" && hints.includes("greedy")) {
         // greedy is default now, so no changes here
      }

      if (typeof hints === "string" && hints.includes("fast")) {
         // note since subtrades are sorted 20 is usually enough to fill majority of the trade
         maxSubtrades = 20;
      }

      // pre-calc loop
      for (const xy of allTradeBuildingsSorted.keys()) {
         // at this moment, in trade buildings
         totalAmountWeHave += getMaxFill(xy);
      }

      // addSystemMessage(`totalAmountWeHave=${formatNumber(totalAmountWeHave)} / `+
      //   `totalAmountTheyWant=${formatNumber(totalAmountTheyWant)}`);

      // main loop
      for (const xy of allTradeBuildingsSorted.keys()) {
         // hard limit, ignore further possible subtrades
         if (currentSubtradeIndex >= maxSubtrades) {
            break;
         }

         currentSubtradeIndex++; // 1-based

         // IMPORTANT
         // do only partial fills
         // does not affect the total amount as long as there is some free space
         // TODO: allow tweaking with errMargin, maybe like getMaxFill(xy) * (1 - errMargin)
         // would require more testing. 0.90 seems good
         let subtradeAmount = getMaxFill(xy) * 0.9;

         // we want to ignore trades that are zero or close to zero,
         // as they introduce needless delays in client and load on server
         var isSubtradeTooSmall = subtradeAmount < totalAmountWeHave / 1000;

         // addSystemMessage(`cS=${currentSubtrade} / maxS=${maxSubtrades}, `+
         //   `pA=${formatNumber(partialAmount)} / aL=${formatNumber(amountLeft)} / `+
         //   ` tAWH=${formatNumber(totalAmountWeHave)} / tATW=${formatNumber(totalAmountTheyWant)}, `+
         // `subtradeTooSmall=${subtradeTooSmall}`);

         // use 2nd subtrade to expose mod's version
         // this 'wastes' a single subtrade but is the easiest way to
         // advertise which version is used with no additions elsewhere
         // not needed in production version
         // if (currentSubtrade == 2) {
         //    if (partialAmount > MODDEDCLIENT_VER) {
         //       partialAmount = MODDEDCLIENT_VER;
         //    }
         // }

         // tweaks that should run only between minSubtrades to maxSubtrades
         if (currentSubtradeIndex > minSubtrades) {
            if (isSubtradeTooSmall) {
               // ignore - prevent from sending to the server - tiny subtrades,
               // greatly reduces waste both on client and server
               // during testing often 50-80% of subtrades were these near-zero ones
               continue;
            }
         }

         if (subtradeAmount <= 0) {
            // redundant now? leave it for now
            // will work with first minSubtrades too if they're zero or negative but not if they're tiny
            // do nothing
         } else if (amountLeftToSend > subtradeAmount) {
            result.set(xy, subtradeAmount);
            amountLeftToSend -= subtradeAmount;
         } else {
            result.set(xy, amountLeftToSend);
            amountLeftToSend = 0;
            break;
         }
      }
      return result;
   };

   // major changes 2025-02-xx
   // param "hint" can be "greedy" or "fast" to tweak some limits
   // param "maxError" reserved for future use, to set tolerance for fluctuating, erronous or invalid values
   const doFill = async (fills: Map<Tile, number>, hints = "auto", maxError = 0.03) => {
      // split error checking so it's easier to debug
      if (!hasValidPath()) {
         addSystemMessage("hasValidPath=false");
         showToast(t(L.OperationNotAllowedError));
         playError();
         return;
      }
      if (!fillsHaveEnoughResource(fills)) {
         addSystemMessage("fillsHaveEnoughResource=false");
         showToast(t(L.OperationNotAllowedError));
         playError();
         return;
      }
      if (!fillsHaveEnoughStorage(fills)) {
         addSystemMessage("fillsHaveEnoughStorage=false");
         showToast(t(L.OperationNotAllowedError));
         playError();
         return;
      }

      let totalFillAmount = getTotalFillAmount(fills);
      if (!(totalFillAmount > 0)) {
         // happens rarely, but usually no less than once / 15 minutes during aggressive trading
         let str1 = `totalFillAmount=${totalFillAmount} is negative. This shouldn't happen. Trying to proceed anyway.`;
         addSystemMessage(str1);

         // this is partially recoverable, we do not want to fail here
         //return;
      }

      if (!(totalFillAmount <= trade.buyAmount)) {
         // needs more testing
         let str1 = `totalFillAmount=${totalFillAmount} is greater than trade.buyAmount=${trade.buyAmount}. This shouldn't happen. Trying to proceed anyway.`;
         addSystemMessage(str1);

         // // seems partially recoverable. needs more testing.
         //ct(h(d.OperationNotAllowedError)), ze();
         //return;
      }

      // todo: localize?
      showToast("Filling trades, please wait 5-20 sec...");

      let total = 0;
      let success = 0;
      let fillAmount = 0;
      let receivedAmount = 0;

      const errors: string[] = [];

      const subtradeQueue: Array<{ amount: number; rollback: () => void; tile: Tile }> = [];

      // 1st loop, queue subtrades
      for (const [tile, amount] of fills) {
         if (amount <= 0) continue;
         // We reserve the amount first, otherwise resource might go negative if a player
         // clicks really fast

         // shouldn't this be in the 2nd loop?
         //++total;

         const r = deductResourceFrom(trade.buyResource, amount, [tile], gs);
         subtradeQueue.push({ amount: r.amount, rollback: r.rollback, tile });
      }

      // 2nd loop, process queued subtrades
      for (const r of subtradeQueue) {
         try {
            total++;

            // todo: localize
            let tradeStr = `${total} / ${fills.size}`;
            let resourceStr = `${formatNumber(fillAmount)} ${trade.buyResource}`;
            let str1 = `Filling trades ${tradeStr}, sending: ${resourceStr}...`;
            showToast(str1);

            const result = await client.fillTrade({
               id: trade.id,
               amount: r.amount,
               path: tiles,
               seaTileCost: getSeaTileCost(gs),
            });
            forEach(result, (res, amount) => {
               if (amount > 0) {
                  receivedAmount += amount;
               }
               if (amount < 0) {
                  fillAmount += Math.abs(amount);
               }
               safeAdd(allTradeBuildings.get(r.tile)!.resources, res, amount);
            });
            ++success;
         } catch (error) {
            errors.push(String(error));
         } finally {
            // If the trade fails, we should refund the resource. If the trade success, the result
            // from the server contains the correct amount to deduct, we *also* refund the resource
            r.rollback();
         }
      }
      if (success > 0) {
         playKaching();

         let str1 = t(L.PlayerTradeFillSuccessV2, {
            success,
            total,
            fillAmount: formatNumber(fillAmount),
            fillResource: Config.Resource[trade.buyResource].name(),
            receivedAmount: formatNumber(receivedAmount),
            receivedResource: Config.Resource[trade.sellResource].name(),
         });
         errors.unshift(str1);

         // todo: do we want it?
         // some testers liked having it in chat window, some didn't
         // addSystemMessage(str1);

         const eic = Tick.current.specialBuildings.get("EastIndiaCompany");
         if (eic) {
            safeAdd(
               eic.building.resources,
               "TradeValue",
               fillAmount * (Config.ResourcePrice[trade.buyResource] ?? 0),
            );
         }
         showToast(errors.join("<br />"));
         hideModal();
      } else {
         playError();
         showToast(errors.join("<br />"));
      }
   };

   const getStorageRequired = (amount: number) => {
      return clamp((trade.sellAmount * amount) / trade.buyAmount - amount, 0, Number.POSITIVE_INFINITY);
   };

   const fillsHaveEnoughStorage = (fills: Map<Tile, number>) => {
      if (!requireExtraStorage()) {
         return true;
      }
      for (const [tile, amount] of fills) {
         const storageRequired = getStorageRequired(amount);
         if (!hasEnoughStorage(tile, storageRequired, gs)) {
            return false;
         }
      }
      return true;
   };

   const getTotalFillAmount = (fills: Map<Tile, number>) => {
      let total = 0;
      for (const [tile, amount] of fills) {
         total += amount;
      }
      return total;
   };

   const getTotalStorageRequired = (fills: Map<Tile, number>) => {
      let total = 0;
      for (const [tile, amount] of fills) {
         total += getStorageRequired(amount);
      }
      return total;
   };

   const requireExtraStorage = () => {
      return trade.sellAmount > trade.buyAmount;
   };

   const getMaxFill = (tile: Tile) => {
      let amount = trade.buyAmount;
      amount = clamp(amount, 0, gs.tiles.get(tile)?.building?.resources[trade.buyResource] ?? 0);
      if (trade.sellAmount > trade.buyAmount) {
         const storage = getStorageFor(tile, gs);
         const availableStorage = clamp(storage.total - storage.used, 0, Number.POSITIVE_INFINITY);
         amount = clamp(
            amount,
            0,
            Math.floor((availableStorage * trade.buyAmount) / (trade.sellAmount - trade.buyAmount)),
         );
      }
      return amount;
   };

   const fillsAreValid = (fills: Map<Tile, number>) => {
      const fillAmount = getTotalFillAmount(fills);
      return (
         fillsHaveEnoughResource(fills) &&
         fillsHaveEnoughStorage(fills) &&
         fillAmount > 0 &&
         fillAmount <= trade.buyAmount
      );
   };

   const isFillValid = (tile: Tile, amount: number) => {
      return (
         hasEnoughResource(tile, trade.buyResource, amount, gs) &&
         (!requireExtraStorage() || hasEnoughStorage(tile, getStorageRequired(amount), gs))
      );
   };

   return (
      <div className="window" style={{ width: 550 }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerTradeFillTradeTitle)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            {!hasValidPath() ? (
               <>
                  <WarningComponent icon="warning">
                     {t(L.PlayerTradeNoValidRoute, { name: trade.from })}
                  </WarningComponent>
                  <div className="sep10"></div>
               </>
            ) : null}
            <div className="table-view sticky-header" style={{ overflowY: "auto", maxHeight: "40vh" }}>
               <table>
                  <tbody>
                     <tr>
                        <th></th>
                        <th className="text-right">{Config.Resource[trade.buyResource].name()}</th>
                        <th className="text-right">{t(L.Storage)}</th>
                        <th className="text-right">{t(L.PlayerTradeFillAmount)}</th>
                        <th></th>
                     </tr>
                     {Array.from(allTradeBuildings.entries())
                        .sort(
                           ([, a], [, b]) =>
                              (b.resources[trade.buyResource] ?? 0) - (a.resources[trade.buyResource] ?? 0),
                        )
                        .map(([xy, building]) => {
                           // save the order for later use in other places
                           allTradeBuildingsSorted.set(xy, building);

                           const storage = getStorageFor(xy, gs);
                           return (
                              <tr key={xy}>
                                 <td>
                                    <div>{Config.Building[building.type].name()}</div>
                                    <div className="text-desc text-small">
                                       {t(L.LevelX, { level: building.level })}
                                    </div>
                                 </td>
                                 <td className="text-right">
                                    <FormatNumber value={building.resources[trade.buyResource] ?? 0} />
                                    <div
                                       className="text-right text-small text-link"
                                       onClick={() => {
                                          setFills((old) => {
                                             old.set(xy, getMaxFill(xy, DEFAULT_HINTS));
                                             return new Map(fills);
                                          });
                                       }}
                                    >
                                       {t(L.PlayerTradeFillAmountMaxV2)}
                                    </div>
                                 </td>
                                 <td className="text-right">
                                    <FormatNumber value={storage.total - storage.used} />
                                    <div className="text-right text-desc text-small">
                                       {formatPercent(1 - storage.used / storage.total)}
                                    </div>
                                 </td>
                                 <td style={{ width: 0 }}>
                                    <input
                                       type="text"
                                       className="text-right"
                                       value={fills.get(xy) ?? 0}
                                       onChange={(e) => {
                                          setFills((old) => {
                                             old.set(xy, safeParseFloat(e.target.value, 0));
                                             return new Map(old);
                                          });
                                       }}
                                       style={{ width: 150 }}
                                    />
                                 </td>
                                 <td style={{ width: 0 }}>
                                    {isFillValid(xy, fills.get(xy) ?? 0) ? (
                                       <div className="m-icon small text-green">check_circle</div>
                                    ) : (
                                       <div className="m-icon small text-red">cancel</div>
                                    )}
                                 </td>
                              </tr>
                           );
                        })}
                  </tbody>
               </table>
            </div>
            <div className="row mb5 mt5 text-small">
               <div className="f1" />
               <div
                  className="text-strong text-link mr20"
                  onClick={() => {
                     setFills(() => new Map());
                  }}
               >
                  {t(L.PlayerTradeClearAll)}
               </div>
               <div className="text-strong text-link" onClick={() => setFills(calculateMaxFill)}>
                  {t(L.PlayerTradeMaxAll)}
               </div>
            </div>
            <ul className="tree-view" style={{ overflowY: "auto", maxHeight: "20vh" }}>
               <li>
                  <details>
                     <summary
                        className={classNames({
                           row: true,
                           "text-strong text-red": !fillsHaveEnoughResource(fills),
                        })}
                     >
                        <div className="f1">
                           {t(L.PlayerTradeYouPay, {
                              res: Config.Resource[trade.buyResource].name(),
                           })}
                        </div>
                        <div>
                           <FormatNumber value={getTotalFillAmount(fills)} />
                        </div>
                     </summary>
                     <ul>
                        <li
                           className={classNames({
                              "text-small row": true,
                              "text-strong text-red": getTotalFillAmount(fills) > trade.buyAmount,
                           })}
                        >
                           <div className="f1">{t(L.PlayerTradeFillPercentage)}</div>
                           <div>{formatPercent(getTotalFillAmount(fills) / trade.buyAmount)}</div>
                        </li>
                     </ul>
                  </details>
               </li>
               <li>
                  <details>
                     <summary className="row">
                        <div className="f1">{t(L.PlayerMapTariff)}</div>
                        <div>{formatPercent(totalTariff)}</div>
                     </summary>
                     <ul className="text-small">
                        {seaTileCost > 0 ? (
                           <li className="row">
                              <div className="f1">{t(L.SeaTradeCost)}</div>
                              <div>{formatPercent(seaTileCost)}</div>
                           </li>
                        ) : null}
                        {tiles.map((xy, i) => {
                           const tile = map.get(xy);
                           if (!tile || i === 0 || i === tiles.length - 1) {
                              return null;
                           }
                           return (
                              <li key={xy} className="row">
                                 <div className="f1">{tile.handle}</div>
                                 <div>{formatPercent(tile.tariffRate)}</div>
                              </li>
                           );
                        })}
                     </ul>
                  </details>
               </li>
               <li>
                  <details>
                     <summary className="row">
                        <div className="f1">
                           {t(L.PlayerTradeYouGetNet, {
                              res: Config.Resource[trade.sellResource].name(),
                           })}
                        </div>
                        <div className="text-strong">
                           <FormatNumber
                              value={
                                 ((1 - totalTariff) * trade.sellAmount * getTotalFillAmount(fills)) /
                                 trade.buyAmount
                              }
                           />
                        </div>
                     </summary>
                     <ul>
                        <li className="row text-small">
                           <div className="f1">
                              {t(L.PlayerTradeYouGetGross, {
                                 res: Config.Resource[trade.sellResource].name(),
                              })}
                           </div>
                           <div>
                              <FormatNumber
                                 value={(getTotalFillAmount(fills) * trade.sellAmount) / trade.buyAmount}
                              />
                           </div>
                        </li>
                        <li
                           className={classNames({
                              "text-small row": true,
                              "text-strong text-red": !fillsHaveEnoughStorage(fills),
                           })}
                        >
                           <div className="f1">{t(L.PlayerTradeStorageRequired)}</div>
                           <div>
                              <FormatNumber value={getTotalStorageRequired(fills)} />
                           </div>
                        </li>
                     </ul>
                  </details>
               </li>
            </ul>
            <div className="sep15"></div>
            <div className="row">
               <button onClick={hideModal}>{t(L.ChangePlayerHandleCancel)}</button>
               <div className="f1"></div>
               <button
                  onClick={() => {
                     const fills = calculateMaxFill(DEFAULT_HINTS);
                     if (fills.size > 0) {
                        doFill(fills, DEFAULT_HINTS);
                     } else {
                        playError();
                        showToast(t(L.PlayerTradeNoFillBecauseOfResources));
                        hideModal();
                     }
                  }}
               >
                  {t(L.PlayerTradeFillAmountMaxV2)}
               </button>
               <div style={{ width: "6px" }}></div>
               <button
                  className="text-strong"
                  disabled={!fillsAreValid(fills)}
                  onClick={() => doFill(fills, DEFAULT_HINTS)}
               >
                  {t(L.PlayerTradeFillTradeButton)}
               </button>
            </div>
         </div>
      </div>
   );
}
