import classNames from "classnames";
import type React from "react";
import { useState } from "react";
import { SteamClient, isSteam } from "../rpc/SteamClient";

export function TitleBarComponent({ children }: React.PropsWithChildren): React.ReactNode {
   const [maximized, setMaximized] = useState(false);
   if (isSteam()) {
      SteamClient.isMaximized().then((maximized) => {
         setMaximized(maximized);
      });
   }
   return (
      <div className={classNames({ "title-bar": true, "app-region-drag": isSteam() })}>
         <div className="title-bar-text">{children}</div>
      </div>
   );
}
