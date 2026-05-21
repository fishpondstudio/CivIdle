import { Painters, Paintings, Themes, type Painting } from "../../../shared/definitions/GalleryPaintings";
import { Tick } from "../../../shared/logic/TickLogic";
import type { IMauritshuisBuildingData } from "../../../shared/logic/Tile";
import { $t, L } from "../../../shared/utilities/i18n";
import { GalleryModal } from "./GalleryModal";
import { PaintingImages } from "./GalleryPaintingImages";
import { hideModal, showModal } from "./GlobalModal";
import "./PaintingModal.css";

export function PaintingModal({ painting }: { painting: Painting }): React.ReactNode {
   const def = Paintings[painting];
   return (
      <div className="painting-modal">
         <img
            src={PaintingImages[painting]}
            alt={def.name()}
            style={{ maxHeight: "90vh", maxWidth: "500px" }}
         />
         <div className="overlay">
            <div>
               <div className="title">{def.name()}</div>
               <div>
                  <div className="mt5">
                     {Painters[def.painter]()} · {def.year} · {Themes[def.theme]()}
                     {def.masterpiece && ` · ${$t(L.Masterpiece)}`}
                  </div>
                  <div className="row g10 mt5">
                     <div
                        className="button"
                        onClick={() => {
                           const mauritshuis = Tick.current.specialBuildings.get("Mauritshuis")?.building;
                           if (mauritshuis) {
                              showModal(<GalleryModal building={mauritshuis as IMauritshuisBuildingData} />);
                           }
                        }}
                     >
                        {$t(L.OpenGallery)}
                     </div>
                     <div className="button" onClick={hideModal}>
                        {$t(L.Close)}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
