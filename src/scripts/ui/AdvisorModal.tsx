import happiness from "../../images/Tutorial/Happiness.png";
import { hideModal } from "./GlobalModal";

export function AdvisorModal(): React.ReactNode {
   return (
      <div className="window" style={{ width: 600 }}>
         <div className="title-bar">
            <div className="title-bar-text">Keep Your People Happy</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body row" style={{ alignItems: "flex-start" }}>
            <div className="inset-shallow white">
               <img src={happiness} style={{ display: "block", height: 300 - 2 }} />
            </div>
            <div className="ml15" style={{ height: 300, display: "flex", flexDirection: "column" }}>
               <div className="text-large mb5">Keep Your People Happy</div>
               <div>
                  Your empire's workers will stop working if your happiness is too low.
                  <b> Each new building costs 1 happiness</b> therefore you should avoid over expansion. You
                  can increase your happiness by unlocking new technologies, build wonders and acquire great
                  people. You can see a detail breakdown in your <b>home building's Happiness section</b>.
               </div>
               <div className="f1"></div>
               <div className="row">
                  <div className="text-desc text-small">Skip All Tutorials</div>
                  <div className="f1"></div>
                  <button className="text-strong">Got it, Thanks!</button>
               </div>
            </div>
         </div>
      </div>
   );
}
