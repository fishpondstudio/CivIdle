import { Advisors, type Advisor } from "../../../shared/definitions/AdvisorDefinitions";
import { getGameOptions, notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { forEach } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { AdvisorImages } from "../logic/AdvisorImages";
import { playClick } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";
import { RenderHTML } from "./RenderHTMLComponent";

export function AdvisorModal({ advisor }: { advisor: Advisor }): React.ReactNode {
   const def = Advisors[advisor];
   return (
      <div className="window" style={{ width: 800 }}>
         <div className="title-bar">
            <div className="title-bar-text">{def.title}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body row" style={{ alignItems: "flex-start" }}>
            <div className="inset-shallow white">
               <img src={AdvisorImages[advisor]} style={{ display: "block", height: 450 - 2 }} />
            </div>
            <div className="ml15" style={{ height: 450, display: "flex", flexDirection: "column" }}>
               <div className="text-large mb5">{def.title}</div>
               <RenderHTML html={def.content} />
               <div className="f1"></div>
               <div className="row">
                  <div
                     className="text-desc text-small"
                     onClick={() => {
                        playClick();
                        hideModal();
                        forEach(Advisors, (k) => {
                           getGameOptions().disabledTutorials.add(k);
                        });
                     }}
                  >
                     {t(L.AdvisorSkpAllTutorials)}
                  </div>
                  <div className="f1"></div>
                  <button
                     className="text-strong"
                     onClick={() => {
                        playClick();
                        hideModal();
                        getGameOptions().disabledTutorials.add(advisor);
                        notifyGameOptionsUpdate();
                     }}
                  >
                     {t(L.AdvisorOkay)}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
