import classNames from "classnames";
import { useEffect, useState } from "react";
import { getStorageFor, hasEnoughResource, hasEnoughStorage } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getSeaTileCost, getTotalSeaTileCost } from "../../../shared/logic/PlayerTradeLogic";
import { deductResourceFrom } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { MAP_MAX_X } from "../../../shared/utilities/Database";
import {
   clamp,
   cls,
   formatNumber,
   formatPercent,
   mathSign,
   pointToXy,
   safeAdd,
   safeParseFloat,
   xyToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { client, getUser, usePlayerMap, useTrades } from "../rpc/RPCClient";
import { findPathAsync, findUserOwnedTile, getOwnedTradeTile } from "../scenes/PathFinder";
import { playError, playKaching } from "../visuals/Sound";
import { showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { WarningComponent } from "./WarningComponent";

export function FillPlayerTradeModal({
   tradeId,
   hideModal,
}: { tradeId: string; hideModal: () => void }): React.ReactNode {
   const [tiles, setTiles] = useState<string[]>([]);
   const [findingPath, setFindingPath] = useState(true);
   const map = usePlayerMap();
   const gs = useGameState();
   const trades = useTrades();
   const trade = trades.find((t) => t.id === tradeId);
   const myXy = getOwnedTradeTile();
   const allTradeBuildings = Tick.current.playerTradeBuildings;
   const [fills, setFills] = useState(new Map<Tile, number>());

   useEffect(() => {
      if (!trade) {
         return;
      }
      const targetXy = findUserOwnedTile(trade.fromId);
      if (!myXy || !targetXy) {
         return;
      }
      const freeTiles = new Set<number>();
      map.forEach((entry, xy) => {
         if (entry.userId === getUser()?.userId || entry.userId === trade.fromId) {
            const point = xyToPoint(xy);
            freeTiles.add(point.y * MAP_MAX_X + point.x);
         }
      });
      setFindingPath(true);
      findPathAsync(xyToPoint(myXy), xyToPoint(targetXy), freeTiles).then((path) => {
         setFindingPath(false);
         setTiles(path.map((x) => pointToXy(x)));
      });
   }, [trade, myXy, map]);

   if (!trade) {
      hideModal();
      playError();
      return null;
   }

   const seaTileCost = getTotalSeaTileCost(tiles, getSeaTileCost(gs));

   const totalTariff =
      seaTileCost +
      tiles.reduce((prev, xy, i) => {
         const tile = map.get(xy);
         if (!tile || i === 0 || i === tiles.length - 1) {
            return prev;
         }
         const user = getUser();
         if (!user || tile.userId === user.userId) {
            return prev;
         }
         if (tile.userId === trade.fromId) {
            return prev;
         }
         return prev + tile.tariffRate;
      }, 0);

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

   const calculateMaxFill = (percentage: number) => {
      const result = new Map<Tile, number>();
      let amountLeft = trade.buyAmount;
      for (const xy of allTradeBuildings.keys()) {
         const amount = getMaxFill(xy) * percentage;
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
      let totalAmount = 0;
      const queue: Array<{ amount: number; rollback: () => void; tile: Tile }> = [];
      for (const [tile, amount] of fills) {
         if (amount <= 0) continue;
         // We reserve the amount first, otherwise resource might go negative if a player
         // clicks really fast
         const r = deductResourceFrom(trade.buyResource, amount, [tile], gs);
         queue.push({ amount: r.amount, rollback: r.rollback, tile });
         totalAmount += r.amount;
      }
      try {
         const result = await client.fillTrade({
            id: trade.id,
            amount: totalAmount,
            path: tiles,
            seaTileCost: getSeaTileCost(gs),
         });
         const receivedAmount = result[trade.sellResource] ?? 0;
         for (const r of queue) {
            const building = allTradeBuildings.get(r.tile);
            if (building) {
               safeAdd(building.resources, trade.sellResource, (receivedAmount * r.amount) / totalAmount);
            }
         }
         const tradeValue = receivedAmount * (Config.ResourcePrice[trade.sellResource] ?? 0);
         gs.tradeValue += tradeValue;
         const eic = Tick.current.specialBuildings.get("EastIndiaCompany");
         if (eic) {
            safeAdd(eic.building.resources, "TradeValue", tradeValue);
         }
         playKaching();
         showToast(
            t(L.PlayerTradeFillSuccessV2, {
               success: queue.length,
               total: queue.length,
               fillAmount: formatNumber(totalAmount),
               fillResource: Config.Resource[trade.buyResource].name(),
               receivedAmount: formatNumber(receivedAmount),
               receivedResource: Config.Resource[trade.sellResource].name(),
            }),
         );
         hideModal();
      } catch (error) {
         for (const r of queue) {
            r.rollback();
         }
         playError();
         showToast(String(error));
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
   const youPay = getTotalFillAmount(fills);
   const youGet = ((1 - totalTariff) * trade.sellAmount * getTotalFillAmount(fills)) / trade.buyAmount;
   const evChange =
      (Config.ResourcePrice[trade.sellResource] ?? 0) * youGet -
      (Config.ResourcePrice[trade.buyResource] ?? 0) * youPay;
   return (
      <div className="window" style={{ width: 600, maxWidth: "75vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerTradeFillTradeTitle)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            {!findingPath && !hasValidPath() ? (
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
               <div className="text-strong text-link" onClick={() => setFills(() => calculateMaxFill(1))}>
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
                           <FormatNumber value={youPay} />
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
                        <div>
                           {findingPath ? (
                              <div className="m-icon small inline spinning">currency_exchange</div>
                           ) : (
                              formatPercent(totalTariff)
                           )}
                        </div>
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
                           const user = getUser();
                           if (
                              !tile ||
                              i === 0 ||
                              i === tiles.length - 1 ||
                              (user && tile.userId === user.userId) ||
                              trade.fromId === tile.userId
                           ) {
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
                           <FormatNumber value={youGet} />
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
               <li className="row">
                  <div className="f1">{t(L.EmpireValueImpactAfterTariff)}</div>
                  <div className={cls("text-strong", evChange >= 0 ? "text-green" : "text-red")}>
                     {mathSign(evChange)}
                     {formatNumber(Math.abs(evChange))}
                  </div>
               </li>
            </ul>
            <div className="sep15"></div>
            <div className="row">
               <button onClick={hideModal}>{t(L.ChangePlayerHandleCancel)}</button>
               <div className="f1"></div>
               <button
                  onClick={() => {
                     const fills = calculateMaxFill(0.5);
                     if (fills.size > 0) {
                        doFill(fills);
                     } else {
                        playError();
                        showToast(t(L.PlayerTradeNoFillBecauseOfResources));
                        hideModal();
                     }
                  }}
               >
                  {t(L.PlayerTradeFill50)}
               </button>
               <button
                  onClick={() => {
                     const fills = calculateMaxFill(0.95);
                     if (fills.size > 0) {
                        doFill(fills);
                     } else {
                        playError();
                        showToast(t(L.PlayerTradeNoFillBecauseOfResources));
                        hideModal();
                     }
                  }}
               >
                  {t(L.PlayerTradeFill95)}
               </button>
               <button
                  onClick={() => {
                     const fills = calculateMaxFill(1);
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
               <button className="text-strong" disabled={!fillsAreValid(fills)} onClick={() => doFill(fills)}>
                  {t(L.PlayerTradeFillTradeButton)}
               </button>
            </div>
         </div>
      </div>
   );
}
