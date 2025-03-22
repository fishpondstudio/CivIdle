import { Config } from "../../../shared/logic/Config";
import { TRADE_TILE_BONUS } from "../../../shared/logic/Constants";
import { L, t } from "../../../shared/utilities/i18n";
import { OnTileBuildingsChanged, TileBuildings } from "../rpc/RPCClient";
import { WorldScene } from "../scenes/WorldScene";
import { refreshOnTypedEvent } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { BuildingSpriteComponent } from "./TextureSprites";

export function MapTileBonusComponent({ xy }: { xy: string }): React.ReactNode {
   refreshOnTypedEvent(OnTileBuildingsChanged);
   const building = TileBuildings.get(xy);
   if (!building) {
      return null;
   }
   return (
      <>
         <button className="w100 row jcc mb10" onClick={() => Singleton().sceneManager.loadScene(WorldScene)}>
            <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
               arrow_back
            </div>
            <div className="f1">{t(L.BackToCity)}</div>
         </button>
         <fieldset>
            <legend>{t(L.PlayerMapMapTileBonus)}</legend>
            <div className="row" style={{ height: 30 }}>
               <div className="f1 text-strong">{Config.Building[building].name()}</div>
               <div>
                  +{TRADE_TILE_BONUS} {t(L.ProductionMultiplier)}
               </div>
               <BuildingSpriteComponent
                  building={building}
                  scale={0.4}
                  style={{ filter: "invert(0.75)", margin: -5, marginLeft: 10 }}
               />
            </div>
         </fieldset>
      </>
   );
}
