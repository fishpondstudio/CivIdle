import { useGameOptions, useGameState } from "../Global";
import { Config } from "../logic/Config";
import { isEmpty, jsxMapOf } from "../utilities/Helper";
import { Singleton } from "../utilities/Singleton";
import { L, t } from "../utilities/i18n";
import { greatPersonImage } from "../visuals/GreatPersonVisual";
import { playLevelUp } from "../visuals/Sound";
import { ChooseGreatPersonModal } from "./ChooseGreatPersonModal";
import { showModal } from "./GlobalModal";
import { MenuComponent } from "./MenuComponent";
import { PermanentGreatPeople } from "./PermanentGreatPeople";
import { TilePage } from "./TilePage";
import { UpgradeGreatPersonModal } from "./UpgradeGreatPersonModal";
import { WarningComponent } from "./WarningComponent";

export function GreatPersonPage(): React.ReactNode {
   const gs = useGameState();
   const options = useGameOptions();
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.GreatPeople)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <button
               className="w100"
               onClick={() => Singleton().routeTo(TilePage, { xy: Singleton().buildings.Headquarter.tile })}
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
                        showModal(<ChooseGreatPersonModal greatPeopleChoice={gs.greatPeopleChoices[0]} />);
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
                           <th className="text-center">{t(L.GreatPeopleAmount)}</th>
                        </tr>
                     </thead>
                     <tbody>
                        {jsxMapOf(
                           gs.greatPeople,
                           (k, level) => {
                              const person = Config.GreatPerson[k];
                              return (
                                 <tr key={k}>
                                    <td>
                                       <img
                                          src={greatPersonImage(k, Singleton().sceneManager.getContext())}
                                          style={{ height: "50px", display: "block" }}
                                       />
                                    </td>
                                    <td className="nowrap">
                                       <div className="text-strong">{person.name()}</div>
                                       <div className="text-desc text-small">
                                          {Config.TechAge[person.age].name()}
                                       </div>
                                    </td>
                                    <td className="text-center">
                                       <div
                                          className="text-center"
                                          aria-label={person.desc(person, level)}
                                          data-balloon-pos="left"
                                          data-balloon-text="left"
                                          data-balloon-length="medium"
                                       >
                                          {level}
                                       </div>
                                    </td>
                                 </tr>
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
               <legend>{t(L.PermanentGreatPeople)}</legend>
               {isEmpty(options.greatPeople) ? null : (
                  <>
                     <div
                        className="text-link text-strong"
                        onClick={() => showModal(<UpgradeGreatPersonModal />)}
                     >
                        {t(L.PermanentGreatPeopleShowInModal)}
                     </div>
                     <div className="sep10" />
                  </>
               )}
               <PermanentGreatPeople showEffect={false} stickyHeader={false} />
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
                              return (
                                 <tr key={k}>
                                    <td>
                                       <img
                                          src={greatPersonImage(k, Singleton().sceneManager.getContext())}
                                          style={{ height: "50px", display: "block" }}
                                       />
                                    </td>
                                    <td>
                                       <div className="text-strong">{person.name()}</div>
                                       <div className="text-desc text-small">
                                          {Config.TechAge[person.age].name()}
                                       </div>
                                    </td>
                                    <td>{person.desc(person, 1)}</td>
                                 </tr>
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
         </div>
      </div>
   );
}
