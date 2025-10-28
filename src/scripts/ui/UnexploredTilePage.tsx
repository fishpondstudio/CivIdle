import Tippy from "@tippyjs/react";
import { exploreTile, getExplorerRange } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getGrid } from "../../../shared/logic/IntraTickCache";
import { getScienceAmount, getTechUnlockCost, tryDeductScience } from "../../../shared/logic/TechLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { formatNumber, pointToTile, safeAdd, tileToPoint } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import Discovery from "../../images/Discovery.jpg";
import { WorldScene } from "../scenes/WorldScene";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playAgeUp, playError, playSuccess } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { MenuComponent } from "./MenuComponent";
import { html } from "./RenderHTMLComponent";
import { TitleBarComponent } from "./TitleBarComponent";

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

   const cartographerCost = getTechUnlockCost("Exploration");
   return (
      <div className="window">
         <TitleBarComponent>{t(L.UnexploredTile)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body">
            <fieldset>
               <legend>{t(L.Explorer)}</legend>
               {html(
                  t(L.ExploreThisTileHTML, {
                     name: Config.Building.Statistics.name(),
                     count: explorers,
                  }),
               )}
               <div className="sep10" />
               <button className="w100 jcc row" disabled={explorers <= 0} onClick={explore}>
                  <div className="m-icon small">explore</div>
                  <div className="f1 text-strong">{t(L.ExploreThisTile)}</div>
               </button>
            </fieldset>
            <fieldset>
               <legend>{t(L.Cartographer)}</legend>
               <div>
                  {html(
                     t(L.SendCartographerDescHTML, {
                        science: formatNumber(cartographerCost),
                     }),
                  )}
               </div>
               <div className="sep10" />
               <button
                  className="w100 jcc row"
                  disabled={!canSendCartographer(gameState)}
                  onClick={() => {
                     if (!canSendCartographer(gameState)) {
                        playError();
                        return;
                     }
                     if (!tryDeductScience(cartographerCost, gameState)) {
                        playError();
                        return;
                     }
                     playAgeUp();
                     gameState.tiles.forEach((tile, xy) => {
                        if (!tile.explored) {
                           exploreTile(xy, gameState);
                           Singleton().sceneManager.enqueue(WorldScene, (s) => s.revealTile(xy));
                        }
                     });
                     notifyGameStateUpdate();
                  }}
               >
                  <div className="m-icon small">explore</div>
                  <div className="f1 text-strong">{t(L.SendACartographer)}</div>
               </button>
            </fieldset>
            <Tippy content="Der Wanderer über dem Nebelmeer (Wanderer above the Sea of Fog), Caspar David Friedrich, 1818">
               <div className="inset-shallow">
                  <img src={Discovery} className="w100" style={{ display: "block" }} />
               </div>
            </Tippy>
         </div>
      </div>
   );
}

function canSendCartographer(gameState: GameState) {
   return (
      gameState.unlockedTech.Exploration && getScienceAmount(gameState) >= getTechUnlockCost("Exploration")
   );
}
