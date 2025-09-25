import { Advisors } from "../../../shared/definitions/AdvisorDefinitions";
import { ANTICHEAT_FAQ_URL, BACKUP_RECOVERY_URL, STEAM_GUIDE_URL } from "../../../shared/logic/Constants";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import { openUrl } from "../utilities/Platform";
import { AdvisorModal } from "./AdvisorModal";
import { FirstTimePlayerModal } from "./FirstTimePlayerModal";
import { showModal } from "./GlobalModal";
import { MenuComponent } from "./MenuComponent";
import { TitleBarComponent } from "./TitleBarComponent";

export function ManualAndGuidePage(): React.ReactNode {
   return (
      <div className="window">
         <TitleBarComponent>{t(L.ManualAndGuide)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body">
            <div className="inset-shallow white row p10 mb10">
               <div className="f1" style={{ fontSize: 16 }}>
                  {t(L.FirstTimeTutorialWelcome)}
               </div>
               <div>
                  <div className="m-icon text-link" onClick={() => showModal(<FirstTimePlayerModal />)}>
                     open_in_new
                  </div>
               </div>
            </div>
            {jsxMapOf(Advisors, (advisor, def) => {
               return (
                  <div key={advisor} className="inset-shallow white row p10 mb10">
                     <div className="f1" style={{ fontSize: 16 }}>
                        {def.title()}
                     </div>
                     <div>
                        <div
                           className="m-icon text-link"
                           onClick={() => showModal(<AdvisorModal advisor={advisor} />)}
                        >
                           open_in_new
                        </div>
                     </div>
                  </div>
               );
            })}
            <div className="inset-shallow white row p10 mb10">
               <div className="f1" style={{ fontSize: 16 }}>
                  Official New Player Guide (English)
               </div>
               <div>
                  <div className="m-icon text-link" onClick={() => openUrl(STEAM_GUIDE_URL)}>
                     open_in_new
                  </div>
               </div>
            </div>
            <div className="inset-shallow white row p10 mb10">
               <div className="f1" style={{ fontSize: 16 }}>
                  How to Recover from Backup (English)
               </div>
               <div>
                  <div className="m-icon text-link" onClick={() => openUrl(BACKUP_RECOVERY_URL)}>
                     open_in_new
                  </div>
               </div>
            </div>
            <div className="inset-shallow white row p10 mb10">
               <div className="f1" style={{ fontSize: 16 }}>
                  FAQ on Anti-Cheat (English)
               </div>
               <div>
                  <div className="m-icon text-link" onClick={() => openUrl(ANTICHEAT_FAQ_URL)}>
                     open_in_new
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
