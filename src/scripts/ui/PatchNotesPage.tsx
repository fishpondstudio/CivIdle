import { PatchNotes } from "../definitions/PatchNotes";
import { L, t } from "../utilities/i18n";
import { Singleton } from "../utilities/Singleton";
import { MenuComponent } from "./MenuComponent";
import { TilePage } from "./TilePage";

export function PatchNotesPage(): JSX.Element {
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
                  <div>{t(L.BackToHeadquarter)}</div>
               </div>
            </button>
            <div className="sep10"></div>
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
                  </fieldset>
               );
            })}
         </div>
      </div>
   );
}
