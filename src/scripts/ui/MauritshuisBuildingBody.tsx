import { calculateEffects, getPaintingMultipliers } from "../../../shared/definitions/GalleryPaintings";
import { isFestival } from "../../../shared/logic/BuildingLogic";
import { GlobalMultiplierNames } from "../../../shared/logic/TickLogic";
import type { IMauritshuisBuildingData } from "../../../shared/logic/Tile";
import { $t, L } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
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
   const mauritshuis = building as IMauritshuisBuildingData;
   const effects = calculateEffects(mauritshuis.placedPaintings);
   const multipliers = getPaintingMultipliers(effects, isFestival(building.type, gameState));
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            <button
               className="w100 row mb10"
               onClick={() => showModal(<GalleryModal building={building as IMauritshuisBuildingData} />)}
            >
               <div className="m-icon small">image</div>
               <div className="f1 text-strong">{$t(L.OpenGallery)}</div>
            </button>
            <ul className="tree-view">
               {jsxMapOf(multipliers, (k, v) => {
                  return (
                     <li className="row" key={k}>
                        <div className="f1">{GlobalMultiplierNames[k]()}</div>
                        <div className="text-strong">{v}</div>
                     </li>
                  );
               })}
            </ul>
         </fieldset>
         <UpgradeableWonderComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
