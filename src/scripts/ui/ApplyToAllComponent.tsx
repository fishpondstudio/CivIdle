import Tippy from "@tippyjs/react";
import { applyToAllBuildings } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { getGrid, getStorageFullBuildings } from "../../../shared/logic/IntraTickCache";
import type { IBuildingData } from "../../../shared/logic/Tile";
import { hasFlag, pointToTile, sizeOf, tileToPoint, type Tile } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { WorldScene } from "../scenes/WorldScene";
import { Singleton } from "../utilities/Singleton";
import { playSuccess } from "../visuals/Sound";
import { showToast } from "./GlobalModal";

export enum ApplyToAllFlag {
   None = 0,
   NoDefault = 1 << 0,
}

export function ApplyToAllComponent<T extends IBuildingData>({
   xy,
   getOptions,
   gameState,
   flags,
}: {
   xy: Tile;
   getOptions: (s: T) => Partial<T>;
   gameState: GameState;
   flags?: ApplyToAllFlag;
}): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as T;
   if (!building) {
      return null;
   }
   flags ??= ApplyToAllFlag.None;
   const def = Config.Building[building.type];
   const options = useGameOptions();
   const property = getOptions(building);
   console.assert(sizeOf(property) === 1);
   return (
      <div className="text-small row">
         <Tippy content={t(L.ApplyToAllBuilding, { building: def.name() })}>
            <button
               style={{ width: 27, padding: 0 }}
               onClick={() => {
                  playSuccess();
                  const count = applyToAllBuildings(building.type, getOptions, gameState);
                  showToast(t(L.ApplyToBuildingsToastHTML, { count, building: def.name() }));
               }}
            >
               <div className="m-icon small">sync</div>
            </button>
         </Tippy>
         {[1, 2, 3, 4, 5].map((tile) => {
            return (
               <Tippy key={tile} content={t(L.ApplyToBuildingInTile, { building: def.name(), tile })}>
                  <button
                     style={{ width: 27, padding: 0 }}
                     onMouseEnter={() => {
                        Singleton()
                           .sceneManager.getCurrent(WorldScene)
                           ?.drawSelection(
                              null,
                              getGrid(gameState)
                                 .getRange(tileToPoint(xy), tile)
                                 .map((p) => pointToTile(p))
                                 .filter((xy) => gameState.tiles.get(xy)?.building?.type === building.type),
                           );
                     }}
                     onMouseLeave={() => {
                        Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, []);
                     }}
                     onClick={() => {
                        playSuccess();
                        let count = 0;
                        getGrid(gameState)
                           .getRange(tileToPoint(xy), tile)
                           .map((p) => gameState.tiles.get(pointToTile(p))?.building)
                           .forEach((b) => {
                              if (b?.type === building.type) {
                                 ++count;
                                 Object.assign(b, getOptions(building));
                              }
                           });
                        showToast(t(L.ApplyToBuildingsToastHTML, { count, building: def.name() }));
                     }}
                  >
                     {tile}
                  </button>
               </Tippy>
            );
         })}
         <div className="f1"></div>
         <Tippy content={t(L.TurnOffFullBuildings, { building: def.name() })}>
            <button
               style={{ width: 27, padding: 0 }}
               onClick={() => {
                  playSuccess();
                  //const count = applyToAllBuildings(building.type, getOptions, gameState);
                  getStorageFullBuildings()
                     .filter((xy) => {
                        return gameState.tiles.get(xy)?.building?.type === building.type;
                     })
                     .forEach((xy) => {
                        const b = gameState.tiles.get(xy)?.building;
                        if (b === undefined) {
                           return;
                        }
                        b.capacity = 0;
                     });
               }}
            >
               <div className="m-icon small">power_settings_new</div>
            </button>
         </Tippy>
         {hasFlag(flags, ApplyToAllFlag.NoDefault) ? null : (
            <Tippy
               content={t(L.SetAsDefaultBuilding, {
                  building: def.name(),
               })}
            >
               <button
                  style={{ width: 27, padding: 0 }}
                  onClick={() => {
                     playSuccess();
                     const defaults = options.buildingDefaults;
                     if (!defaults[building.type]) {
                        defaults[building.type] = {};
                     }
                     Object.assign(defaults[building.type]!, getOptions(building));
                     notifyGameOptionsUpdate();
                  }}
               >
                  <div className="m-icon small">settings_heart</div>
               </button>
            </Tippy>
         )}
      </div>
   );
}
