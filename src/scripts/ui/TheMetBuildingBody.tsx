import { MAX_TELEPORT, TELEPORT_SECONDS } from "../../../shared/logic/Constants";
import type { IGreatPeopleBuildingData } from "../../../shared/logic/Tile";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function TheMetBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IGreatPeopleBuildingData;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            <legend>{t(L.Teleport)}</legend>
            <WarningComponent icon="info" className="mb10 text-small">
               <RenderHTML html={t(L.TeleportDescHTML, { time: TELEPORT_SECONDS })} />
            </WarningComponent>
            <ProgressBarComponent progress={(building.resources.Teleport ?? 0) / MAX_TELEPORT} />
            <div className="row mt5">
               <div className="f1">
                  {" "}
                  {(building.resources.Explorer ?? 0) >= 10 ? (
                     <div>-</div>
                  ) : (
                     <div>{TELEPORT_SECONDS - (gameState.tick % TELEPORT_SECONDS)}s</div>
                  )}
               </div>
               <FormatNumber value={building.resources.Teleport ?? 0} />/{MAX_TELEPORT}
            </div>
         </fieldset>
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
