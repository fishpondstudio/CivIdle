import { PatchNotes } from "../../../shared/definitions/PatchNotes";
import { $t, L } from "../../../shared/utilities/i18n";
import { isSteam, SteamClient } from "../rpc/SteamClient";
import { openUrl } from "../utilities/Platform";
import { MenuComponent } from "./MenuComponent";
import { TitleBarComponent } from "./TitleBarComponent";

export function PatchNotesPage(): React.ReactNode {
   return (
      <div className="window">
         <TitleBarComponent>{$t(L.PatchNotes)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body">
            {PatchNotes.map((note) => {
               return (
                  <fieldset key={note.version}>
                     <legend className="text-strong">{note.version}</legend>
                     {note.content.map((c, i) => {
                        return (
                           <div key={i} className="mv5">
                              <b>{c[0]}:</b> {c[1]}
                           </div>
                        );
                     })}
                     {note.link ? (
                        <div
                           className="text-link text-strong"
                           onClick={() => {
                              if (note.link) {
                                 openUrl(note.link);
                              }
                              if (isSteam()) {
                                 SteamClient.unlockAchievement("PatchNotesReader");
                              }
                           }}
                        >
                           {$t(L.ReadFullPatchNotes)}
                        </div>
                     ) : null}
                  </fieldset>
               );
            })}
         </div>
      </div>
   );
}
