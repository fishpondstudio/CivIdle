import { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { useGameState } from "../Global";
import { Config } from "../logic/Constants";
import { jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { Singleton } from "../utilities/Singleton";
import { greatPersonImage } from "../visuals/GreatPersonVisual";
import { playLevelUp } from "../visuals/Sound";
import { ChooseGreatPersonModal } from "./ChooseGreatPersonModal";
import { showModal } from "./GlobalModal";
import { MenuComponent } from "./MenuComponent";
import { TilePage } from "./TilePage";
import { WarningComponent } from "./WarningComponent";

export function GreatPersonPage(): JSX.Element | null {
   const gs = useGameState();
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.GreatPeople)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <button
               className="w100"
               onClick={() =>
                  Singleton().routeTo(TilePage, { xy: Singleton().buildings.Headquarter.xy })
               }
            >
               <div className="row jcc">
                  <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
                     arrow_back
                  </div>
                  <div>{t(L.GoBack)}</div>
               </div>
            </button>
            <div className="sep10"></div>
            {gs.greatPeopleChoices.length > 0 ? (
               <div
                  className="pointer"
                  onClick={() => {
                     if (gs.greatPeopleChoices.length > 0) {
                        playLevelUp();
                        showModal(
                           <ChooseGreatPersonModal greatPeopleChoice={gs.greatPeopleChoices[0]} />,
                        );
                     }
                  }}
               >
                  <WarningComponent icon="info">{t(L.UnclaimedGreatPerson)}</WarningComponent>
                  <div className="sep10"></div>
               </div>
            ) : null}
            <fieldset>
               <legend>{t(L.GreatPeopleThisRun)}</legend>
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
                        {jsxMapOf(
                           gs.greatPeople,
                           (k, level) => {
                              const person = Config.GreatPerson[k];
                              return (
                                 <GreatPersonRow
                                    key={k}
                                    greatPerson={k}
                                    level={person.value(level)}
                                 />
                              );
                           },
                           () => (
                              <tr>
                                 <td colSpan={2} className="text-desc">
                                    {t(L.NothingHere)}
                                 </td>
                              </tr>
                           ),
                        )}
                     </tbody>
                  </table>
               </div>
            </fieldset>
            <fieldset>
               <legend>{t(L.GreatPeopleWiki)}</legend>
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
                        {jsxMapOf(
                           Config.GreatPerson,
                           (k, person) => {
                              return <GreatPersonRow key={k} greatPerson={k} level={1} />;
                           },
                           () => (
                              <tr>
                                 <td colSpan={2} className="text-desc">
                                    {t(L.NothingHere)}
                                 </td>
                              </tr>
                           ),
                        )}
                     </tbody>
                  </table>
               </div>
            </fieldset>
         </div>
      </div>
   );
}

function GreatPersonRow({ greatPerson, level }: { greatPerson: GreatPerson; level: number }) {
   const person = Config.GreatPerson[greatPerson];
   return (
      <tr>
         <td>
            <img
               src={greatPersonImage(greatPerson, Singleton().sceneManager.getContext())}
               style={{ height: "50px", display: "block" }}
            />
         </td>
         <td className="nowrap">
            <div className="text-strong">{person.name()}</div>
            <div className="text-desc text-small">{Config.TechAge[person.age].name()}</div>
         </td>
         <td>{person.desc(person, level)}</td>
      </tr>
   );
}
