import { ReactNode } from "react";
import "../../css/LoadingPage.css";
import energyStar from "../../images/energy_star.png";
import { getVersion } from "../logic/Constants";

interface ErrorMessage {
   content: ReactNode;
   continue: () => void;
}

export function LoadingPage({ message }: { message?: ErrorMessage }) {
   return (
      <div
         className="loading-page"
         tabIndex={0}
         onKeyDown={(e) => {
            if (e.key === "f") {
               message?.continue();
            }
         }}
      >
         <img className="energy-star" src={energyStar} />
         CivIdle {getVersion()}
         <br />
         Proudly Presented by Fish Pond Studio
         <br />
         <br />
         Loading Asset &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...
         Done
         <br />
         Loading Sound &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...
         Done
         <br />
         Loading Data
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;... Done
         <br />
         <br />
         {message ? message.content : "Signing in via Steam ..."}
      </div>
   );
}
