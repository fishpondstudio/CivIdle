import { L, t } from "../../../shared/utilities/i18n";
import Discovery from "../../images/Discovery.jpg";
import { MenuComponent } from "./MenuComponent";

export function UnexploredTile(): React.ReactNode {
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.UnexploredTile)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <div className="inset-shallow">
               <img src={Discovery} className="w100" style={{ display: "block" }} />
            </div>
         </div>
      </div>
   );
}
