import { useGameOptions } from "../Global";
import {
   getShortcutKey,
   IShortcutNameAndScope,
   Shortcut,
   ShortcutActions,
   ShortcutScopes,
} from "../logic/Shortcut";
import { jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { EditShortcutModal } from "./EditShortcutModal";
import { showModal } from "./GlobalModal";
import { MenuComponent } from "./MenuComponent";

export function ShortcutPage(): JSX.Element {
   const gameOptions = useGameOptions();
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Shortcut)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            {jsxMapOf(ShortcutScopes, (scope, name) => {
               return (
                  <fieldset key={scope}>
                     <legend>{name()}</legend>
                     {jsxMapOf(
                        ShortcutActions as Record<Shortcut, IShortcutNameAndScope>,
                        (key, value) => {
                           if (value.scope === scope) {
                              const shortcut = gameOptions.shortcuts[key];
                              return (
                                 <div key={key} className="row mv5">
                                    <div className="f1">{value.name()}</div>
                                    <div
                                       className="text-link"
                                       onClick={() => showModal(<EditShortcutModal action={key} />)}
                                    >
                                       <code>
                                          {shortcut ? getShortcutKey(shortcut) : t(L.ShortcutNone)}
                                       </code>
                                    </div>
                                 </div>
                              );
                           }
                           return null;
                        },
                     )}
                  </fieldset>
               );
            })}
         </div>
      </div>
   );
}
