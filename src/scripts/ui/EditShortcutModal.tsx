import { useEffect, useState } from "react";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import type { IShortcutConfig, Shortcut } from "../../../shared/logic/Shortcut";
import {
   ShortcutActions,
   getShortcutKey,
   isShortcutEqual,
   makeShortcut,
} from "../../../shared/logic/Shortcut";
import { forEach } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { playError } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";

export function EditShortcutModal({ action }: { action: Shortcut }): React.ReactNode {
   const options = useGameOptions();
   const [key, setKey] = useState<IShortcutConfig | undefined>(options.shortcuts[action]);
   useEffect(() => {
      document.onkeydown = (e) => {
         e.preventDefault();
         if (
            (e.ctrlKey && e.key === "Control") ||
            (e.shiftKey && e.key === "Shift") ||
            (e.altKey && e.key === "Alt") ||
            (e.metaKey && e.key === "Meta")
         ) {
            return;
         }
         setKey(makeShortcut(e));
      };
      return () => {
         document.onkeydown = null;
      };
   }, []);
   const shortcut = ShortcutActions[action];
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{shortcut.name()}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <fieldset>
               <div className="row">
                  <div className="m-icon">keyboard</div>
                  <div className="f1 text-center text-strong">
                     <code>{key ? getShortcutKey(key) : t(L.ShortcutPressShortcut)}</code>
                  </div>
               </div>
            </fieldset>
            <div className="row" style={{ justifyContent: "flex-end" }}>
               <button
                  onClick={() => {
                     delete options.shortcuts[action];
                     notifyGameOptionsUpdate(options);
                     hideModal();
                  }}
               >
                  {t(L.ShortcutClear)}
               </button>
               <div style={{ width: "10px" }}></div>
               <button
                  disabled={!key}
                  onClick={() => {
                     try {
                        if (key) {
                           forEach(options.shortcuts, (a, value) => {
                              if (!ShortcutActions[a]) {
                                 delete options.shortcuts[a];
                                 return;
                              }
                              if (
                                 ShortcutActions[a].scope === shortcut.scope &&
                                 isShortcutEqual(value, key) &&
                                 a !== action
                              ) {
                                 throw new Error(t(L.ShortcutConflict, { name: ShortcutActions[a].name() }));
                              }
                           });
                           options.shortcuts[action] = key;
                           notifyGameOptionsUpdate(options);
                           hideModal();
                        }
                     } catch (error) {
                        playError();
                        console.error(error);
                        showToast(String(error));
                     }
                  }}
               >
                  {t(L.ShortcutSave)}
               </button>
            </div>
         </div>
      </div>
   );
}
