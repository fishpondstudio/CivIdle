import type { FunctionComponent } from "react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import type { ITileData } from "../../../shared/logic/Tile";
import type { Tile } from "../../../shared/utilities/Helper";
import { useGameState } from "../Global";
import { Singleton } from "../utilities/Singleton";
import { DefaultBuildingBody } from "./DefaultBuildingBody";
import { GrandBazaarBuildingBody } from "./GrandBazaarBuildingBody";
import { HeadquarterBuildingBody } from "./HeadquarterBuildingBody";
import { LoadingPage, LoadingPageStage } from "./LoadingPage";
import { MarketBuildingBody } from "./MarketBuildingBody";
import { MenuComponent } from "./MenuComponent";
import { OxfordUniversityBuildingBody } from "./OxfordUniversityBuildingBody";
import { PetraBuildingBody } from "./PetraBuildingBody";
import { PlayerTradeBuildingBody } from "./PlayerTradeBuildingBody";
import { StPetersBasilicaBuildingBody } from "./StPetersBasilicaBuildingBody";
import { StatisticsBuildingBody } from "./StatisticsBuildingBody";
import { UnitedNationsBuildingBody } from "./UnitedNationsBuildingBody";
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
   GrandBazaar: GrandBazaarBuildingBody,
   UnitedNations: UnitedNationsBuildingBody,
};

export function BuildingPage(props: { tile: ITileData }): React.ReactNode {
   const { tile } = props;
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
         <Body {...props} gameState={gs} xy={tile.tile} />
      </div>
   );
}

export interface IBuildingComponentProps {
   gameState: GameState;
   xy: Tile;
}
