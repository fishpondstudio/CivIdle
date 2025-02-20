import { exploreTile, getExplorerRange } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGrid } from "../../../shared/logic/IntraTickCache";
import { Tick } from "../../../shared/logic/TickLogic";
import { pointToTile, safeAdd, tileToPoint } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import Discovery from "../../images/Discovery.jpg";
import { WorldScene } from "../scenes/WorldScene";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playError, playSuccess } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { TitleBarComponent } from "./TitleBarComponent";
import { WarningComponent } from "./WarningComponent";

export function UnexploredTilePage({ xy, gameState }: IBuildingComponentProps): React.ReactNode {
   const statistics = Tick.current.specialBuildings.get("Statistics");
   let explorers = 0;
   if (statistics) {
      explorers = statistics.building.resources.Explorer ?? 0;
   }

   const explore = () => {
      const tile = gameState.tiles.get(xy);
      if (!tile || tile.explored || !statistics || explorers <= 0) {
         playError();
         return;
      }
      const stat = statistics.building;
      if (!stat) {
         playError();
         return;
      }

      playSuccess();
      if ((stat.resources.Explorer ?? 0) > 0) {
         safeAdd(stat.resources, "Explorer", -1);
      }
      exploreTile(xy, gameState);
      Singleton().sceneManager.enqueue(WorldScene, (s) => s.revealTile(xy));
      getGrid(gameState)
         .getRange(tileToPoint(xy), getExplorerRange(gameState))
         .forEach((neighbor) => {
            const neighborXy = pointToTile(neighbor);
            exploreTile(neighborXy, gameState);
            Singleton().sceneManager.enqueue(WorldScene, (s) => s.revealTile(neighborXy));
         });
   };
   useShortcut("SendAnExplorer", explore, [xy]);

   return (
      <div className="window">
         <TitleBarComponent>{t(L.UnexploredTile)}</TitleBarComponent>
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
            <button className="w100 jcc row mb10" disabled={explorers <= 0} onClick={explore}>
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
