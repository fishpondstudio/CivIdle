import Tippy from "@tippyjs/react";
import { useCallback } from "react";
import { isSpecialBuilding } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { GameStateFlags } from "../../../shared/logic/GameState";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getCitySize, getGrid } from "../../../shared/logic/IntraTickCache";
import { clearTransportSourceCache } from "../../../shared/logic/Update";
import { pointToTile, setFlag, tileToPoint } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { WorldScene } from "../scenes/WorldScene";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playSuccess } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { ConfirmModal } from "./ConfirmModal";
import { showModal, showToast } from "./GlobalModal";

export function BuildingSellComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   const building = tile?.building;
   if (!tile || !building || isSpecialBuilding(building.type)) {
      return null;
   }
   const demolishBuilding = useCallback(() => {
      delete tile!.building;
      Singleton().sceneManager.enqueue(WorldScene, (s) => s.resetTile(tile!.tile));
      clearTransportSourceCache();
      gameState.flags = setFlag(gameState.flags, GameStateFlags.HasDemolishedBuilding);
      notifyGameStateUpdate();
   }, [tile, gameState]);
   useShortcut("BuildingPageSellBuilding", demolishBuilding, [xy]);
   const def = Config.Building[building.type];

   return (
      <fieldset className="row">
         <button className="row jcc f1" onClick={demolishBuilding}>
            <div className="m-icon small">delete</div>
            <div>{t(L.DemolishBuilding)}</div>
         </button>
         {[1, 2, 3, 4, 5, getCitySize(gameState) * 2].map((range) => {
            return (
               <Tippy key={range} content={t(L.DemolishAllBuilding, { building: def.name(), tile: range })}>
                  <button
                     style={{ width: 27, padding: 0 }}
                     onMouseEnter={() => {
                        Singleton()
                           .sceneManager.getCurrent(WorldScene)
                           ?.drawSelection(
                              null,
                              getGrid(gameState)
                                 .getRange(tileToPoint(xy), range)
                                 .map((p) => pointToTile(p))
                                 .filter((xy) => gameState.tiles.get(xy)?.building?.type === building.type),
                           );
                     }}
                     onMouseLeave={() => {
                        Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, []);
                     }}
                     onClick={() => {
                        let count = 0;
                        getGrid(gameState)
                           .getRange(tileToPoint(xy), range)
                           .map((p) => gameState.tiles.get(pointToTile(p)))
                           .forEach((tile) => {
                              if (tile?.building?.type === building.type) {
                                 ++count;
                              }
                           });
                        showModal(
                           <ConfirmModal
                              title={t(L.DemolishAllBuildingConfirmTitle, { count: count })}
                              onConfirm={() => {
                                 playSuccess();
                                 let count = 0;
                                 getGrid(gameState)
                                    .getRange(tileToPoint(xy), range)
                                    .map((p) => gameState.tiles.get(pointToTile(p)))
                                    .forEach((tile) => {
                                       if (tile?.building?.type === building.type) {
                                          delete tile.building;
                                          ++count;
                                          Singleton().sceneManager.enqueue(WorldScene, (s) =>
                                             s.resetTile(tile.tile),
                                          );
                                       }
                                    });
                                 if (count > 0) {
                                    gameState.flags = setFlag(
                                       gameState.flags,
                                       GameStateFlags.HasDemolishedBuilding,
                                    );
                                 }
                                 clearTransportSourceCache();
                                 notifyGameStateUpdate();
                                 showToast(t(L.ApplyToBuildingsToastHTML, { count, building: def.name() }));
                              }}
                           >
                              {t(L.DemolishAllBuildingConfirmContent, { count: count, name: def.name() })}
                           </ConfirmModal>,
                        );
                     }}
                  >
                     {range}
                  </button>
               </Tippy>
            );
         })}
      </fieldset>
   );
}
