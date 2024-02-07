import Tippy from "@tippyjs/react";
import { getBuildingUpgradeLevels, getTotalBuildingCost } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import {} from "../../../shared/logic/GameState";
import { getGameOptions, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getUpgradePriority, setUpgradePriority } from "../../../shared/logic/Tile";
import {
   formatNumber,
   isEmpty,
   mapOf,
   numberToRoman,
   tileToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { WorldScene } from "../scenes/WorldScene";
import { jsxMapOf } from "../utilities/Helper";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingUpgradeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   const building = tile?.building;
   if (!building) {
      return null;
   }
   if ((Config.Building[building.type]?.max ?? Infinity) <= 1) {
      return null;
   }
   const deposits = tile.deposit;
   const levels = getBuildingUpgradeLevels(building);
   const upgrade = (level: number) => {
      building.desiredLevel = building.level + level;
      building.status = "upgrading";
      building.priority = setUpgradePriority(
         building.priority,
         getUpgradePriority(getGameOptions().defaultPriority),
      );
      notifyGameStateUpdate();
   };
   useShortcut("BuildingPageUpgradeX1", () => upgrade(1), [xy]);
   useShortcut("BuildingPageUpgradeX5", () => upgrade(5), [xy]);
   useShortcut("BuildingPageUpgradeToNext10", () => upgrade(levels[levels.length - 1]), [xy]);

   return (
      <>
         <fieldset>
            <div className="row">
               <div className="f1 text-center">
                  <div className="text-strong text-large">{building.level}</div>
                  <div className="text-small text-desc">{t(L.Level)}</div>
               </div>
               <div className="f1 text-center">
                  <div className="text-strong text-large">
                     {numberToRoman(Config.BuildingTier[building.type]!)}
                  </div>
                  <div className="text-small text-desc">{t(L.BuildingTier)}</div>
               </div>
            </div>
            <div className="separator"></div>
            <div className="column">
               <div className="mb5 text-strong text-small">Upgrade Building</div>
               <div className="row">
                  {levels.map((level, index) => (
                     <Tippy
                        content={`${t(L.Upgrade)} x${level}: ${mapOf(
                           getTotalBuildingCost(
                              building.type,
                              building.level,
                              building.level + levels[index],
                           ),
                           (res, amount) => {
                              return `${Config.Resource[res].name()} ${formatNumber(amount)}`;
                           },
                        ).join(", ")}`}
                        placement="top"
                     >
                        <button key={level} className="f1" onClick={() => upgrade(level)}>
                           x{level}
                        </button>
                     </Tippy>
                  ))}
               </div>
            </div>
            <div className="separator"></div>
            <div className="row text-link text-strong text-small">
               <div className="m-icon small">search</div>
               <div
                  className="ml5"
                  onClick={() => {
                     const result: Tile[] = [];
                     gameState.tiles.forEach((tile, xy) => {
                        if (tile.building?.type === building.type) {
                           result.push(xy);
                        }
                     });
                     Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(tileToPoint(xy), result);
                  }}
               >
                  {Config.Building[building.type].name()}
               </div>
               {isEmpty(deposits)
                  ? null
                  : jsxMapOf(deposits, (deposit) => {
                       return (
                          <div
                             key={deposit}
                             className="ml10"
                             onClick={() => {
                                const result: Tile[] = [];
                                gameState.tiles.forEach((tile, xy) => {
                                   if (tile.explored && tile.deposit[deposit]) {
                                      result.push(xy);
                                   }
                                });
                                Singleton()
                                   .sceneManager.getCurrent(WorldScene)
                                   ?.drawSelection(tileToPoint(xy), result);
                             }}
                          >
                             {Config.Resource[deposit].name()}
                          </div>
                       );
                    })}
            </div>
         </fieldset>
      </>
   );
}
