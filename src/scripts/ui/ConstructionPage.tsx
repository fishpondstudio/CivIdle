import { isWorldWonder } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import {
   PRIORITY_MAX,
   PRIORITY_MIN,
   getConstructionPriority,
   setConstructionPriority,
   type ITileData,
} from "../../../shared/logic/Tile";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { WorldScene } from "../scenes/WorldScene";
import { Singleton } from "../utilities/Singleton";
import { BuildingConstructionProgressComponent } from "./BuildingConstructionProgressComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import { BuildingInputModeComponent } from "./BuildingInputModeComponent";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function ConstructionPage({ tile }: { tile: ITileData }): React.ReactNode {
   if (tile.building == null) {
      return null;
   }
   const building = tile.building;
   const gs = useGameState();
   const definition = Config.Building[building.type];
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{definition.name()}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            {isWorldWonder(building.type) ? (
               <BuildingDescriptionComponent gameState={gs} xy={tile.tile} />
            ) : null}
            <BuildingConstructionProgressComponent xy={tile.tile} gameState={gs} />
            {hasFeature(GameFeature.BuildingProductionPriority, gs) ? (
               <fieldset>
                  <legend>
                     {t(L.ConstructionPriority)}: {getConstructionPriority(building.priority)}
                  </legend>
                  <input
                     type="range"
                     min={PRIORITY_MIN}
                     max={PRIORITY_MAX}
                     step="1"
                     value={getConstructionPriority(building.priority)}
                     onChange={(e) => {
                        building.priority = setConstructionPriority(
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
            {hasFeature(GameFeature.BuildingInputMode, gs) ? (
               <BuildingInputModeComponent gameState={gs} xy={tile.tile} />
            ) : null}
            <fieldset>
               <WarningComponent icon="warning" className="mb10 text-small">
                  <RenderHTML html={t(L.EndConstructionDescHTML)} />
               </WarningComponent>
               <button
                  className="jcc w100 row"
                  onClick={() => {
                     delete tile.building;
                     Singleton().sceneManager.getCurrent(WorldScene)?.resetTile(tile.tile);
                     notifyGameStateUpdate();
                  }}
               >
                  <div className="m-icon small">delete</div>
                  <div className="f1 text-strong">{t(L.EndConstruction)}</div>
               </button>
            </fieldset>
         </div>
      </div>
   );
}
