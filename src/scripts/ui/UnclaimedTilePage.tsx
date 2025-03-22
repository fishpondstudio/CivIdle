import { L, t } from "../../../shared/utilities/i18n";
import { ClaimTileComponent } from "./ClaimTileComponent";
import { MapTileBonusComponent } from "./MapTileBonusComponent";
import { MenuComponent } from "./MenuComponent";
import { TitleBarComponent } from "./TitleBarComponent";

export function UnclaimedTilePage({ xy }: { xy: string }): React.ReactNode {
   return (
      <div className="window">
         <TitleBarComponent>{t(L.PlayerMapUnclaimedTile)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body">
            <MapTileBonusComponent xy={xy} />
            <ClaimTileComponent xy={xy} />
         </div>
      </div>
   );
}
