import { L, t } from "../../../shared/utilities/i18n";
import GreatWave from "../../images/GreatWave.jpg";
import { MenuComponent } from "./MenuComponent";
import { TitleBarComponent } from "./TitleBarComponent";

export function OceanTilePage({ xy }: { xy: string }): React.ReactNode {
   return (
      <div className="window">
         <TitleBarComponent>{t(L.PlayerMapUnclaimedTile)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body">
            <div className="inset-shallow">
               <img src={GreatWave} className="w100" style={{ display: "block" }} />
            </div>
         </div>
      </div>
   );
}
