import { PatchNotes } from "../../../shared/definitions/PatchNotes";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { getBuildNumber, getVersion } from "../logic/Version";
import { openUrl } from "../utilities/Platform";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function TopLeftPanel(): React.ReactNode {
   return (
      <div id="top-left-panel">
         <PatchNotesLinkComponent />
         <div className="warning-banner row g5" style={{ width: 250 }}>
            <div className="m-icon small text-orange">school</div>
            <div className="f1 text-strong">Build 10 Huts</div>
            <div>1/10</div>
         </div>
      </div>
   );
}

function PatchNotesLinkComponent(): React.ReactNode {
   const options = useGameOptions();
   const patchNote = PatchNotes[0];

   if (!patchNote.link) {
      return null;
   }

   if (options.buildNumber === getBuildNumber()) {
      return null;
   }
   return (
      <WarningComponent icon="info">
         <div className="row">
            <div
               className="row pointer"
               onClick={() => {
                  options.buildNumber = getBuildNumber();
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
                  options.buildNumber = getBuildNumber();
                  notifyGameOptionsUpdate();
               }}
            >
               close
            </div>
         </div>
      </WarningComponent>
   );
}
