import { L, t } from "../utilities/i18n";
import { MenuComponent } from "./MenuComponent";

export function UnexploredTile(): JSX.Element {
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.UnexploredTile)}</div>
         </div>
         <MenuComponent />
         <div className="window-body"></div>
      </div>
   );
}
