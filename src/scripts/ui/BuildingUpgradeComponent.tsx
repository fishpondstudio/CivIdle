import Tippy from "@tippyjs/react";
import { getBuildingUpgradeLevels, getTotalBuildingCost } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
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
      notifyGameStateUpdate();
   };
   useShortcut("BuildingPageUpgradeX1", () => upgrade(levels[0]), [xy]);
   useShortcut("BuildingPageUpgradeX5", () => upgrade(levels[1]), [xy]);
   useShortcut("BuildingPageUpgradeToNext10", () => upgrade(levels[2]), [xy]);

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
            <div className="row">
               <div className="text-strong mr10">{t(L.UpgradeBuilding)}</div>
               {levels.map((level, idx) => (
                  <Tippy
                     key={idx}
                     content={`${t(L.Upgrade)} x${level}: ${mapOf(
                        getTotalBuildingCost(building.type, building.level, building.level + level),
                        (res, amount) => {
                           return `${Config.Resource[res].name()} ${formatNumber(amount)}`;
                        },
                     ).join(", ")}`}
                     placement="top"
                  >
                     <button className="f1" onClick={() => upgrade(level)}>
                        x{level}
                     </button>
                  </Tippy>
               ))}
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
