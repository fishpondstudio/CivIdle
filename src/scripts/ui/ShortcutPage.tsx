import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import type { IShortcutNameAndScope, Shortcut } from "../../../shared/logic/Shortcut";
import { ShortcutActions, ShortcutScopes, getShortcutKey } from "../../../shared/logic/Shortcut";
import { L, t } from "../../../shared/utilities/i18n";
import MiddleClick from "../../videos/MiddleClick.mkv?url";
import { useGameOptions } from "../Global";
import { jsxMapOf } from "../utilities/Helper";
import { playClick } from "../visuals/Sound";
import { EditShortcutModal } from "./EditShortcutModal";
import { showModal } from "./GlobalModal";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { TitleBarComponent } from "./TitleBarComponent";

export function ShortcutPage(): React.ReactNode {
   const gameOptions = useGameOptions();
   return (
      <div className="window">
         <TitleBarComponent>{t(L.Shortcut)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body">
            <fieldset>
               <legend>{t(L.MiddleClick)}</legend>
               <RenderHTML html={t(L.MiddleClickDescHTML)} />
               <div className="separator" />
               <div className="row">
                  <div className="f1">
                     <RenderHTML html={t(L.RemapMiddleClickToRightClickHTML)} />
                  </div>
                  <div
                     onClick={() => {
                        playClick();
                        gameOptions.useRightClickCopy = !gameOptions.useRightClickCopy;
                        notifyGameOptionsUpdate(gameOptions);
                     }}
                     className="ml10 pointer"
                  >
                     {gameOptions.useRightClickCopy ? (
                        <div className="m-icon text-green">toggle_on</div>
                     ) : (
                        <div className="m-icon text-grey">toggle_off</div>
                     )}
                  </div>
               </div>
               <div className="separator" />
               <div className="inset-shallow">
                  <video src={MiddleClick} autoPlay loop muted style={{ width: "100%", display: "block" }} />
               </div>
            </fieldset>
            {jsxMapOf(ShortcutScopes, (scope, name) => {
               return (
                  <fieldset key={scope}>
                     <legend>{name()}</legend>
                     {jsxMapOf(ShortcutActions as Record<Shortcut, IShortcutNameAndScope>, (key, value) => {
                        if (value.scope === scope) {
                           const shortcut = gameOptions.shortcuts[key];
                           return (
                              <div key={key} className="row mv5">
                                 <div className="f1">{value.name()}</div>
                                 <div
                                    className="text-link"
                                    onClick={() => showModal(<EditShortcutModal action={key} />)}
                                 >
                                    <code>{shortcut ? getShortcutKey(shortcut) : t(L.ShortcutNone)}</code>
                                 </div>
                              </div>
                           );
                        }
                        return null;
                     })}
                  </fieldset>
               );
            })}
         </div>
      </div>
   );
}
