import { L, t } from "../../../shared/utilities/i18n";
import { MenuComponent } from "./MenuComponent";
import { WarningComponent } from "./WarningComponent";

export function InDevelopmentPage(): React.ReactNode {
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.ContentInDevelopment)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <WarningComponent icon="info">{t(L.ContentInDevelopmentDesc)}</WarningComponent>
         </div>
      </div>
   );
}
