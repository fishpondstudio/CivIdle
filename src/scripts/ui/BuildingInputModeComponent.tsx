import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { IOFlags, shouldAlwaysShowBuildingOptions } from "../../../shared/logic/BuildingLogic";
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
      isEmpty(getBuildingIO(xy, "input", IOFlags.None, gameState)) &&
      !shouldAlwaysShowBuildingOptions(building)
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
            xy={xy}
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
                  if (building.maxInputDistance === Number.POSITIVE_INFINITY) {
                     building.maxInputDistance = 10;
                  } else {
                     building.maxInputDistance = Number.POSITIVE_INFINITY;
                  }
                  notifyGameStateUpdate();
               }}
            >
               <div
                  className={classNames({
                     "m-icon small": true,
                     "text-desc": building.maxInputDistance !== Number.POSITIVE_INFINITY,
                  })}
               >
                  {building.maxInputDistance === Number.POSITIVE_INFINITY
                     ? "check_box"
                     : "check_box_outline_blank"}
               </div>
               <div
                  className={classNames({
                     "text-desc": building.maxInputDistance !== Number.POSITIVE_INFINITY,
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
                  building.maxInputDistance = clamp(
                     safeParseInt(e.target.value),
                     1,
                     Number.POSITIVE_INFINITY,
                  );
                  notifyGameStateUpdate();
               }}
               onClick={(e) => (e.target as HTMLInputElement)?.select()}
               disabled={building.maxInputDistance === Number.POSITIVE_INFINITY}
               type="text"
               className="text-right ml10"
               style={{ width: "60px" }}
            />
         </div>
         <div className="sep10"></div>
         <ApplyToAllComponent
            xy={xy}
            getOptions={(s) => ({ maxInputDistance: building.maxInputDistance })}
            gameState={gameState}
         />
      </fieldset>
   );
}
