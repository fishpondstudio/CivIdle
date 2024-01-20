import type { FunctionComponent } from "react";
import type { Tile } from "../../../shared/utilities/Helper";
import { useGameState } from "../Global";
import type { Building } from "../definitions/BuildingDefinitions";
import { Config } from "../logic/Config";
import type { GameState } from "../logic/GameState";
import type { ITileData } from "../logic/Tile";
import { Singleton } from "../utilities/Singleton";
import { DefaultBuildingBody } from "./DefaultBuildingBody";
import { HeadquarterBuildingBody } from "./HeadquarterBuildingBody";
import { LoadingPage, LoadingPageStage } from "./LoadingPage";
import { MarketBuildingBody } from "./MarketBuildingBody";
import { MenuComponent } from "./MenuComponent";
import { OxfordUniversityBuildingBody } from "./OxfordUniversityBuildingBody";
import { PetraBuildingBody } from "./PetraBuildingBody";
import { PlayerTradeBuildingBody } from "./PlayerTradeBuildingBody";
import { StPetersBasilicaBuildingBody } from "./StPetersBasilicaBuildingBody";
import { StatisticsBuildingBody } from "./StatisticsBuildingBody";
import { WarehouseBuildingBody } from "./WarehouseBuildingBody";

const BuildingBodyOverride: Partial<Record<Building, FunctionComponent<IBuildingComponentProps>>> = {
   Headquarter: HeadquarterBuildingBody,
   Market: MarketBuildingBody,
   Statistics: StatisticsBuildingBody,
   Caravansary: PlayerTradeBuildingBody,
   Warehouse: WarehouseBuildingBody,
   Petra: PetraBuildingBody,
   OxfordUniversity: OxfordUniversityBuildingBody,
   StPetersBasilica: StPetersBasilicaBuildingBody,
};

export function BuildingPage({ tile }: { tile: ITileData }): React.ReactNode {
   if (tile.building == null) {
      Singleton().routeTo(LoadingPage, { stage: LoadingPageStage.LoadSave });
      return null;
   }
   const building = tile.building;
   const gs = useGameState();
   const definition = Config.Building[building.type];
   const Body = BuildingBodyOverride[building.type] ?? DefaultBuildingBody;
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{definition.name()}</div>
         </div>
         <MenuComponent />
         <Body gameState={gs} xy={tile.tile} />
      </div>
   );
}

export interface IBuildingComponentProps {
   gameState: GameState;
   xy: Tile;
}
