import { type GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../../shared/logic/Config";
import { MAX_TRIBUNE_CARRY_OVER_LEVEL } from "../../../shared/logic/Constants";
import { getSpecialBuildings } from "../../../shared/logic/IntraTickCache";
import { forEach, isEmpty, numberToRoman } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions, useGameState } from "../Global";
import { isOnlineUser } from "../rpc/RPCClient";
import { Singleton } from "../utilities/Singleton";
import { greatPersonImage } from "../visuals/GreatPersonVisual";
import { playLevelUp } from "../visuals/Sound";
import { ChooseGreatPersonModal } from "./ChooseGreatPersonModal";
import { showModal } from "./GlobalModal";
import { ManageRebornModal } from "./ManageRebornModal";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { TableView } from "./TableView";
import { TextWithHelp } from "./TextWithHelpComponent";
import { TilePage } from "./TilePage";
import { UpgradeGreatPersonModal } from "./UpgradeGreatPersonModal";
import { WarningComponent } from "./WarningComponent";

export function GreatPersonPage(): React.ReactNode {
   const gs = useGameState();
   const options = useGameOptions();
   const greatPeople = new Set<GreatPerson>();
   forEach(gs.greatPeople, (p) => {
      greatPeople.add(p);
   });
   forEach(options.greatPeople, (p) => {
      greatPeople.add(p);
   });

   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.GreatPeople)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <button
               className="w100 row jcc"
               onClick={() => Singleton().routeTo(TilePage, { xy: getSpecialBuildings(gs).Headquarter.tile })}
            >
               <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
                  arrow_back
               </div>
               <div className="f1">{t(L.GoBack)}</div>
            </button>
            <div className="sep10"></div>
            {isOnlineUser() ? null : (
               <WarningComponent className="mb10 text-small" icon="warning">
                  <RenderHTML
                     html={t(L.TribuneGreatPeopleLevelWarning, { level: MAX_TRIBUNE_CARRY_OVER_LEVEL })}
                  />
               </WarningComponent>
            )}
            {gs.greatPeopleChoices.length > 0 ? (
               <WarningComponent className="mb10" icon="info">
                  <div
                     className="pointer"
                     onClick={() => {
                        if (gs.greatPeopleChoices.length > 0) {
                           playLevelUp();
                           showModal(<ChooseGreatPersonModal greatPeopleChoice={gs.greatPeopleChoices[0]} />);
                        }
                     }}
                  >
                     <RenderHTML html={t(L.UnclaimedGreatPersonThisRun)} />
                  </div>
               </WarningComponent>
            ) : null}
            {options.greatPeopleChoices.length > 0 ? (
               <WarningComponent className="mb10" icon="info">
                  <div
                     className="pointer"
                     onClick={() => {
                        if (options.greatPeopleChoices.length > 0) {
                           playLevelUp();
                           showModal(<ManageRebornModal />);
                        }
                     }}
                  >
                     <RenderHTML html={t(L.UnclaimedGreatPersonPermanent)} />
                  </div>
               </WarningComponent>
            ) : null}
            {isEmpty(options.greatPeople) ? null : (
               <button
                  className="row w100 mb10 text-strong"
                  onClick={() => showModal(<UpgradeGreatPersonModal />)}
               >
                  <div className="m-icon small">open_in_new</div>
                  <div className="f1 text-center">{t(L.ManagePermanentGreatPeople)}</div>
               </button>
            )}
            <TableView
               data={Array.from(greatPeople.values())}
               header={[
                  { name: "", sortable: true },
                  { name: t(L.GreatPeopleName), sortable: true },
                  { name: t(L.GreatPeopleThisRunColumn), sortable: true },
                  { name: t(L.GreatPeoplePermanentColumn), sortable: true },
               ]}
               compareFunc={(a, b, col) => {
                  switch (col) {
                     // biome-ignore lint/suspicious/noFallthroughSwitchClause:
                     case 0: {
                        const diff =
                           Config.TechAge[Config.GreatPerson[a].age].idx -
                           Config.TechAge[Config.GreatPerson[b].age].idx;
                        if (diff !== 0) return diff;
                     }
                     // biome-ignore lint/suspicious/noFallthroughSwitchClause:
                     case 2: {
                        const diff = (gs.greatPeople[a] ?? 0) - (gs.greatPeople[b] ?? 0);
                        if (diff !== 0) return diff;
                     }
                     // biome-ignore lint/suspicious/noFallthroughSwitchClause:
                     case 3: {
                        const diff =
                           (options.greatPeople[a]?.level ?? 0) - (options.greatPeople[b]?.level ?? 0);
                        if (diff !== 0) return diff;
                     }
                     default:
                        return Config.GreatPerson[a].name().localeCompare(Config.GreatPerson[b].name());
                  }
               }}
               renderRow={(gp) => {
                  const person = Config.GreatPerson[gp];
                  return (
                     <tr key={gp}>
                        <td>
                           <img
                              src={greatPersonImage(gp, Singleton().sceneManager.getContext())}
                              style={{ height: "50px", display: "block" }}
                           />
                        </td>
                        <td>
                           <div className="text-strong">{person.name()}</div>
                           <div className="text-desc text-small">{Config.TechAge[person.age].name()}</div>
                           <div></div>
                        </td>
                        <td>
                           <TextWithHelp content={person.desc(person, gs.greatPeople[gp] ?? 0)}>
                              {gs.greatPeople[gp]}
                           </TextWithHelp>
                        </td>
                        <td>
                           <TextWithHelp content={person.desc(person, options.greatPeople[gp]?.level ?? 0)}>
                              {numberToRoman(options.greatPeople[gp]?.level ?? 0)}
                           </TextWithHelp>
                        </td>
                     </tr>
                  );
               }}
            />
         </div>
      </div>
   );
}
