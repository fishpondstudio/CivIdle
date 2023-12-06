import classNames from "classnames";
import { useEffect, useState } from "react";
import { useGameState } from "../Global";
import { getStorageFor } from "../logic/BuildingLogic";
import { IClientTrade } from "../logic/PlayerTradeLogic";
import { Tick } from "../logic/TickLogic";
import { client, usePlayerMap } from "../rpc/RPCClient";
import { findPath, findUserOnMap, getMyMapXy } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import {
   clamp,
   firstKeyOf,
   formatPercent,
   jsxMapOf,
   pointToXy,
   safeAdd,
   safeParseInt,
   xyToPoint,
} from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { Singleton } from "../utilities/Singleton";
import { playError } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { WarningComponent } from "./WarningComponent";

export function FillPlayerTradeModal({ trade, xy }: { trade: IClientTrade; xy?: string }) {
   const [percent, setPercent] = useState(100);
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
      Singleton().sceneManager.getCurrent(PlayerMapScene)?.drawPath(path);
      return () => {
         Singleton().sceneManager.getCurrent(PlayerMapScene)?.clearPath();
      };
   }, []);
   const totalTariff = tiles.reduce((prev, xy, i) => {
      const tile = map[xy];
      if (!tile || i == 0 || i == tiles.length - 1) {
         return prev;
      }
      return prev + tile.tariffRate;
   }, 0);

   const gs = useGameState();
   const allTradeBuildings = Tick.current.playerTradeBuildings;
   const [delivery, setDelivery] = useState<string>(xy ? xy : firstKeyOf(allTradeBuildings)!);
   const maxAmount = allTradeBuildings[delivery].resources[trade.buyResource] ?? 0;
   const storageRequired = clamp(
      ((trade.sellAmount * (1 - totalTariff) - trade.buyAmount) * percent) / 100,
      0,
      Infinity,
   );
   const s = getStorageFor(delivery, gs);
   const hasEnoughStorage = s.total - s.used >= storageRequired;
   const hasEnoughResource = (trade.buyAmount * percent) / 100 <= maxAmount;
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
                        <th className="text-right">
                           {Tick.current.resources[trade.buyResource].name()}
                        </th>
                        <th className="text-right">{t(L.StorageLeft)}</th>
                     </tr>
                     {jsxMapOf(allTradeBuildings, (xy, building) => {
                        const storage = getStorageFor(xy, gs);
                        const uniqueId = "tile_" + xy;
                        return (
                           <tr key={xy}>
                              <td>
                                 <input
                                    type="radio"
                                    id={uniqueId}
                                    checked={delivery == xy}
                                    onChange={() => setDelivery(xy)}
                                 />
                                 <label htmlFor={uniqueId}>
                                    {Tick.current.buildings[building.type].name()} (
                                    {t(L.LevelX, { level: building.level })})
                                 </label>
                              </td>
                              <td className="text-right">
                                 <FormatNumber
                                    value={allTradeBuildings[xy].resources[trade.buyResource] ?? 0}
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
               <div className="f1">{t(L.PlayerTradeFillPercentage)}</div>
               <div>{percent}%</div>
            </div>
            <input
               type="range"
               min={1}
               max={100}
               step="1"
               value={percent}
               onChange={(e) => {
                  setPercent(safeParseInt(e.target.value));
               }}
            />
            <div className="sep20"></div>
            <ul className="tree-view">
               <li
                  className={classNames({ row: true, "text-strong text-red": !hasEnoughResource })}
               >
                  <div className="f1">
                     {t(L.PlayerTradeYouPay, {
                        res: Tick.current.resources[trade.buyResource].name(),
                     })}
                  </div>
                  <div>
                     <FormatNumber value={(trade.buyAmount * percent) / 100} />
                  </div>
               </li>
               <li className="row">
                  <div className="f1">
                     {t(L.PlayerTradeYouGetGross, {
                        res: Tick.current.resources[trade.sellResource].name(),
                     })}
                  </div>
                  <div>
                     <FormatNumber value={(trade.sellAmount * percent) / 100} />
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
                           if (!tile || i == 0 || i == tiles.length - 1) {
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
                        res: Tick.current.resources[trade.sellResource].name(),
                     })}
                  </div>
                  <div className="text-strong">
                     <FormatNumber
                        value={((1 - totalTariff) * (trade.sellAmount * percent)) / 100}
                     />
                  </div>
               </li>
            </ul>
            <div className="sep15"></div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
               <button
                  disabled={!hasEnoughResource || !hasEnoughStorage || !hasValidPath}
                  onClick={async () => {
                     if (!hasEnoughResource || !hasEnoughStorage || !hasValidPath) {
                        playError();
                     }
                     try {
                        await client.fillTrade({
                           id: trade.id,
                           percent: percent / 100,
                           path: tiles,
                        });
                        safeAdd(
                           allTradeBuildings[delivery].resources,
                           trade.buyResource,
                           (-trade.buyAmount * percent) / 100,
                        );
                        safeAdd(
                           allTradeBuildings[delivery].resources,
                           trade.sellResource,
                           (trade.sellAmount * percent) / 100,
                        );
                        hideModal();
                     } catch (error) {
                        showToast(String(error));
                     }
                  }}
               >
                  {t(L.PlayerTradeFillTradeButton)}
               </button>
               <div style={{ width: "10px" }}></div>
               <button onClick={hideModal}>{t(L.ChangePlayerHandleCancel)}</button>
            </div>
         </div>
      </div>
   );
}
