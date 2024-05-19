import Tippy from "@tippyjs/react";
import { useState } from "react";
import { isSpecialBuilding } from "../../../shared/logic/BuildingLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { RequestResetTile } from "../../../shared/logic/TechLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { pointToTile, safeAdd } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { WorldScene } from "../scenes/WorldScene";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playClick, playError, playSuccess } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { hideToast, showToast } from "./GlobalModal";

export function BuildingSellComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   const building = tile?.building;
   if (!tile || !building || isSpecialBuilding(building.type)) {
      return null;
   }
   const sellBuilding = () => {
      delete tile!.building;
      Singleton().sceneManager.enqueue(WorldScene, (s) => s.resetTile(tile!.tile));
      notifyGameStateUpdate();
   };
   useShortcut("BuildingPageSellBuilding", sellBuilding, [xy]);
   const [moving, setMoving] = useState(false);
   const theMet = Tick.current.specialBuildings.get("TheMet");
   return (
      <fieldset>
         <button className="row w100 jcc" onClick={sellBuilding}>
            <div className="m-icon small">delete</div>
            <div className="f1">{t(L.DemolishBuilding)}</div>
         </button>
         {theMet ? (
            <button
               className="row w100 jcc mt10"
               disabled={moving || (theMet.building.resources.Teleport ?? 0) <= 0}
               onClick={async () => {
                  playClick();
                  showToast(t(L.MoveBuildingSelectTileToastHTML), 10000000);
                  setMoving(true);
                  const point = await Singleton().sceneManager.getCurrent(WorldScene)?.hijackSelectGrid();
                  hideToast();
                  setMoving(false);
                  if (!point || moving || (theMet.building.resources.Teleport ?? 0) <= 0) {
                     playError();
                     return;
                  }
                  const xy = pointToTile(point);
                  const newTile = gameState.tiles.get(xy);
                  if (newTile && !newTile.building) {
                     playSuccess();
                     newTile.building = building;
                     safeAdd(theMet.building.resources, "Teleport", -1);
                     delete tile.building;
                     RequestResetTile.emit(tile.tile);
                     RequestResetTile.emit(newTile.tile);
                     notifyGameStateUpdate();
                     Singleton().sceneManager.getCurrent(WorldScene)?.selectGrid(point);
                  } else {
                     showToast(L.MoveBuildingFail);
                     playError();
                  }
               }}
            >
               <div className="m-icon small">zoom_out_map</div>
               <Tippy
                  content={t(L.MoveBuildingNoTeleport)}
                  disabled={(theMet.building.resources.Teleport ?? 0) > 0}
               >
                  <div className="f1">{moving ? t(L.MoveBuildingSelectTile) : t(L.MoveBuilding)}</div>
               </Tippy>
            </button>
         ) : null}
      </fieldset>
   );
}
