import { notifyGameStateUpdate } from "../Global";
import { isWorldOrNaturalWonder } from "../logic/BuildingLogic";
import { useShortcut } from "../logic/Shortcut";
import { WorldScene } from "../scenes/WorldScene";
import { Singleton } from "../utilities/Singleton";
import { L, t } from "../utilities/i18n";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingSellComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles[xy];
   const building = tile.building;
   if (building == null || isWorldOrNaturalWonder(building.type)) {
      return null;
   }
   const sellBuilding = () => {
      delete tile.building;
      Singleton().sceneManager.getCurrent(WorldScene)?.resetTile(tile.xy);
      notifyGameStateUpdate();
   };
   useShortcut("BuildingPageSellBuilding", sellBuilding, [xy]);
   return (
      <button className="row w100 jcc" onClick={sellBuilding}>
         <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
            delete
         </div>
         <div>{t(L.SellBuilding)}</div>
      </button>
   );
}
