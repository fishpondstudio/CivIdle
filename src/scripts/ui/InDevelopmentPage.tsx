import { L, t } from "../../../shared/utilities/i18n";
import { WorldScene } from "../scenes/WorldScene";
import { Singleton } from "../utilities/Singleton";
import { MenuComponent } from "./MenuComponent";
import { TitleBarComponent } from "./TitleBarComponent";
import { WarningComponent } from "./WarningComponent";

export function InDevelopmentPage(): React.ReactNode {
   return (
      <div className="window">
         <TitleBarComponent>{t(L.ContentInDevelopment)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body">
            <WarningComponent icon="info">{t(L.ContentInDevelopmentDesc)}</WarningComponent>

            <button
               className="w100 row jcc mt10"
               onClick={() => Singleton().sceneManager.loadScene(WorldScene)}
            >
               <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
                  arrow_back
               </div>
               <div className="f1">{t(L.BackToCity)}</div>
            </button>
         </div>
      </div>
   );
}
