import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { IOCalculation } from "../../../shared/logic/BuildingLogic";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getBuildingIO } from "../../../shared/logic/IntraTickCache";
import { BuildingInputModeNames, BuildingInputModeTooltips } from "../../../shared/logic/Tile";
import { isEmpty } from "../../../shared/utilities/Helper";
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
   if (isEmpty(getBuildingIO(xy, "input", IOCalculation.None, gameState))) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.ResourceTransportPreference)}</legend>
         <div className="row">
            {jsxMMapOf(BuildingInputModeNames, (mode, name) => {
               return (
                  <Tippy content={BuildingInputModeTooltips.get(mode)?.() ?? ""}>
                     <button
                        key={mode}
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
            getOptions={(s) => ({ inputMode: s.inputMode })}
            gameState={gameState}
         />
      </fieldset>
   );
}
