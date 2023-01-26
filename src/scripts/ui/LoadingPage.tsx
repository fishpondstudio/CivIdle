import energyStar from "../../images/energy_star.png";
import { Singleton } from "../Global";
import { WorldScene } from "../scenes/WorldScene";
import { xyToPoint } from "../utilities/Helper";
import "./LoadingPage.css";

export function LoadingPage() {
   return (
      <div
         className="loading-page"
         onClick={() => {
            Singleton()
               .sceneManager.getCurrent(WorldScene)
               ?.selectGrid(xyToPoint(Singleton().buildings.Headquarter.xy));
         }}
      >
         <img className="energy-star" src={energyStar} />
         Build Rome in One Day
         <br />
         Powered by CivIdle engine, proudly Presented by Fish Pond Studio
         <br />
         <br />
         Loading Asset &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...
         Done
         <br />
         Loading Sound &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...
         Done
         <br />
         Connecting to Server &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;... Done
         <br />
         <br />
         Booting ...
      </div>
   );
}
