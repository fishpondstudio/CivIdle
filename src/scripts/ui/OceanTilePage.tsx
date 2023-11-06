import GreatWave from "../../images/GreatWave.jpg";
import { L, t } from "../utilities/i18n";
import { MenuComponent } from "./MenuComponent";

export function OceanTilePage({ xy }: { xy: string }) {
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerMapUnclaimedTile)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <div className="inset-shallow">
               <img src={GreatWave} className="w100" style={{ display: "block" }} />
            </div>
         </div>
      </div>
   );
}
