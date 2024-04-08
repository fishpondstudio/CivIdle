import { Tick } from "../../../shared/logic/TickLogic";
import { L, t } from "../../../shared/utilities/i18n";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";

export function BuildingValueComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   const building = tile?.building;
   if (building == null) {
      return null;
   }
   const bev = Tick.current.buildingValueByTile.get(xy) ?? 0;
   const rev = Tick.current.resourceValueByTile.get(xy) ?? 0;
   return (
      <fieldset>
         <legend>{t(L.EmpireValue)}</legend>
         <ul className="tree-view">
            <li className="row">
               <div className="f1">{t(L.TotalEmpireValue)}</div>
               <div className="text-strong">
                  <FormatNumber value={bev + rev} />
               </div>
            </li>
            <ul className="text-small">
               <li className="row">
                  <div className="f1">{t(L.EmpireValueFromBuilding)}</div>
                  <div className="text-strong">
                     <FormatNumber value={bev} />
                  </div>
               </li>
               <li className="row">
                  <div className="f1">{t(L.EmpireValueFromResources)}</div>
                  <div className="text-strong">
                     <FormatNumber value={rev} />
                  </div>
               </li>
            </ul>
         </ul>
      </fieldset>
   );
}
