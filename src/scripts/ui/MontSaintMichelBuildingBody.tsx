import { getBuildingCost, getScienceFromWorkers } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { formatNumber, safeAdd } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick, playError } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";
import { SpaceshipIdleComponent } from "./SpaceshipIdleComponent";

export function MontSaintMichelBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const currentAmount = building.resources.Culture ?? 0;
   const maxAmount = getBuildingCost(building).Culture ?? 0;
   const { workersBusy, workersAfterHappiness } = getScienceFromWorkers(gameState);
   const idleWorkers = workersAfterHappiness - workersBusy;
   const culture = idleWorkers / (Config.MaterialPrice.Culture ?? 1);
   return (
      <div className="window-body">
         <SpaceshipIdleComponent gameState={gameState} type={building.type} />
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.WonderUpgradeLevel)}</div>
               <div className="text-strong">{building.level}</div>
            </div>
            <div className="separator" />
            <ProgressBarComponent progress={currentAmount / maxAmount} />
            <div className="row mt5">
               <div className="f1">{t(L.Culture)}</div>
               <div className="text-strong">
                  <FormatNumber value={currentAmount} />
                  <span className="text-green">+{formatNumber(culture)}</span>
                  {" / "}
                  <FormatNumber value={maxAmount} />
               </div>
            </div>
            <div className="separator" />
            <button
               className="jcc w100 row"
               disabled={currentAmount < maxAmount}
               onClick={() => {
                  if (currentAmount >= maxAmount) {
                     playClick();
                     safeAdd(building.resources, "Culture", -maxAmount);
                     building.level++;
                     notifyGameStateUpdate();
                  } else {
                     playError();
                  }
               }}
            >
               <div className="m-icon small">assistant_navigation</div>
               <div className="text-strong f1">{t(L.Upgrade)}</div>
            </button>
         </fieldset>
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
