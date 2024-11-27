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
                  <div className="row">
                     <div className="text-strong f1">Mobile</div>
                     <div className="text-link text-strong">Connect</div>
                  </div>
               </fieldset>
               <fieldset>
                  <legend>Cross Platform Save</legend>
                  <div className="row mb5">
                     <div className="text-strong f1">Current Status</div>
                     <div>Checked In</div>
                  </div>
                  <div className="row mb5">
                     <div className="text-strong f1">Last Check In</div>
                     <div>{new Date().toLocaleString()} on Mobile</div>
                  </div>
               </fieldset>
               <div className="row mt10">
                  <div className="f1"></div>
                  <button className="text-strong">Check Out Cloud Save</button>
               </div>
            </div>
         </div>
      </div>
   );
}
