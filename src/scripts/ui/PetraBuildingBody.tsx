import { getPetraBaseStorage } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { L, t } from "../../../shared/utilities/i18n";
import { playError } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";
import { WarpSpeedComponent } from "./WarpSpeedComponent";

export function PetraBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const petra = gameState.tiles.get(xy)?.building;
   if (!petra) {
      return null;
   }
   const hq = Tick.current.specialBuildings.get("Headquarter")?.building;
   if (!hq) {
      return null;
   }
   const baseStorage = getPetraBaseStorage(petra);
   return (
      <div className="window-body">
         <fieldset>
            <legend className="text-strong">{t(L.LevelX, { level: petra.level })}</legend>
            <button
               disabled={(hq.resources.Warp ?? 0) < baseStorage}
               className="row w100 jcc"
               onClick={() => {
                  if (hq.resources.Warp && hq.resources.Warp >= baseStorage) {
                     hq.resources.Warp -= baseStorage;
                     petra.level++;
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
         </fieldset>
         <WarpSpeedComponent />
         <WarningComponent icon="info" className="text-small mb10">
            <RenderHTML html={t(L.BuildingNoMultiplier, { building: Config.Building[petra.type].name() })} />
         </WarningComponent>
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
