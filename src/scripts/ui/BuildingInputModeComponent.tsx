import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { IOCalculation } from "../../../shared/logic/BuildingLogic";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getBuildingIO } from "../../../shared/logic/IntraTickCache";
import { BuildingInputModeNames, BuildingInputModeTooltips } from "../../../shared/logic/Tile";
import { clamp, isEmpty, safeParseInt } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMMapOf } from "../utilities/Helper";
import { ApplyToAllComponent } from "./ApplyToAllComponent";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingInputModeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (building == null) {
      return null;
   }
   if (!hasFeature(GameFeature.BuildingInputMode, gameState)) {
      return null;
   }
   if (
      building.status === "completed" &&
      isEmpty(getBuildingIO(xy, "input", IOCalculation.None, gameState)) &&
      !("resourceImports" in building)
   ) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.ResourceTransportPreference)}</legend>
         <div className="row">
            {jsxMMapOf(BuildingInputModeNames, (mode, name) => {
               return (
                  <Tippy key={mode} content={BuildingInputModeTooltips.get(mode)?.() ?? ""}>
                     <button
                        onClick={() => {
                           building.inputMode = mode;
                           notifyGameStateUpdate();
                        }}
                        className={classNames({
                           f1: true,
                           active: building.inputMode === mode,
                           "text-desc": building.inputMode !== mode,
                        })}
                     >
                        {name()}
                     </button>
                  </Tippy>
               );
            })}
         </div>
         <div className="sep10"></div>
         <ApplyToAllComponent
            building={building}
            getOptions={(s) => ({ inputMode: building.inputMode })}
            gameState={gameState}
         />
         <div className="sep10"></div>
         <div className="separator has-title">
            <div>{t(L.MaxTransportDistance)}</div>
         </div>
         <div className="sep5"></div>
         <div className="row">
            <div
               className="row"
               onClick={() => {
                  if (building.maxInputDistance === Infinity) {
                     building.maxInputDistance = 10;
                  } else {
                     building.maxInputDistance = Infinity;
                  }
                  notifyGameStateUpdate();
               }}
            >
               <div
                  className={classNames({
                     "m-icon": true,
                     "text-desc": building.maxInputDistance !== Infinity,
                  })}
               >
                  {building.maxInputDistance === Infinity ? "check_box" : "check_box_outline_blank"}
               </div>
               <div
                  className={classNames({
                     "text-strong": true,
                     "text-desc": building.maxInputDistance !== Infinity,
                  })}
               >
                  {t(L.DistanceInfinity)}
               </div>
            </div>

            <div className="f1"></div>
            <div>{t(L.DistanceInTiles)}</div>
            <input
               value={building.maxInputDistance}
               onChange={(e) => {
                  building.maxInputDistance = clamp(safeParseInt(e.target.value), 1, Infinity);
                  notifyGameStateUpdate();
               }}
               onClick={(e) => (e.target as HTMLInputElement)?.select()}
               disabled={building.maxInputDistance === Infinity}
               type="text"
               className="text-right ml10"
               style={{ width: "60px" }}
            />
         </div>
         <div className="sep10"></div>
         <ApplyToAllComponent
            building={building}
            getOptions={(s) => ({ maxInputDistance: building.maxInputDistance })}
            gameState={gameState}
         />
      </fieldset>
   );
}
