import { Advisors } from "../../../shared/definitions/AdvisorDefinitions";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import { AdvisorModal } from "./AdvisorModal";
import { FirstTimePlayerModal } from "./FirstTimePlayerModal";
import { showModal } from "./GlobalModal";
import { MenuComponent } from "./MenuComponent";

export function TutorialPage(): React.ReactNode {
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Tutorial)}</div>
         </div>
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
               if (advisor === "Welcome1" || advisor === "Welcome2" || advisor === "Welcome3") {
                  return null;
               }
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
         </div>
      </div>
   );
}
