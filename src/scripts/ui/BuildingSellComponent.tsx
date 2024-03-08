import { isWorldOrNaturalWonder } from "../../../shared/logic/BuildingLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
import { WorldScene } from "../scenes/WorldScene";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingSellComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   const building = tile?.building;
   if (building == null || isWorldOrNaturalWonder(building.type)) {
      return null;
   }
   const sellBuilding = () => {
      delete tile!.building;
      Singleton().sceneManager.enqueue(WorldScene, (s) => s.resetTile(tile!.tile));
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
