import classNames from "classnames";
import type React from "react";
import { useState } from "react";
import { saveGame } from "../Global";
import { SteamClient, isSteam } from "../rpc/SteamClient";
import { playClick, playError } from "../visuals/Sound";
import { showToast } from "./GlobalModal";

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
         {isSteam() || import.meta.env.DEV ? (
            <div className="title-bar-controls app-region-none">
               <button
                  aria-label="Minimize"
                  onClick={() => {
                     playClick();
                     SteamClient.minimize();
                  }}
               ></button>
               {maximized ? (
                  <button
                     aria-label="Restore"
                     onClick={() => {
                        playClick();
                        SteamClient.restore();
                        setMaximized(false);
                     }}
                  ></button>
               ) : (
                  <button
                     aria-label="Maximize"
                     onClick={() => {
                        playClick();
                        SteamClient.maximize();
                        setMaximized(true);
                     }}
                  ></button>
               )}
               <button
                  aria-label="Close"
                  onClick={() => {
                     saveGame()
                        .then(() => SteamClient.quit())
                        .catch((e) => {
                           playError();
                           showToast(String(e));
                        });
                  }}
               ></button>
            </div>
         ) : null}
      </div>
   );
}
