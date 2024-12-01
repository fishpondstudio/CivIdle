import { useEffect, useState } from "react";
import { Platform, type ICrossPlatformResult } from "../../../shared/utilities/Database";
import { L, t } from "../../../shared/utilities/i18n";
import "../../css/CrossPlatformSavePage.css";
import { client, useUser } from "../rpc/RPCClient";
import { playSuccess } from "../visuals/Sound";
import { showToast } from "./GlobalModal";
import { RenderHTML } from "./RenderHTMLComponent";

export function CrossPlatformSavePage(): React.ReactNode {
   const [result, setResult] = useState<ICrossPlatformResult>();
   const user = useUser();

   useEffect(() => {
      client.getCrossPlatformSave().then((result) => setResult(result));
   }, []);

   return (
      <div className="cloud-save-page">
         <div className="window">
            <div className="title-bar">
               <div className="title-bar-text">{t(L.CrossPlatformSave)}</div>
            </div>
            <div className="window-body">
               <fieldset>
                  <legend>{t(L.CrossPlatformAccount)}</legend>
                  <div className="row mb5">
                     <div className="f1">{t(L.CurrentPlatform)}</div>
                     <div className="text-strong">{getPlatformName(result?.currentPlatform)}</div>
                  </div>
                  <div className="row">
                     <div className="f1">{t(L.OtherPlatform)}</div>
                     <div className="text-strong">{getPlatformName(result?.otherPlatform)}</div>
                  </div>
                  {result?.connected ? null : (
                     <>
                        <div className="separator"></div>
                        <div className="row mb5">
                           <div className="f1">{t(L.PlayerHandle)}</div>
                           <div className="text-strong">{user?.handle}</div>
                        </div>
                        <RenderHTML
                           html={t(L.PlatformSyncInstructionHTML)}
                           className="mb10 text-desc text-small"
                        />
                        <div className="row">
                           <button
                              className="f1"
                              onClick={async () => {
                                 const code = await client.requestPassCode();
                                 playSuccess();
                                 showToast(t(L.PasscodeToastHTML, { code }), 10_000);
                              }}
                           >
                              {t(L.SyncToANewDevice)}
                           </button>
                           <div className="mr10"></div>
                           <button className="f1">{t(L.ConnectToADevice)}</button>
                        </div>
                     </>
                  )}
               </fieldset>
               <fieldset>
                  <legend>Cross Platform Save</legend>
                  <div className="row mb5">
                     <div className="text-strong f1">Current Status</div>
                     <div>Checked In</div>
                  </div>
                  <div className="row mb10">
                     <div className="text-strong f1">Last Check In</div>
                     <div>{new Date().toLocaleString()} on Mobile</div>
                  </div>
                  <div className="row">
                     <button
                        className="text-strong w100"
                        onClick={() => {
                           window.location.search = "";
                        }}
                     >
                        Check Out Cloud Save
                     </button>
                     <div className="mr10"></div>
                     <button
                        className="w100"
                        onClick={() => {
                           window.location.search = "";
                        }}
                     >
                        Restart Game
                     </button>
                  </div>
               </fieldset>
            </div>
         </div>
      </div>
   );
}

function getPlatformName(platform: Platform | null | undefined): string {
   switch (platform) {
      case Platform.Android:
         return t(L.PlatformAndroid);
      case Platform.iOS:
         return t(L.PlatformiOS);
      case Platform.Steam:
         return t(L.PlatformSteam);
      default:
         return "";
   }
}
