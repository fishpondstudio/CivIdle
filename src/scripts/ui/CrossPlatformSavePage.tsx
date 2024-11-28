import { L, t } from "../../../shared/utilities/i18n";
import "../../css/CrossPlatformSavePage.css";

export function CrossPlatformSavePage(): React.ReactNode {
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
                     <div className="text-strong f1">Steam</div>
                     <div className="m-icon small text-green">check_circle</div>
                  </div>
                  <div className="row mb10">
                     <div className="text-strong f1">Mobile</div>
                     <div>Not Connected</div>
                  </div>
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
                  <button
                     className="text-strong w100"
                     onClick={() => {
                        window.location.search = "";
                     }}
                  >
                     Check Out Cloud Save
                  </button>
               </fieldset>
               <fieldset>
                  <div className="text-desc mb10">
                     If you want to sync your progress on this device to a new device, click "Sync To A New
                     Device" and get a one-time passcode. On your new device, click "Connect To A Device" and
                     type in the one-time passcode
                  </div>
                  <div className="row">
                     <button className="f1">Sync To A New Device</button>
                     <div className="mr10"></div>
                     <button className="f1">Connect To A Device</button>
                  </div>
               </fieldset>
            </div>
         </div>
      </div>
   );
}
