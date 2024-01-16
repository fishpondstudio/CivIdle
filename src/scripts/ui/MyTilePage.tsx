import { useState } from "react";
import { client, usePlayerMap } from "../rpc/RPCClient";
import { formatPercent, safeParseInt } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { showToast } from "./GlobalModal";
import { MenuComponent } from "./MenuComponent";
import { PlayerHandleComponent } from "./PlayerHandleComponent";

export function MyTilePage({ xy }: { xy: string }): React.ReactNode {
   const playerMap = usePlayerMap();
   const [tariffRate, setTariffRate] = useState(playerMap[xy].tariffRate);
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerMapYourTile)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <PlayerHandleComponent />
            <fieldset>
               <legend>{t(L.PlayerMapSetYourTariff)}</legend>
               <div className="row">
                  <div className="f1">{t(L.PlayerMapTariff)}</div>
                  <div className="text-strong">{formatPercent(tariffRate)}</div>
               </div>
               <div className="sep5"></div>
               <input
                  type="range"
                  min={0}
                  max={100}
                  step="1"
                  value={tariffRate * 100 * 100}
                  onChange={(e) => {
                     setTariffRate(safeParseInt(e.target.value) / 100 / 100);
                  }}
               />
               <div className="sep20"></div>
               <div className="text-desc text-small">{t(L.PlayerMapTariffDesc)}</div>
               <div className="sep10"></div>
               <button
                  className="w100 row jcc"
                  disabled={tariffRate === playerMap[xy].tariffRate}
                  onClick={async () => {
                     try {
                        await client.setTariffRate(tariffRate);
                     } catch (error) {
                        showToast(String(error));
                     }
                  }}
               >
                  <div className="m-icon small mr5">cached</div>
                  <div>{t(L.PlayerMapTariffApply)}</div>
               </button>
            </fieldset>
         </div>
      </div>
   );
}
