import { useGameState } from "../Global";
import { Config } from "../logic/Constants";
import { jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { MenuComponent } from "./MenuComponent";

export function GreatPersonPage(): JSX.Element | null {
   const gs = useGameState();
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.GreatPeople)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <fieldset>
               <legend>{t(L.GreatPeopleThisRun)}</legend>
               <div className="table-view">
                  <table>
                     <thead>
                        <tr>
                           <th>{t(L.GreatPeopleName)}</th>
                           <th>{t(L.GreatPeopleEffect)}</th>
                        </tr>
                     </thead>
                     <tbody>
                        {jsxMapOf(gs.greatPeople, (k, level) => {
                           const person = Config.GreatPerson[k];
                           return (
                              <tr key={k}>
                                 <td>{person.name()}</td>
                                 <td>{t(person.desc(), { value: person.value(level) })}</td>
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
