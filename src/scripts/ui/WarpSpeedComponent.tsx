import { getMaxWarpSpeed, getMaxWarpStorage } from "../../../shared/logic/BuildingLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { clamp, formatPercent } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";

export function WarpSpeedComponent(): React.ReactNode {
   const hq = Tick.current.specialBuildings.get("Headquarter");
   const gs = useGameState();
   if (!hq) {
      return null;
   }
   const maxSpeedUp = getMaxWarpSpeed(gs);
   const total = getMaxWarpStorage(gs);
   return (
      <fieldset>
         <legend>
            <b>{gs.speedUp}x</b> {t(L.WarpSpeed)}
         </legend>
         <input
            type="range"
            min={1}
            max={maxSpeedUp}
            step="1"
            value={gs.speedUp}
            onChange={(e) => {
               gs.speedUp = clamp(Number.parseInt(e.target.value, 10), 1, maxSpeedUp);
               notifyGameStateUpdate();
            }}
         />
         <div className="text-center text-strong"></div>
         {gs.speedUp > 1 ? (
            <div className="text-small text-des mt5">{t(L.TurnOnTimeWarpDesc, { speed: gs.speedUp })}</div>
         ) : null}
         {gs.speedUp > 2 ? (
            <div className="text-small text-strong text-red mt5">{t(L.TimeWarpWarning)}</div>
         ) : null}
         <div className="separator" />
         <ProgressBarComponent progress={(hq.building.resources.Warp ?? 0) / total} />
         <div className="sep5" />
         <div className="row">
            <div className="f1">{t(L.Warp)}</div>
            <div className="f1 text-center text-desc">
               {formatPercent((hq.building.resources.Warp ?? 0) / total)}
            </div>
            <div className="f1 text-right text-strong">
               <FormatNumber value={hq.building.resources.Warp ?? 0} /> / <FormatNumber value={total} />
            </div>
         </div>
      </fieldset>
   );
}
