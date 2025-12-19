import { useState } from "react";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { clearIntraTickCache } from "../../../shared/logic/IntraTickCache";
import { RequestResetTile } from "../../../shared/logic/TechLogic";
import { clearTransportSourceCache } from "../../../shared/logic/Update";
import { pointToTile } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { WorldScene } from "../scenes/WorldScene";
import { Singleton } from "../utilities/Singleton";
import { playClick, playError, playSuccess } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { hideToast, showToast } from "./GlobalModal";
import { UpgradeableWonderComponent } from "./UpgradeableWonderComponent";

export function AkademikLomonosovBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   const [moving, setMoving] = useState(false);
   const building = tile?.building;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <button
            className="row w100 jcc mv10"
            disabled={moving}
            onClick={async () => {
               playClick();
               showToast(t(L.MoveBuildingSelectTileToastHTML), Number.POSITIVE_INFINITY);
               setMoving(true);
               const point = await Singleton().sceneManager.getCurrent(WorldScene)?.hijackSelectGrid();
               hideToast();
               setMoving(false);
               if (!point || moving) {
                  playError();
                  return;
               }
               const xy = pointToTile(point);
               const newTile = gameState.tiles.get(xy);
               if (newTile && !newTile.building && newTile.explored) {
                  playSuccess();
                  newTile.building = building;
                  delete tile.building;
                  RequestResetTile.emit(tile.tile);
                  RequestResetTile.emit(newTile.tile);
                  notifyGameStateUpdate();
                  clearTransportSourceCache();
                  clearIntraTickCache();
                  Singleton().sceneManager.getCurrent(WorldScene)?.selectGrid(point);
               } else {
                  showToast(L.MoveBuildingFail);
                  playError();
               }
            }}
         >
            <div className="m-icon small">zoom_out_map</div>
            <div className="f1">{moving ? t(L.MoveBuildingSelectTile) : t(L.MoveBuilding)}</div>
         </button>
         <UpgradeableWonderComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
