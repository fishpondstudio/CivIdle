import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import { notifyGameOptionsUpdate, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { jsxMapOf } from "../utilities/Helper";
import type { IBuildingComponentProps } from "./BuildingPage";
import { ColorPicker } from "./ColorPicker";

export function BuildingColorComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   const building = tile?.building;
   if (!building) {
      return null;
   }
   const gameOptions = useGameOptions();
   const def = Config.Building[building.type];
   const buildingColor = gameOptions.buildingColors[building.type] ?? "#ffffff";
   return (
      <fieldset>
         <legend>{t(L.BuildingColor)}</legend>
         <div className="row mv5">
            <div className="f1">{def.name()}</div>
            <div>
               <ColorPicker
                  value={buildingColor}
                  onChange={(v) => {
                     gameOptions.buildingColors[building.type] = v;
                     notifyGameOptionsUpdate();
                  }}
                  timeout={250}
               />
            </div>
         </div>
         {jsxMapOf(def.input, (res) => {
            return <ResourceColor key={res} resource={res} buildingColor={buildingColor} />;
         })}
         {jsxMapOf(def.output, (res) => {
            return <ResourceColor key={res} resource={res} buildingColor={buildingColor} />;
         })}
         <button
            className="jcc w100 mt10 row"
            onClick={() => {
               if (gameState.favoriteTiles.has(xy)) {
                  gameState.favoriteTiles.delete(xy);
               } else {
                  gameState.favoriteTiles.add(xy);
               }
               notifyGameStateUpdate();
            }}
         >
            <div
               className={classNames({
                  "m-icon small": true,
                  "text-orange fill": gameState.favoriteTiles.has(xy),
               })}
            >
               kid_star
            </div>
            <div className="f1 text-strong">
               {gameState.favoriteTiles.has(xy) ? t(L.FavoriteBuildingRemove) : t(L.FavoriteBuildingAdd)}
            </div>
         </button>
      </fieldset>
   );
}

function ResourceColor({ resource, buildingColor }: { resource: Resource; buildingColor: string }) {
   const r = Config.Resource[resource];
   const gameOptions = useGameOptions();
   if (!NoStorage[resource]) {
      return (
         <div className="row mv5">
            <div className="f1">{r.name()}</div>
            <Tippy content={t(L.BuildingColorMatchBuilding)}>
               <div
                  className="small pointer mr10 ml10 m-icon"
                  onClick={() => {
                     gameOptions.resourceColors[resource] = buildingColor;
                     notifyGameOptionsUpdate(gameOptions);
                  }}
               >
                  colorize
               </div>
            </Tippy>
            <div>
               <ColorPicker
                  value={gameOptions.resourceColors[resource] ?? "#ffffff"}
                  onChange={(v) => {
                     gameOptions.resourceColors[resource] = v;
                     notifyGameOptionsUpdate();
                  }}
                  timeout={250}
               />
            </div>
         </div>
      );
   }
   return null;
}
