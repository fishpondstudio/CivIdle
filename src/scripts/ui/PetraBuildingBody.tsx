import { getPetraBaseStorage } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
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
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const baseStorage = getPetraBaseStorage(building);
   return (
      <div className="window-body">
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
         </fieldset>
         <WarpSpeedComponent />
         <WarningComponent icon="info" className="text-small mb10">
            <RenderHTML
               html={t(L.BuildingNoMultiplier, { building: Config.Building[building.type].name() })}
            />
         </WarningComponent>
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
