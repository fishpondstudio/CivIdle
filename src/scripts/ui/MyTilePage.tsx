import { useState } from "react";
import { MAX_TARIFF_RATE } from "../../../shared/logic/Constants";
import { formatPercent, safeParseInt } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { client, usePlayerMap } from "../rpc/RPCClient";
import { showToast } from "./GlobalModal";
import { MenuComponent } from "./MenuComponent";
import { PlayerHandleComponent } from "./PlayerHandleComponent";
import { TitleBarComponent } from "./TitleBarComponent";
import { MapTileBonusComponent } from "./MapTileBonusComponent";

export function MyTilePage({ xy }: { xy: string }): React.ReactNode {
   const playerMap = usePlayerMap();
   const [tariffRate, setTariffRate] = useState(playerMap.get(xy)?.tariffRate ?? 0);
   return (
      <div className="window">
         <TitleBarComponent>{t(L.PlayerMapYourTile)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body">
            <MapTileBonusComponent xy={xy} />
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
                  max={100 * 100 * MAX_TARIFF_RATE}
                  step="10"
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
                  disabled={tariffRate === playerMap.get(xy)?.tariffRate}
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
