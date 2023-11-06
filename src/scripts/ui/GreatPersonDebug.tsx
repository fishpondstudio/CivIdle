import { Singleton } from "../utilities/Singleton";
import { greatPersonImage } from "../visuals/GreatPersonVisual";

export function GreatPersonDebug() {
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">Debug</div>
         </div>
         <div className="window-body">
            <img src={greatPersonImage("Hammurabi", Singleton().sceneManager.getContext())} style={{ width: "100%" }} />
         </div>
      </div>
   );
}
