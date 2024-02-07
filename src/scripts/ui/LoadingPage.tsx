import { useEffect } from "react";
import { DISCORD_URL } from "../../../shared/logic/Constants";
import { OnKeydown } from "../../../shared/logic/Shortcut";
import { formatPercent } from "../../../shared/utilities/Helper";
import "../../css/LoadingPage.css";
import energyStar from "../../images/energy_star.png";
import { getVersion } from "../logic/Version";
import { useTypedEvent } from "../utilities/Hook";
import { openUrl } from "../utilities/Platform";

export enum LoadingPageStage {
   LoadSave = 0,
   CheckSave = 1,
   SteamSignIn = 2,
   OfflineProduction = 3,
}

export function LoadingPage({
   stage,
   onload,
   progress,
}: {
   stage: LoadingPageStage;
   onload?: () => void;
   progress?: number;
}): React.ReactNode {
   useEffect(() => {
      onload?.();
   }, [onload]);

   useTypedEvent(OnKeydown, (e) => {
      if (e.key === "d") {
         openUrl(DISCORD_URL);
      }
   });

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
         <ShowStage
            name="Loading Save"
            stage={LoadingPageStage.LoadSave}
            current={stage}
            progress={progress}
         />
         <ShowStage
            name="Verifying Data"
            stage={LoadingPageStage.CheckSave}
            current={stage}
            progress={progress}
         />
         <ShowStage
            name="Connecting to Steam"
            stage={LoadingPageStage.SteamSignIn}
            current={stage}
            progress={progress}
         />
         <ShowStage
            name="Calculating Offline Production"
            stage={LoadingPageStage.OfflineProduction}
            current={stage}
            progress={progress}
         />
         <div className="report-issue">
            Press <span className="highlight">[D]</span> to Report Issues on Discord
         </div>
      </div>
   );
}

function ShowStage({
   name,
   stage,
   current,
   progress,
}: {
   name: string;
   stage: LoadingPageStage;
   current: LoadingPageStage;
   progress?: number;
}) {
   if (current === stage) {
      return (
         <div className="row">
            <div className="f1">{name} ...</div>
            {progress ? <div>{formatPercent(progress, 0)}</div> : null}
         </div>
      );
   }
   if (current > stage) {
      return (
         <div className="row">
            <div className="f1">{name}</div>
            <div>... Done</div>
         </div>
      );
   }
   return null;
}
