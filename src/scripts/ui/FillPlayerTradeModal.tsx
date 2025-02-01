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
import { client, usePlayerMap, useTrades } from "../rpc/RPCClient";
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

   const calculateMaxFill = () => {
      const result = new Map<Tile, number>();
      let amountLeft = trade.buyAmount;
      for (const xy of allTradeBuildings.keys()) {
         const amount = getMaxFill(xy);
         if (amount <= 0) {
            // Do nothing
         } else if (amountLeft > amount) {
            result.set(xy, amount);
            amountLeft -= amount;
         } else {
            result.set(xy, amountLeft);
            amountLeft = 0;
            break;
         }
      }
      return result;
   };

   const doFill = async (fills: Map<Tile, number>) => {
      if (!fillsAreValid(fills) || !hasValidPath()) {
         showToast(t(L.OperationNotAllowedError));
         playError();
         return;
      }
      let total = 0;
      let success = 0;
      let fillAmount = 0;
      let receivedAmount = 0;
      const errors: string[] = [];
      for (const [tile, amount] of fills) {
         if (amount <= 0) continue;
         // We reserve the amount first, otherwise resource might go negative if a player
         // clicks really fast
         ++total;
         const r = deductResourceFrom(trade.buyResource, amount, [tile], gs);
         try {
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
               safeAdd(allTradeBuildings.get(tile)!.resources, res, amount);
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
         errors.unshift(
            t(L.PlayerTradeFillSuccessV2, {
               success,
               total,
               fillAmount: formatNumber(fillAmount),
               fillResource: Config.Resource[trade.buyResource].name(),
               receivedAmount: formatNumber(receivedAmount),
               receivedResource: Config.Resource[trade.sellResource].name(),
            }),
         );
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
            (availableStorage * trade.buyAmount) / (trade.sellAmount - trade.buyAmount),
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
                                             old.set(xy, getMaxFill(xy));
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
                     const fills = calculateMaxFill();
                     if (fills.size > 0) {
                        doFill(fills);
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
               <button className="text-strong" disabled={!fillsAreValid(fills)} onClick={() => doFill(fills)}>
                  {t(L.PlayerTradeFillTradeButton)}
               </button>
            </div>
         </div>
      </div>
   );
}
