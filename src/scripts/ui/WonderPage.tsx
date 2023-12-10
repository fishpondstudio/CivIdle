import { useGameState } from "../Global";
import { Building } from "../definitions/BuildingDefinitions";
import { PartialSet } from "../definitions/TypeDefinitions";
import { getXyBuildings } from "../logic/IntraTickCache";
import { Tick } from "../logic/TickLogic";
import { forEach, jsxMapOf } from "../utilities/Helper";
import { Singleton } from "../utilities/Singleton";
import { L, t } from "../utilities/i18n";
import { MenuComponent } from "./MenuComponent";
import { TilePage } from "./TilePage";

export function WonderPage(): React.ReactNode {
   const gs = useGameState();
   const builtWonders: PartialSet<Building> = {};
   forEach(getXyBuildings(gs), (xy, building) => {
      if (
         Tick.current.buildings[building.type].max == 1 &&
         Tick.current.buildings[building.type].construction
      ) {
         builtWonders[building.type] = true;
      }
   });
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Wonder)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <button
               className="w100"
               onClick={() => Singleton().routeTo(TilePage, { xy: Singleton().buildings.Headquarter.xy })}
            >
               <div className="row jcc">
                  <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
                     arrow_back
                  </div>
                  <div>{t(L.GoBack)}</div>
               </div>
            </button>
            <div className="sep10"></div>
            <fieldset>
               <legend>{t(L.WondersWiki)}</legend>
               <div className="table-view">
                  <table>
                     <thead>
                        <tr>
                           <th></th>
                           <th>{t(L.GreatPeopleName)}</th>
                           <th>{t(L.GreatPeopleEffect)}</th>
                        </tr>
                     </thead>
                     <tbody>
                        {jsxMapOf(Tick.current.buildings, (b, def) => {
                           if (def.max !== 1 || !def.construction) {
                              return null;
                           }
                           return (
                              <tr key={b}>
                                 <td>
                                    {builtWonders[b] ? (
                                       <div className="m-icon small text-green">check_circle</div>
                                    ) : null}
                                 </td>
                                 <td>{def.name()}</td>
                                 <td>{def.desc?.()}</td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            </fieldset>
         </div>
      </div>
   );
}
