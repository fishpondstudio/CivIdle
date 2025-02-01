import { getBuildingCost } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { ResourceAmountComponent } from "./ResourceAmountComponent";
import { SpaceshipIdleComponent } from "./SpaceshipIdleComponent";

export function UpgradableWonderBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
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
            {jsxMapOf(getBuildingCost({ type: building.type, level: building.level }), (res, amount) => {
               return (
                  <div key={res} className="row">
                     <div className="f1 text-strong">{Config.Resource[res].name()}</div>
                     <div>
                        <ResourceAmountComponent
                           className="text-strong"
                           resource={res}
                           amount={amount}
                           showLabel={false}
                           showTooltip={true}
                        />
                     </div>
                  </div>
               );
            })}
            <div className="separator" />
            <button
               className="jcc w100 row"
               onClick={() => {
                  playClick();
                  building.desiredLevel = building.level + 1;
                  building.status = "upgrading";
                  notifyGameStateUpdate();
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
