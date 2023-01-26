import { Tick } from "../logic/TickLogic";
import { jsxMapOf, sizeOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";

export function BuildingDepositComponent({ gameState, xy }: IBuildingComponentProps) {
   const tile = gameState.tiles[xy];
   if (!tile) {
      return null;
   }
   const building = tile.building;
   if (!building) {
      return null;
   }
   const deposits = Tick.current.buildings[building.type].deposit;
   if (!deposits || sizeOf(deposits) === 0) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.RequiredDeposit)}</legend>
         {jsxMapOf(deposits, (k) => {
            return (
               <div key={k} className="row mv5">
                  <div className="f1">{Tick.current.resources[k].name()}</div>
                  {tile.deposit[k] ? (
                     <div className="m-icon small text-green">check_circle</div>
                  ) : (
                     <div className="m-icon small text-red">cancel</div>
                  )}
               </div>
            );
         })}
      </fieldset>
   );
}
