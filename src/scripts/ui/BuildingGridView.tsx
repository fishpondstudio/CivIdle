import { memo } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { getBuildingCost } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getBuildingUnlockTech } from "../../../shared/logic/TechLogic";
import { numberToRoman, sizeOf } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import { LazyTippy } from "./LazyTippy";
import { ResourceAmountComponent } from "./ResourceAmountComponent";
import { BuildingSpriteComponent } from "./TextureSprites";

export function BuildingGridView({
   buildings,
   buildCount,
   onClick,
   onMouseOver,
   onMouseLeave,
}: {
   buildings: Building[];
   buildCount: number;
   onClick: (b: Building) => void;
   onMouseOver: (b: Building) => void;
   onMouseLeave: (b: Building) => void;
}): React.ReactNode {
   const sorted = [...buildings].sort((a, b) => {
      return Config.Building[a].name().localeCompare(Config.Building[b].name());
   });
   if (sorted.length === 0) {
      return <div className="inset-shallow white f1 col cc text-desc">{$t(L.NothingHere)}</div>;
   }
   return (
      <div className="inset-shallow white f1 building-grid-view">
         <VirtuosoGrid
            style={{ height: "100%" }}
            data={sorted}
            computeItemKey={(_index, building) => building}
            listClassName="building-grid-list"
            itemClassName="building-grid-item-wrap"
            itemContent={(_index, building) => (
               <BuildingGridItem
                  building={building}
                  buildCount={buildCount}
                  onClick={onClick}
                  onMouseOver={onMouseOver}
                  onMouseLeave={onMouseLeave}
               />
            )}
         />
      </div>
   );
}

function BuildingInfoComponent({ building }: { building: Building }): React.ReactNode {
   const buildCost = getBuildingCost({
      type: building,
      level: 0,
   });
   const def = Config.Building[building];
   const tier = Config.BuildingTier[building] ?? 0;
   const age = Config.BuildingTechAge[building];
   const tech = getBuildingUnlockTech(building);
   return (
      <>
         <div className="row mt5">
            <div className="m-icon small mr2">build</div>
            <div className="text-strong">{$t(L.Construction)}</div>
         </div>
         {jsxMapOf(buildCost, (res, amount) => (
            <ResourceAmountComponent
               key={res}
               resource={res}
               amount={amount}
               showLabel={true}
               showTooltip={false}
               className="mr5"
            />
         ))}
         {sizeOf(def.input) > 0 ? (
            <>
               <div className="row mt5">
                  <div className="m-icon small mr2">exit_to_app</div>
                  <div className="text-strong">{$t(L.Consume)}</div>
               </div>
               {jsxMapOf(def.input, (res, amount) => (
                  <ResourceAmountComponent
                     key={res}
                     resource={res}
                     amount={amount}
                     showLabel={true}
                     showTooltip={false}
                     className="mr5"
                  />
               ))}
            </>
         ) : null}
         {sizeOf(def.output) > 0 ? (
            <>
               <div className="row mt5">
                  <div className="m-icon small mr2">output</div>
                  <div className="text-strong">{$t(L.Produce)}</div>
               </div>
               {jsxMapOf(def.output, (res, amount) => (
                  <ResourceAmountComponent
                     key={res}
                     resource={res}
                     amount={amount}
                     showLabel={true}
                     showTooltip={false}
                     className="mr5"
                  />
               ))}
            </>
         ) : null}
         <div className="text-strong row mt5">
            <div className="m-icon small mr2">sell</div>
            {tier > 0 ? (
               <div>
                  {$t(L.BuildingTier)} {numberToRoman(tier)}
               </div>
            ) : null}
            {age ? <div className="ml10">{Config.TechAge[age].name()}</div> : null}
            {tech ? <div className="ml10">{Config.Tech[tech].name()}</div> : null}
         </div>
      </>
   );
}

function _BuildingGridItem({
   building,
   buildCount,
   onClick,
   onMouseOver,
   onMouseLeave,
}: {
   building: Building;
   buildCount: number;
   onClick: (b: Building) => void;
   onMouseOver: (b: Building) => void;
   onMouseLeave: (b: Building) => void;
}): React.ReactNode {
   return (
      <LazyTippy
         content={
            <>
               {buildCount > 0 ? (
                  <div className="text-strong">{$t(L.XBuildingsWillBeBuilt, { count: buildCount })}</div>
               ) : null}
               <BuildingInfoComponent building={building} />
            </>
         }
      >
         <div
            className="building-grid-item"
            onClick={onClick.bind(null, building)}
            onMouseOver={onMouseOver.bind(null, building)}
            onMouseLeave={onMouseLeave.bind(null, building)}
         >
            <div style={{ width: 50, height: 50 }} className="row cc">
               <BuildingSpriteComponent building={building} scale={0.5} style={{ filter: "invert(0.75)" }} />
            </div>
            <div
               className="text-strong"
               style={{
                  width: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "center",
               }}
            >
               {Config.Building[building].name()}
            </div>
         </div>
      </LazyTippy>
   );
}

const BuildingGridItem = memo(_BuildingGridItem, (prev, next) => {
   return (
      prev.building === next.building &&
      prev.buildCount === next.buildCount &&
      prev.onClick === next.onClick &&
      prev.onMouseOver === next.onMouseOver &&
      prev.onMouseLeave === next.onMouseLeave
   );
});
