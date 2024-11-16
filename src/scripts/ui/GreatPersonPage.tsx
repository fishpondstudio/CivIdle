import Tippy from "@tippyjs/react";
import type { GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../../shared/logic/Config";
import { getGreatPersonThisRunLevel } from "../../../shared/logic/RebirthLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { forEach, numberToRoman } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions, useGameState } from "../Global";
import { isOnlineUser } from "../rpc/RPCClient";
import { Singleton } from "../utilities/Singleton";
import { GreatPersonImage } from "../visuals/GreatPersonVisual";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { TableView } from "./TableView";
import { TextWithHelp } from "./TextWithHelpComponent";
import { TilePage } from "./TilePage";
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
               className="w100 row jcc mb10"
               onClick={() =>
                  Singleton().routeTo(TilePage, {
                     xy: Tick.current.specialBuildings.get("Headquarter")?.tile,
                  })
               }
            >
               <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
                  arrow_back
               </div>
               <div className="f1">{t(L.GoBack)}</div>
            </button>

            {isOnlineUser() ? null : (
               <WarningComponent className="mb10" icon="info">
                  <RenderHTML className="text-small" html={t(L.TribuneUpgradeDescV4)} />
               </WarningComponent>
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
                           <GreatPersonImage greatPerson={gp} style={{ height: "50px", display: "block" }} />
                        </td>
                        <td>
                           <div className="text-strong">{person.name()}</div>
                           <div className="text-desc text-small">{Config.TechAge[person.age].name()}</div>
                           {person.city ? (
                              <div className="row text-orange text-small">
                                 <div className="m-icon small mr2">map</div>
                                 <Tippy
                                    content={t(L.OnlyAvailableWhenPlaying, {
                                       city: Config.City[person.city].name(),
                                    })}
                                 >
                                    <div>{Config.City[person.city].name()}</div>
                                 </Tippy>
                              </div>
                           ) : null}
                        </td>
                        <td className="text-center">
                           <TextWithHelp
                              content={person.desc(
                                 person,
                                 getGreatPersonThisRunLevel(gs.greatPeople[gp] ?? 0),
                              )}
                           >
                              {gs.greatPeople[gp]}
                           </TextWithHelp>
                        </td>
                        <td className="text-center">
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
