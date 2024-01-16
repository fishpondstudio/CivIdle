import { Config } from "../logic/Config";
import { jsxMapOf, sizeOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingDepositComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   if (!tile) {
      return null;
   }
   const building = tile.building;
   if (!building) {
      return null;
   }
   const deposits = Config.Building[building.type].deposit;
   if (!deposits || sizeOf(deposits) === 0) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.RequiredDeposit)}</legend>
         <ul className="tree-view">
            {jsxMapOf(deposits, (k) => {
               return (
                  <li key={k} className="row">
                     <div className="f1">{Config.Resource[k].name()}</div>
                     {tile.deposit[k] ? (
                        <div className="m-icon small text-green">check_circle</div>
                     ) : (
                        <div className="m-icon small text-red">cancel</div>
                     )}
                  </li>
               );
            })}
         </ul>
      </fieldset>
   );
}
