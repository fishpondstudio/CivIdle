import { useCallback, useEffect, useState } from "react";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import type { IShortcutConfig, Shortcut } from "../../../shared/logic/Shortcut";
import {
   ShortcutActions,
   getShortcutKey,
   isShortcutEqual,
   makeShortcut,
} from "../../../shared/logic/Shortcut";
import { forEach } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { playError } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";

export function EditShortcutModal({ action }: { action: Shortcut }): React.ReactNode {
   const options = useGameOptions();
   const [key, setKey] = useState<IShortcutConfig | undefined>(options.shortcuts[action]);
   const shortcut = ShortcutActions[action];
   const saveShortcutConfig = options.shortcuts.ShortcutPageSave;
   const clearShortcutConfig = options.shortcuts.ShortcutPageClear;
   const assignShortcutConfig = options.shortcuts.ShortcutPageAssign;
   const [isAssigning, setIsAssigning] = useState(false);

   const clearShortcut = useCallback(() => {
      delete options.shortcuts[action];
      notifyGameOptionsUpdate(options);
      hideModal();
   }, [action, options]);

   const saveShortcut = useCallback(() => {
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
                  throw new Error($t(L.ShortcutConflict, { name: ShortcutActions[a].name() }));
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
   }, [action, key, options, shortcut.scope]);

   useEffect(() => {
      document.onkeydown = (e) => {
         if (isAssigning) {
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
            setIsAssigning(false);
            return;
         }
         const pressedShortcut = makeShortcut(e);
         if (assignShortcutConfig && isShortcutEqual(assignShortcutConfig, pressedShortcut)) {
            e.preventDefault();
            setIsAssigning(true);
            return;
         }
         if (saveShortcutConfig && isShortcutEqual(saveShortcutConfig, pressedShortcut)) {
            e.preventDefault();
            saveShortcut();
            return;
         }
         if (clearShortcutConfig && isShortcutEqual(clearShortcutConfig, pressedShortcut)) {
            e.preventDefault();
            clearShortcut();
            return;
         }
      };
      return () => {
         document.onkeydown = null;
      };
   }, [assignShortcutConfig, clearShortcut, clearShortcutConfig, isAssigning, saveShortcut, saveShortcutConfig]);
   return (
      <div className="window modal-window">
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
                     <code>{isAssigning ? $t(L.ShortcutPressShortcut) : key ? getShortcutKey(key) : $t(L.ShortcutNone)}</code>
                  </div>
               </div>
            </fieldset>
            <div className="row modal-actions" style={{ justifyContent: "flex-end" }}>
               <button onClick={() => setIsAssigning(true)} disabled={isAssigning}>
                  {$t(L.ShortcutAssign)}
               </button>
               <button onClick={clearShortcut}>{$t(L.ShortcutClear)}</button>
               <button disabled={!key || isAssigning} onClick={saveShortcut}>
                  {$t(L.ShortcutSave)}
               </button>
            </div>
         </div>
      </div>
   );
}
