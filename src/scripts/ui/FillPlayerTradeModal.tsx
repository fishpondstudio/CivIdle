import { useState } from "react";
import { ITrade } from "../../../server/src/Database";
import { Resource } from "../definitions/ResourceDefinitions";
import { Singleton } from "../Global";
import { Tick } from "../logic/TickLogic";
import { findPath, findUserOnMap, getMyMapXy } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { safeParseInt, xyToPoint } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playError } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";

export function FillPlayerTradeModal({ trade }: { trade: ITrade }) {
   const [percent, setPercent] = useState(100);
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
            <div className="row text-desc">
               <div className="f1">In Storage</div>
               <div>10K</div>
            </div>
            <div className="sep10"></div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
               <button
                  disabled={false}
                  onClick={async () => {
                     const myXy = getMyMapXy();
                     const targetXy = findUserOnMap(trade.fromId);
                     if (!myXy || !targetXy) {
                        playError();
                        return;
                     }
                     const path = findPath(xyToPoint(myXy), xyToPoint(targetXy));
                     Singleton().sceneManager.getCurrent(PlayerMapScene)?.drawPath(path);
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
