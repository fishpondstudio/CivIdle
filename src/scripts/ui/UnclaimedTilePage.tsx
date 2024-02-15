import { L, t } from "../../../shared/utilities/i18n";
import { ClaimTileComponent } from "./ClaimTileComponent";
import { MenuComponent } from "./MenuComponent";

export function UnclaimedTilePage({ xy }: { xy: string }): React.ReactNode {
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerMapUnclaimedTile)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <ClaimTileComponent xy={xy} />
         </div>
      </div>
   );
}
