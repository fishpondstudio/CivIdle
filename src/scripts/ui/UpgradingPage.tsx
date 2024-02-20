import classNames from "classnames";
import { Config } from "../../../shared/logic/Config";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import {
   PRIORITY_MAX,
   PRIORITY_MIN,
   getUpgradePriority,
   setUpgradePriority,
   type ITileData,
} from "../../../shared/logic/Tile";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { useShortcut } from "../utilities/Hook";
import { playClick } from "../visuals/Sound";
import { BuildingConstructionProgressComponent } from "./BuildingConstructionProgressComponent";
import { MenuComponent } from "./MenuComponent";
import { WarningComponent } from "./WarningComponent";

export function UpgradingPage({ tile }: { tile: ITileData }): React.ReactNode {
   const building = tile.building;
   if (!building) {
      return null;
   }
   const gs = useGameState();
   const definition = Config.Building[building.type];
   const canDecreaseDesiredLevel = () => building.desiredLevel > building.level + 1;

   const increaseDesiredLevel = () => {
      playClick();
      building.desiredLevel++;
      notifyGameStateUpdate();
   };
   const decreaseDesiredLevel = () => {
      if (canDecreaseDesiredLevel()) {
         playClick();
         building.desiredLevel--;
         notifyGameStateUpdate();
      }
   };
   useShortcut("UpgradePageIncreaseLevel", () => increaseDesiredLevel(), [tile]);
   useShortcut("UpgradePageDecreaseLevel", () => decreaseDesiredLevel(), [tile]);
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{definition.name()}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <WarningComponent className="mb10" icon="info">
               {t(L.UpgradeBuildingNotProducingDesc)}
            </WarningComponent>
            <BuildingConstructionProgressComponent xy={tile.tile} gameState={gs} />
            <fieldset>
               <legend>{t(L.UpgradeBuilding)}</legend>
               <div className="row text-strong">
                  <div className="f1 text-large">{building.level}</div>
                  <div className="m-icon">keyboard_double_arrow_right</div>
                  <div
                     className="f1 row jce"
                     onWheel={(e) => {
                        if (e.deltaY < 0) {
                           building.desiredLevel++;
                           notifyGameStateUpdate();
                        }
                        if (e.deltaY > 0 && canDecreaseDesiredLevel()) {
                           building.desiredLevel--;
                           notifyGameStateUpdate();
                        }
                     }}
                  >
                     <div
                        className={classNames({
                           "m-icon mr5": true,
                           "text-link": canDecreaseDesiredLevel(),
                           "text-desc": !canDecreaseDesiredLevel(),
                        })}
                        onClick={() => decreaseDesiredLevel()}
                     >
                        indeterminate_check_box
                     </div>
                     <div className="text-large text-center" style={{ width: "40px" }}>
                        {building.desiredLevel}
                     </div>
                     <div className="m-icon ml5 text-link" onClick={() => increaseDesiredLevel()}>
                        add_box
                     </div>
                  </div>
               </div>
               <div className="separator"></div>
               <div className="row">
                  <div>{t(L.CancelUpgradeDesc)}</div>
                  <div className="ml10">
                     <button
                        className="nowrap"
                        onClick={() => {
                           building.status = "completed";
                           building.desiredLevel = building.level;
                           notifyGameStateUpdate();
                        }}
                     >
                        {t(L.CancelUpgrade)}
                     </button>
                  </div>
               </div>
            </fieldset>
            {hasFeature(GameFeature.BuildingProductionPriority, gs) ? (
               <fieldset>
                  <legend>
                     {t(L.ConstructionPriority)}: {getUpgradePriority(building.priority)}
                  </legend>
                  <input
                     type="range"
                     min={PRIORITY_MIN}
                     max={PRIORITY_MAX}
                     step="1"
                     value={getUpgradePriority(building.priority)}
                     onChange={(e) => {
                        building.priority = setUpgradePriority(
                           building.priority,
                           parseInt(e.target.value, 10),
                        );
                        notifyGameStateUpdate();
                     }}
                  />
                  <div className="sep15"></div>
                  <div className="text-desc text-small">{t(L.ProductionPriorityDesc)}</div>
               </fieldset>
            ) : null}
         </div>
      </div>
   );
}
