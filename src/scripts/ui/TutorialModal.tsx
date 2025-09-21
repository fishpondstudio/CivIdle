import Tippy from "@tippyjs/react";
import { useEffect, useRef } from "react";
import { getGameOptions, notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import Clippy from "../../images/Clippy.svg";
import { useGameState } from "../Global";
import { Tutorial, getCurrentTutorial } from "../logic/Tutorial";
import { hideModal } from "./GlobalModal";
import { highlightElement } from "./HighlightElement";
import { html } from "./RenderHTMLComponent";
import { t, L } from "../../../shared/utilities/i18n";

export let clearHighlightModal: (() => void) | undefined;

export function TutorialModal(): React.ReactNode {
   const gs = useGameState();
   const tutorial = getCurrentTutorial(gs);
   useEffect(() => {
      if (tutorialRef.current) {
         tutorialRef.current.scrollTo({
            top: tutorialRef.current.scrollHeight,
            behavior: "smooth",
         });
      }
      if (!tutorial) {
         return;
      }
      if (tutorial.selector) {
         clearHighlightModal = highlightElement(tutorial.selector);
      }
      return () => {
         clearHighlightModal?.();
         clearHighlightModal = undefined;
      };
   }, [tutorial]);
   const tutorialRef = useRef<HTMLDivElement>(null);
   if (!tutorial) {
      return null;
   }
   let unfinished = false;
   return (
      <div className="window" style={{ width: "800px", maxWidth: "80vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{tutorial.name()}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div ref={tutorialRef} className="window-body" style={{ overflowY: "auto", maxHeight: "75vh" }}>
            <div
               className="mb5 text-desc pointer"
               onClick={() => {
                  getGameOptions().showTutorial = false;
                  notifyGameOptionsUpdate();
                  hideModal();
               }}
            >
               {t(L.SkipTutorial)}
            </div>
            {Tutorial.map((t) => {
               const [progress, total] = t.progress(gs);
               let active = false;
               if (!unfinished && progress < total) {
                  unfinished = true;
                  active = true;
               }
               if (active) {
                  return (
                     <div key={t.name()}>
                        {t.video && (
                           <div className="inset-shallow">
                              <video
                                 src={t.video}
                                 autoPlay
                                 loop
                                 muted
                                 style={{ width: "100%", display: "block" }}
                                 onLoadedData={() => {
                                    if (tutorialRef.current) {
                                       tutorialRef.current.scrollTo({
                                          top: tutorialRef.current.scrollHeight,
                                          behavior: "smooth",
                                       });
                                    }
                                 }}
                              />
                           </div>
                        )}
                        <div className="inset-shallow white mt5 p5 row">
                           <img src={Clippy} className="mr10" style={{ height: 50 }} />
                           <div className="f1">
                              <div className="row text-strong">
                                 <div className="f1">{t.name()}</div>
                                 <div className="text-desc">
                                    {progress}/{total}
                                 </div>
                              </div>
                              <div>{html(t.desc())}</div>
                           </div>
                        </div>
                     </div>
                  );
               }
               if (unfinished) {
                  return null;
               }
               return (
                  <div key={t.name()} className="row mb5 text-desc">
                     <div className="m-icon small text-green mr5">check_circle</div>
                     <Tippy placement="left" content={html(t.desc())}>
                        <div>{t.name()}</div>
                     </Tippy>
                     <div className="f1" />
                     <div>
                        {progress}/{total}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
}
