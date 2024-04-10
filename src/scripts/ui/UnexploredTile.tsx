import { exploreTile } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGrid } from "../../../shared/logic/IntraTickCache";
import { Tick } from "../../../shared/logic/TickLogic";
import { pointToTile, safeAdd, tileToPoint } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import Discovery from "../../images/Discovery.jpg";
import { WorldScene } from "../scenes/WorldScene";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playError } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function UnexploredTile({ xy, gameState }: IBuildingComponentProps): React.ReactNode {
   const statistics = Tick.current.specialBuildings.get("Statistics");
   let explorers = 0;
   if (statistics) {
      explorers = gameState.tiles.get(statistics)?.building?.resources.Explorer ?? 0;
   }

   const explore = () => {
      const tile = gameState.tiles.get(xy);
      if (!tile || tile.explored || !statistics) {
         playError();
         return;
      }
      const stat = gameState.tiles.get(statistics)?.building;
      if (!stat) {
         playError();
         return;
      }

      if ((stat.resources.Explorer ?? 0) > 0) {
         safeAdd(stat.resources, "Explorer", -1);
      }
      exploreTile(xy, gameState);
      Singleton().sceneManager.enqueue(WorldScene, (s) => s.revealTile(xy));
      getGrid(gameState)
         .getNeighbors(tileToPoint(xy))
         .forEach((neighbor) => {
            const neighborXy = pointToTile(neighbor);
            exploreTile(neighborXy, gameState);
            Singleton().sceneManager.enqueue(WorldScene, (s) => s.revealTile(neighborXy));
         });      
   };
   useShortcut("SendAnExplorer", () => explore(), [xy]);

   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.UnexploredTile)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <WarningComponent icon="info" className="mb10">
               <RenderHTML
                  className="text-small"
                  html={t(L.ExploreThisTileHTML, {
                     name: Config.Building.Statistics.name(),
                     count: explorers,
                  })}
               />
            </WarningComponent>
            <button
               className="w100 jcc row mb10"
               disabled={explorers <= 0}
               onClick={() => {
                  explore();
               }}
            >
               <div className="m-icon small">explore</div>
               <div className="f1 text-strong">{t(L.ExploreThisTile)}</div>
            </button>
            <div className="inset-shallow">
               <img src={Discovery} className="w100" style={{ display: "block" }} />
            </div>
         </div>
      </div>
   );
}
