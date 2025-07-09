import { PatchNotes } from "../../../shared/definitions/PatchNotes";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { getBuildNumber, getVersion } from "../logic/Version";
import { openUrl } from "../utilities/Platform";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function PatchNotesPanel(): React.ReactNode {
   const options = useGameOptions();
   const patchNote = PatchNotes[0];

   if (!patchNote.link) {
      return null;
   }

   if (options.clientVersion === patchNote.version) {
      return null;
   }

   return (
      <div id="patch-notes-panel">
         <WarningComponent icon="info">
            <div className="row">
               <div
                  className="row pointer"
                  onClick={() => {
                     options.clientVersion = patchNote.version;
                     notifyGameOptionsUpdate();
                     openUrl(patchNote.link!);
                  }}
               >
                  <RenderHTML
                     html={t(L.ReadPatchNotesHTML, { version: getVersion(), build: getBuildNumber() })}
                  />
                  <div className="m-icon ml5 text-link">link</div>
               </div>
               <div
                  className="m-icon ml15 small pointer"
                  onClick={() => {
                     options.clientVersion = patchNote.version;
                     notifyGameOptionsUpdate();
                  }}
               >
                  close
               </div>
            </div>
         </WarningComponent>
      </div>
   );
}
