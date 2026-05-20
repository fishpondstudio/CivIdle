import type { IMauritshuisBuildingData } from "../../../shared/logic/Tile";
import { $t, L } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { GalleryModal } from "./GalleryModal";
import { showModal } from "./GlobalModal";
import { UpgradeableWonderComponent } from "./UpgradeableWonderComponent";

export function MauritshuisBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <button
            className="w100 row mb10"
            onClick={() => showModal(<GalleryModal building={building as IMauritshuisBuildingData} />)}
         >
            <div className="m-icon small">image</div>
            <div className="f1 text-strong">{$t(L.OpenGallery)}</div>
         </button>
         <UpgradeableWonderComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
