import { notifyGameStateUpdate } from "../Global";
import { isWorldOrNaturalWonder } from "../logic/BuildingLogic";
import { WorldScene } from "../scenes/WorldScene";
import { L, t } from "../utilities/i18n";
import { Singleton } from "../utilities/Singleton";
import { IBuildingComponentProps } from "./BuildingPage";

export function BuildingSellComponent({ gameState, xy }: IBuildingComponentProps) {
   const tile = gameState.tiles[xy];
   const building = tile.building;
   if (building == null || isWorldOrNaturalWonder(building.type)) {
      return null;
   }
   return (
      <button
         className="row w100 jcc"
         onClick={() => {
            delete tile.building;
            Singleton().sceneManager.getCurrent(WorldScene)?.resetTile(tile.xy);
            notifyGameStateUpdate();
         }}
      >
         <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
            delete
         </div>
         <div>{t(L.SellBuilding)}</div>
      </button>
   );
}
