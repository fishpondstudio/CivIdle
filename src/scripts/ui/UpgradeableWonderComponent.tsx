import {
   getBuildingCost,
   getWonderExtraLevel,
   getWonderGreatPerson,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import { playClick } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { html } from "./RenderHTMLComponent";
import { ResourceAmountComponent } from "./ResourceAmountComponent";

export function UpgradeableWonderComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const extraLevel = getWonderExtraLevel(building.type);
   const greatPerson = getWonderGreatPerson(building.type);
   return (
      <fieldset>
         <div className="row">
            <div className="f1">{t(L.WonderUpgradeLevel)}</div>
            <div className="text-strong">{building.level}</div>
         </div>
         {greatPerson && (
            <div className="row">
               <div className="f1">
                  {html(t(L.LevelFromGreatPerson, { person: Config.GreatPerson[greatPerson].name() }))}
               </div>
               <div className="text-strong">{extraLevel}</div>
            </div>
         )}
         <div className="separator" />
         {jsxMapOf(getBuildingCost({ type: building.type, level: building.level }), (res, amount) => {
            return (
               <div key={res} className="row">
                  <div className="f1 text-strong">{Config.Material[res].name()}</div>
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
   );
}
