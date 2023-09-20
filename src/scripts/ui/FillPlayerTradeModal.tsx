import { useEffect, useState } from "react";
import { ITrade } from "../../../server/src/Database";
import { Resource } from "../definitions/ResourceDefinitions";
import { Singleton } from "../Global";
import { Tick } from "../logic/TickLogic";
import { usePlayerMap } from "../rpc/RPCClient";
import { findPath, findUserOnMap, getMyMapXy } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { formatPercent, pointToXy, safeParseInt, xyToPoint } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { hideModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";

export function FillPlayerTradeModal({ trade }: { trade: ITrade }) {
   const [percent, setPercent] = useState(100);
   const [tiles, setTiles] = useState<string[]>([]);
   const map = usePlayerMap();
   useEffect(() => {
      const myXy = getMyMapXy();
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
   const maxAmount = Tick.current.playerTradeBuildings.reduce(
      (accu, curr) => accu + (curr.resources[trade.buyResource as Resource] ?? 0),
      0
   );
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerTradeFillTradeTitle)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
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
            <div className="sep10"></div>
            <div className="row">
               <div className="f1">{Tick.current.resources[trade.buyResource as Resource].name()}</div>
               <div>
                  <FormatNumber value={(trade.buyAmount * percent) / 100} />
               </div>
            </div>
            <div className="row">
               <div className="f1">{t(L.ResourceInStorage)}</div>
               <div>
                  <FormatNumber value={maxAmount} />
               </div>
            </div>
            <div className="sep5"></div>
            <ul className="tree-view">
               {tiles.map((xy, i) => {
                  const tile = map[xy];
                  if (!tile || i == 0 || i == tiles.length - 1) {
                     return null;
                  }
                  return (
                     <li key={xy} className="row">
                        <div className="f1">
                           {t(L.PlayerMapTariff)}: {tile.handle}
                        </div>
                        <div>{formatPercent(tile.tariffRate)}</div>
                     </li>
                  );
               })}
            </ul>

            <div className="sep10"></div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
               <button disabled={(trade.buyAmount * percent) / 100 > maxAmount} onClick={async () => {}}>
                  {t(L.PlayerTradeFillTradeButton)}
               </button>
               <div style={{ width: "10px" }}></div>
               <button onClick={hideModal}>{t(L.ChangePlayerHandleCancel)}</button>
            </div>
         </div>
      </div>
   );
}
