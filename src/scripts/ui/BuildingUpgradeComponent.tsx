import classNames from "classnames";
import { useState } from "react";
import { getBuildingUpgradeLevels, getTotalBuildingCost } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import {} from "../../../shared/logic/GameState";
import { getGameOptions, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getUpgradePriority, setUpgradePriority } from "../../../shared/logic/Tile";
import { type Tile, isEmpty, numberToRoman, tileToPoint } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { WorldScene } from "../scenes/WorldScene";
import { jsxMapOf } from "../utilities/Helper";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";

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
   const [selected, setSelected] = useState(0);
   const cost = getTotalBuildingCost(building.type, building.level, building.level + levels[selected]);
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
               <div className="f1">{t(L.Level)}</div>
               <div className="text-strong">{building.level}</div>
            </div>
            <div className="sep5" />
            <div className="row">
               <div className="f1">{t(L.BuildingTier)}</div>
               <div className="text-strong">{numberToRoman(Config.BuildingTier[building.type]!)}</div>
            </div>
            <div className="separator"></div>
            <div className="row text-link text-strong">
               <div className="m-icon " style={{ margin: "-10px 0" }}>
                  search
               </div>
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
         <fieldset>
            <legend>{t(L.Upgrade)}</legend>
            <div className="row">
               {levels.map((level, index) => (
                  <button
                     key={level}
                     className={classNames({ "text-strong": index === selected, f1: true })}
                     onMouseOver={setSelected.bind(null, index)}
                     onClick={() => upgrade(level)}
                  >
                     x{level}
                  </button>
               ))}
            </div>
            <div className="sep5" />
            <div className="text-desc text-small">
               {jsxMapOf(cost, (res, amount) => {
                  return (
                     <div className="row" key={res}>
                        <div className="f1">{Config.Resource[res].name()}</div>
                        <div className="text-strong">
                           <FormatNumber value={amount} />
                        </div>
                     </div>
                  );
               })}
            </div>
         </fieldset>
      </>
   );
}
