import Tippy from "@tippyjs/react";
import { IOFlags, shouldAlwaysShowBuildingOptions } from "../../../shared/logic/BuildingLogic";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getBuildingIO } from "../../../shared/logic/IntraTickCache";
import {
   STOCKPILE_CAPACITY_MAX,
   STOCKPILE_CAPACITY_MIN,
   STOCKPILE_MAX_MAX,
   STOCKPILE_MAX_MIN,
} from "../../../shared/logic/Tile";
import { isEmpty } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
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
   if (
      isEmpty(getBuildingIO(xy, "input", IOFlags.None, gameState)) &&
      !shouldAlwaysShowBuildingOptions(building)
   ) {
      return null;
   }
   return (
      <fieldset>
         <legend>
            {t(L.StockpileSettings)}: {building.stockpileCapacity}x
         </legend>
         <div className="sep5"></div>
         <Tippy content={t(L.StockpileDesc, { capacity: building.stockpileCapacity })}>
            <input
               type="range"
               min={STOCKPILE_CAPACITY_MIN}
               max={STOCKPILE_CAPACITY_MAX}
               value={building.stockpileCapacity}
               onChange={(e) => {
                  building.stockpileCapacity = Number.parseInt(e.target.value, 10);
                  notifyGameStateUpdate();
               }}
            />
         </Tippy>
         <div className="sep15"></div>
         <ApplyToAllComponent
            xy={xy}
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
         <Tippy
            content={
               building.stockpileMax <= 0
                  ? t(L.StockpileMaxUnlimitedDesc)
                  : t(L.StockpileMaxDesc, { cycle: building.stockpileMax })
            }
         >
            <input
               type="range"
               min={STOCKPILE_MAX_MIN}
               max={STOCKPILE_MAX_MAX}
               step="5"
               value={building.stockpileMax}
               onChange={(e) => {
                  building.stockpileMax = Number.parseInt(e.target.value, 10);
                  notifyGameStateUpdate();
               }}
            />
         </Tippy>
         <div className="sep15"></div>
         <ApplyToAllComponent
            xy={xy}
            getOptions={() => ({ stockpileMax: building.stockpileMax })}
            gameState={gameState}
         />
      </fieldset>
   );
}
