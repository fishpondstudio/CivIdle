import { getPetraBaseStorage, getStorageFor } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { MAX_OFFLINE_PRODUCTION_SEC } from "../../../shared/logic/Constants";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import type { IPetraBuildingData } from "../../../shared/logic/Tile";
import { clamp, formatHM, formatPercent } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playError } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function PetraBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IPetraBuildingData;
   if (!building || building.type !== "Petra") {
      return null;
   }
   const { used, total } = getStorageFor(xy, gameState);
   const baseStorage = getPetraBaseStorage(building);
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
               disabled={(building.resources.Warp ?? 0) < baseStorage}
               className="row w100 jcc"
               onClick={() => {
                  if (building.resources.Warp && building.resources.Warp >= baseStorage) {
                     building.resources.Warp -= baseStorage;
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
                  <FormatNumber value={baseStorage} /> {t(L.Warp)}
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
                  <div className="text-strong">{t(L.TimeWarp)}</div>
               </div>
               <div className="ml10 text-strong">{building.speedUp}x</div>
            </div>
            <input
               type="range"
               min={1}
               max={8}
               step="1"
               value={building.speedUp}
               onChange={(e) => {
                  building.speedUp = clamp(parseInt(e.target.value, 10), 1, 8);
                  notifyGameStateUpdate();
               }}
            />
            <div className="sep15" />
            {building.speedUp > 1 ? (
               <div className="text-small text-desc">
                  {t(L.TurnOnTimeWarpDesc, { speed: building.speedUp })}
               </div>
            ) : null}
            {building.speedUp > 2 ? (
               <div className="text-small text-strong text-red mt5">{t(L.TimeWarpWarning)}</div>
            ) : null}
         </fieldset>
         <WarningComponent icon="info" className="text-small mb10">
            <RenderHTML
               html={t(L.BuildingNoMultiplier, { building: Config.Building[building.type].name() })}
            />
         </WarningComponent>
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
