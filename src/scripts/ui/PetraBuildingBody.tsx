import { notifyGameStateUpdate } from "../Global";
import { getStorageFor } from "../logic/BuildingLogic";
import { MAX_OFFLINE_PRODUCTION_SEC } from "../logic/Constants";
import { IPetraBuildingData, PetraOptions } from "../logic/Tile";
import { formatHM, formatPercent } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playClick, playError } from "../visuals/Sound";
import { IBuildingComponentProps } from "./BuildingPage";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";
import { WarningComponent } from "./WarningComponent";

export function PetraBuildingBody({ gameState, xy }: IBuildingComponentProps) {
   const building = gameState.tiles[xy].building as IPetraBuildingData;
   if (!building || building.type !== "Petra") {
      return null;
   }
   const { used, total } = getStorageFor(xy, gameState);
   return (
      <div className="window-body">
         <fieldset>
            <legend>{t(L.OfflineProduction)}</legend>
            <div className="row">
               <div className="f1">{t(L.MaxOfflineProductionTime)}</div>
               <div className="text-strong">
                  {formatHM(building.offlineProductionPercent * MAX_OFFLINE_PRODUCTION_SEC * 1000)}
               </div>
            </div>
            <div className="sep5" />
            <div className="text-desc text-small">{t(L.WarpConversionDesc)}</div>
            <div className="sep10" />
            <div className="separator has-title">
               <div>
                  {t(L.LimitOfflineProduction)}: {formatPercent(building.offlineProductionPercent)}
               </div>
            </div>
            <input
               id="building-capacity"
               type="range"
               min="0"
               max="1"
               step="0.01"
               value={building.offlineProductionPercent}
               onChange={(e) => {
                  building.offlineProductionPercent = parseFloat(e.target.value);
                  notifyGameStateUpdate();
               }}
               className="mh0"
            />
            <div className="sep5" />
         </fieldset>
         <fieldset>
            <legend className="text-strong">{t(L.LevelX, { level: building.level })}</legend>
            <button
               disabled={(building.resources.Warp ?? 0) < total}
               className="row w100 jcc"
               onClick={() => {
                  if ((building.resources.Warp ?? 0) >= total) {
                     building.resources.Warp = 0;
                     building.level++;
                     notifyGameStateUpdate();
                  } else {
                     playError();
                  }
               }}
            >
               <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
                  input_circle
               </div>
               <div className="f1 row text-strong">{t(L.Upgrade)}</div>
               <div className="text-desc">
                  <FormatNumber value={total} /> {t(L.Warp)}
               </div>
            </button>
            <div className="sep10"></div>
            <div className="separator has-title">
               <div>
                  {t(L.Storage)}: {formatPercent(used / total)}
               </div>
            </div>
            <div className="sep5"></div>
            <ProgressBarComponent progress={used / total} />
            <div className="sep5"></div>
            <div className="row">
               <div className="f1">{t(L.Warp)}</div>
               <div className="text-strong">
                  <FormatNumber value={building.resources.Warp ?? 0} /> / <FormatNumber value={total} />
               </div>
            </div>
            <div className="separator"></div>
            <div className="row">
               <div className="f1">
                  <div className="text-strong">{t(L.TurnOnTimeWarp)}</div>
                  <div className="text-small text-desc">{t(L.TurnOnTimeWarpDesc)}</div>
               </div>
               <div
                  className="pointer ml10"
                  onClick={() => {
                     playClick();
                     building.petraOptions ^= PetraOptions.TimeWarp;
                     notifyGameStateUpdate();
                  }}
               >
                  {building.petraOptions & PetraOptions.TimeWarp ? (
                     <div className="m-icon text-green">toggle_on</div>
                  ) : (
                     <div className="m-icon text-desc">toggle_off</div>
                  )}
               </div>
            </div>
         </fieldset>
         <WarningComponent icon="info">{t(L.PetraNoMultiplier)}</WarningComponent>
         <div className="sep10"></div>
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
      </div>
   );
}
