import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { NoStorage, type Material } from "../../../shared/definitions/MaterialDefinitions";
import { Config } from "../../../shared/logic/Config";
import { notifyGameOptionsUpdate, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { tileToPoint, type Tile } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions, useGameState } from "../Global";
import { WorldScene } from "../scenes/WorldScene";
import { jsxMapOf } from "../utilities/Helper";
import { Singleton } from "../utilities/Singleton";
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
            <div
               className="m-icon small text-link mr2"
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
               search
            </div>
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

function ResourceColor({ resource, buildingColor }: { resource: Material; buildingColor: string }) {
   const r = Config.Material[resource];
   const gameOptions = useGameOptions();
   const gs = useGameState();
   if (!NoStorage[resource]) {
      return (
         <div className="row mv5">
            <div
               className="m-icon small text-link mr2"
               onClick={() => {
                  const result: Tile[] = [];
                  gs.tiles.forEach((tile, xy) => {
                     if (tile.explored && resource in tile.deposit) {
                        result.push(xy);
                     }
                  });
                  Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, result);
               }}
            >
               search
            </div>
            <div className="f1">{r.name()}</div>
            <Tippy content={t(L.BuildingColorMatchBuilding)}>
               <div
                  className="small mr10 ml10 m-icon text-link"
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
