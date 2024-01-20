import { isEmpty } from "../../../shared/utilities/Helper";
import { notifyGameStateUpdate } from "../Global";
import { IOCalculation } from "../logic/BuildingLogic";
import { GameFeature, hasFeature } from "../logic/FeatureLogic";
import { getBuildingIO } from "../logic/IntraTickCache";
import {
   STOCKPILE_CAPACITY_MAX,
   STOCKPILE_CAPACITY_MIN,
   STOCKPILE_MAX_MAX,
   STOCKPILE_MAX_MIN,
} from "../logic/Tile";
import { L, t } from "../utilities/i18n";
import { ApplyToAllComponent } from "./ApplyToAllComponent";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingStockpileComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (building == null) {
      return null;
   }
   if (!hasFeature(GameFeature.BuildingStockpileMode, gameState)) {
      return null;
   }
   if (isEmpty(getBuildingIO(xy, "input", IOCalculation.None, gameState))) {
      return null;
   }
   return (
      <fieldset>
         <legend>
            {t(L.StockpileSettings)}: {building.stockpileCapacity}x
         </legend>

         <div className="sep5"></div>
         <input
            type="range"
            min={STOCKPILE_CAPACITY_MIN}
            max={STOCKPILE_CAPACITY_MAX}
            value={building.stockpileCapacity}
            onChange={(e) => {
               building.stockpileCapacity = parseInt(e.target.value, 10);
               notifyGameStateUpdate();
            }}
         />
         <div className="sep15"></div>
         <div className="text-desc text-small">
            {t(L.StockpileDesc, { capacity: building.stockpileCapacity })}
         </div>
         <div className="sep5"></div>
         <ApplyToAllComponent
            building={building}
            getOptions={() => ({ stockpileCapacity: building.stockpileCapacity })}
            gameState={gameState}
         />
         <div className="sep10"></div>
         <div className="separator has-title">
            <div>
               {t(L.StockpileMax)}:{" "}
               {building.stockpileMax <= 0 ? t(L.StockpileMaxUnlimited) : `${building.stockpileMax}x`}
            </div>
         </div>
         <div className="sep5"></div>
         <input
            type="range"
            min={STOCKPILE_MAX_MIN}
            max={STOCKPILE_MAX_MAX}
            step="5"
            value={building.stockpileMax}
            onChange={(e) => {
               building.stockpileMax = parseInt(e.target.value, 10);
               notifyGameStateUpdate();
            }}
         />
         <div className="sep15"></div>
         <div className="text-desc text-small">
            {building.stockpileMax <= 0
               ? t(L.StockpileMaxUnlimitedDesc)
               : t(L.StockpileMaxDesc, { cycle: building.stockpileMax })}
         </div>
         <div className="sep5" />
         <ApplyToAllComponent
            building={building}
            getOptions={() => ({ stockpileMax: building.stockpileMax })}
            gameState={gameState}
         />
      </fieldset>
   );
}
