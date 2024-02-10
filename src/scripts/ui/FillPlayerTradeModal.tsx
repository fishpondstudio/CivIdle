import classNames from "classnames";
import { useEffect, useState } from "react";
import { getStorageFor } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { Tick } from "../../../shared/logic/TickLogic";
import type { IClientTrade } from "../../../shared/utilities/Database";
import {
   clamp,
   formatPercent,
   mFirstKeyOf,
   pointToXy,
   safeAdd,
   xyToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { client, usePlayerMap } from "../rpc/RPCClient";
import { findPath, findUserOnMap, getMyMapXy } from "../scenes/PathFinder";
import { jsxMMapOf } from "../utilities/Helper";
import { playError, playKaching } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { WarningComponent } from "./WarningComponent";

export function FillPlayerTradeModal({ trade, xy }: { trade: IClientTrade; xy?: Tile }): React.ReactNode {
   const [tiles, setTiles] = useState<string[]>([]);
   const map = usePlayerMap();
   const myXy = getMyMapXy();
   if (!myXy) {
      hideModal();
      playError();
      showToast(t(L.PlayerTradeClaimTileFirstWarning));
   }
   useEffect(() => {
      const targetXy = findUserOnMap(trade.fromId);
      if (!myXy || !targetXy) {
         return;
      }
      const path = findPath(xyToPoint(myXy), xyToPoint(targetXy));
      setTiles(path.map((x) => pointToXy(x)));
   }, [trade.fromId, myXy]);
   const totalTariff = tiles.reduce((prev, xy, i) => {
      const tile = map[xy];
      if (!tile || i === 0 || i === tiles.length - 1) {
         return prev;
      }
      return prev + tile.tariffRate;
   }, 0);

   const gs = useGameState();
   const allTradeBuildings = Tick.current.playerTradeBuildings;
   const [delivery, setDelivery] = useState<Tile>(xy ? xy : mFirstKeyOf(allTradeBuildings)!);
   const maxAmount = allTradeBuildings.get(delivery)?.resources[trade.buyResource] ?? 0;
   const [fillAmount, setFillAmount] = useState(Math.min(maxAmount, trade.buyAmount));
   const percentage = fillAmount / trade.buyAmount;
   const isPercentageValid = percentage > 0 && percentage <= 1;
   const storageRequired = clamp(
      (trade.sellAmount * (1 - totalTariff) - trade.buyAmount) * percentage,
      0,
      Infinity,
   );
   const s = getStorageFor(delivery, gs);
   const hasEnoughStorage = s.total - s.used >= storageRequired;
   const hasEnoughResource = trade.buyAmount * percentage <= maxAmount;
   const hasValidPath = tiles.length > 0;

   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerTradeFillTradeTitle)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            {!hasValidPath ? (
               <>
                  <WarningComponent icon="warning">
                     {t(L.PlayerTradeNoValidRoute, { name: trade.from })}
                  </WarningComponent>
                  <div className="sep10"></div>
               </>
            ) : null}
            <div className="table-view">
               <table>
                  <tbody>
                     <tr>
                        <th></th>
                        <th className="text-right">{Config.Resource[trade.buyResource].name()}</th>
                        <th className="text-right">{t(L.StorageLeft)}</th>
                     </tr>
                     {jsxMMapOf(allTradeBuildings, (xy, building) => {
                        const storage = getStorageFor(xy, gs);
                        const uniqueId = `tile_${xy}`;
                        return (
                           <tr key={xy}>
                              <td>
                                 <input
                                    type="radio"
                                    id={uniqueId}
                                    checked={delivery === xy}
                                    onChange={() => setDelivery(xy)}
                                 />
                                 <label htmlFor={uniqueId}>
                                    {Config.Building[building.type].name()} (
                                    {t(L.LevelX, { level: building.level })})
                                 </label>
                              </td>
                              <td className="text-right">
                                 <FormatNumber
                                    value={allTradeBuildings.get(xy)?.resources[trade.buyResource] ?? 0}
                                 />
                              </td>
                              <td className="text-right">
                                 <FormatNumber value={storage.total - storage.used} />
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
            <div className="sep15"></div>
            <div className="row">
               <div className="mr20">{t(L.PlayerTradeFillAmount)}</div>
               <input
                  type="text"
                  className="f1 text-right"
                  value={fillAmount}
                  onChange={(e) => {
                     const parsed = parseInt(e.target.value, 10);
                     if (Number.isFinite(parsed)) {
                        setFillAmount(clamp(parsed, 0, Math.min(maxAmount, trade.buyAmount)));
                     } else {
                        setFillAmount(0);
                     }
                  }}
               />
            </div>
            <div className="sep5" />
            <div
               className="text-right text-small text-link"
               onClick={() => {
                  setFillAmount(Math.min(trade.buyAmount, maxAmount));
               }}
            >
               {t(L.PlayerTradeFillAmountMax)}
            </div>
            <div className="sep10" />
            <ul className="tree-view">
               <li className={classNames({ row: true, "text-strong text-red": !hasEnoughResource })}>
                  <div className="f1">
                     {t(L.PlayerTradeYouPay, {
                        res: Config.Resource[trade.buyResource].name(),
                     })}
                  </div>
                  <div>
                     <FormatNumber value={trade.buyAmount * percentage} />
                  </div>
               </li>
               <li className="row">
                  <div className="f1">
                     {t(L.PlayerTradeYouGetGross, {
                        res: Config.Resource[trade.sellResource].name(),
                     })}
                  </div>
                  <div>
                     <FormatNumber value={trade.sellAmount * percentage} />
                  </div>
               </li>
               <li>
                  <details>
                     <summary className="row">
                        <div className="f1">{t(L.PlayerMapTariff)}</div>
                        <div>{formatPercent(totalTariff)}</div>
                     </summary>
                     <ul>
                        {tiles.map((xy, i) => {
                           const tile = map[xy];
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
               <li className={classNames({ row: true, "text-strong text-red": !hasEnoughStorage })}>
                  <div className="f1">{t(L.PlayerTradeStorageRequired)}</div>
                  <div>
                     <FormatNumber value={storageRequired} />
                  </div>
               </li>
               <li className="row">
                  <div className="f1">
                     {t(L.PlayerTradeYouGetNet, {
                        res: Config.Resource[trade.sellResource].name(),
                     })}
                  </div>
                  <div className="text-strong">
                     <FormatNumber value={(1 - totalTariff) * (trade.sellAmount * percentage)} />
                  </div>
               </li>
            </ul>
            <div className="sep15"></div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
               <button
                  className="text-strong"
                  disabled={!hasEnoughResource || !hasEnoughStorage || !hasValidPath || !isPercentageValid}
                  onClick={async () => {
                     if (!hasEnoughResource || !hasEnoughStorage || !hasValidPath || !isPercentageValid) {
                        playError();
                        return;
                     }
                     try {
                        await client.fillTrade({
                           id: trade.id,
                           percent: percentage,
                           path: tiles,
                        });
                        safeAdd(
                           allTradeBuildings.get(delivery)!.resources,
                           trade.buyResource,
                           -trade.buyAmount * percentage,
                        );
                        safeAdd(
                           allTradeBuildings.get(delivery)!.resources,
                           trade.sellResource,
                           trade.sellAmount * percentage,
                        );
                        showToast(t(L.PlayerTradeFillSuccess));
                        playKaching();
                        hideModal();
                     } catch (error) {
                        playError();
                        showToast(String(error));
                     }
                  }}
               >
                  {t(L.PlayerTradeFillTradeButton)}
               </button>
               <div style={{ width: "6px" }}></div>
               <button onClick={hideModal}>{t(L.ChangePlayerHandleCancel)}</button>
            </div>
         </div>
      </div>
   );
}
