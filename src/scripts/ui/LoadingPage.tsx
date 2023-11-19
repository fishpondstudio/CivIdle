import { ReactNode } from "react";
import "../../css/LoadingPage.css";
import energyStar from "../../images/energy_star.png";
import { getVersion } from "../logic/Constants";

interface ErrorMessage {
   content: ReactNode;
   continue: () => void;
}

export enum LoadingPageStage {
   LoadSave,
   CheckSave,
   SteamSignIn,
   OfflineProduction,
}

export function LoadingPage({ stage }: { stage: LoadingPageStage }) {
   return (
      <div className="loading-page">
         <img className="energy-star" src={energyStar} />
         CivIdle {getVersion()}
         <br />
         Proudly Presented by Fish Pond Studio
         <br />
         <br />
         <div className="row">
            <div className="f1">Loading Asset</div>
            <div>... Done</div>
         </div>
         <div className="row">
            <div className="f1">Loading Sound</div>
            <div>... Done</div>
         </div>
         <ShowStage name="Loading Save" stage={LoadingPageStage.LoadSave} current={stage} />
         <ShowStage name="Verifying Data" stage={LoadingPageStage.CheckSave} current={stage} />
         <ShowStage name="Connecting to Steam" stage={LoadingPageStage.SteamSignIn} current={stage} />
         <ShowStage name="Calculating Offline Production" stage={LoadingPageStage.OfflineProduction} current={stage} />
      </div>
   );
}

function ShowStage({
   name,
   stage: index,
   current,
}: {
   name: string;
   stage: LoadingPageStage;
   current: LoadingPageStage;
}) {
   if (current === index) {
      return (
         <div className="row">
            <div className="f1">{name} ...</div>
         </div>
      );
   }
   if (current > index) {
      return (
         <div className="row">
            <div className="f1">{name}</div>
            <div>... Done</div>
         </div>
      );
   }
   return null;
}
