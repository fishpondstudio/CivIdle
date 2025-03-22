import { Config } from "../../../shared/logic/Config";
import { L, t } from "../../../shared/utilities/i18n";
import { OnTileBuildingsChanged, TileBuildings } from "../rpc/RPCClient";
import { refreshOnTypedEvent } from "../utilities/Hook";
import { BuildingSpriteComponent } from "./TextureSprites";

export function MapTileBonusComponent({ xy }: { xy: string }): React.ReactNode {
   refreshOnTypedEvent(OnTileBuildingsChanged);
   const building = TileBuildings.get(xy);
   if (!building) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.PlayerMapMapTileBonus)}</legend>
         <div className="row" style={{ height: 30 }}>
            <div className="f1 text-strong">{Config.Building[building].name()}</div>
            <div>+5 {t(L.ProductionMultiplier)}</div>
            <BuildingSpriteComponent
               building={building}
               scale={0.4}
               style={{ filter: "invert(0.75)", margin: -5, marginLeft: 10 }}
            />
         </div>
      </fieldset>
   );
}
