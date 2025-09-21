import Tippy from "@tippyjs/react";
import { PatchNotes } from "../../../shared/definitions/PatchNotes";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { cls } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions, useGameState } from "../Global";
import { Todo } from "../logic/Todo";
import { getCurrentTutorial } from "../logic/Tutorial";
import { getBuildNumber, getVersion } from "../logic/Version";
import { jsxMapOf } from "../utilities/Helper";
import { openUrl } from "../utilities/Platform";
import { playClick } from "../visuals/Sound";
import { showModal } from "./GlobalModal";
import { highlightElement } from "./HighlightElement";
import { html } from "./RenderHTMLComponent";
import { TutorialModal } from "./TutorialModal";
import { WarningComponent } from "./WarningComponent";

export function TopLeftPanel(): React.ReactNode {
   return (
      <div id="top-left-panel">
         <PatchNotesLinkComponent />
         <TutorialComponent />
         <TodoComponent />
      </div>
   );
}

function PatchNotesLinkComponent(): React.ReactNode {
   const options = useGameOptions();
   const patchNote = PatchNotes[0];

   const link = patchNote.link;
   if (!link) {
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
                  openUrl(link);
               }}
            >
               {html(t(L.ReadPatchNotesHTML, { version: getVersion(), build: getBuildNumber() }))}
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

let clearHighlightPanel: (() => void) | undefined;

function TutorialComponent(): React.ReactNode {
   const gs = useGameState();
   const options = useGameOptions();
   if (!options.showTutorial) {
      return null;
   }
   const tutorial = getCurrentTutorial(gs);
   if (!tutorial) {
      return null;
   }
   const [progress, total] = tutorial.progress(gs);
   return (
      <Tippy placement="right" content={html(tutorial.desc())}>
         <div
            onMouseOver={() => {
               clearHighlightPanel?.();
               if (tutorial.selector) {
                  clearHighlightPanel = highlightElement(tutorial.selector);
               }
            }}
            onMouseOut={() => {
               clearHighlightPanel?.();
               clearHighlightPanel = undefined;
            }}
            className="warning-banner pointer row g5"
            style={{ width: 300, padding: 5 }}
            onClick={() => {
               playClick();
               showModal(<TutorialModal />);
            }}
         >
            <div className="m-icon small text-orange">school</div>
            <div className="f1 text-strong">{tutorial?.name()}</div>
            {tutorial.video && <div className="m-icon small text-orange">ondemand_video</div>}
            <div>
               {progress}/{total}
            </div>
         </div>
      </Tippy>
   );
}

function TodoComponent(): React.ReactNode {
   const gs = useGameState();
   const options = useGameOptions();
   if (options.showTutorial) {
      return null;
   }
   return (
      <div className="row g5">
         {jsxMapOf(Todo, (id, t) => {
            if (!t.condition(gs, options)) {
               return null;
            }
            if (options.disabledTodos.has(id)) {
               return null;
            }
            return (
               <Tippy
                  placement="bottom"
                  key={t.icon}
                  content={
                     <>
                        <div className="text-strong">{t.name()}</div>
                        {html(t.desc(gs, options))}
                     </>
                  }
               >
                  <div
                     className={cls("todo pointer", t.className)}
                     key={t.name()}
                     onClick={() => {
                        playClick();
                        t.onClick(gs, options);
                     }}
                  >
                     <div className="m-icon">{t.icon}</div>
                  </div>
               </Tippy>
            );
         })}
      </div>
   );
}
