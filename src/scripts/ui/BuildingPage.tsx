import { FunctionComponent } from "react";
import { useGameState } from "../Global";
import { Building } from "../definitions/BuildingDefinitions";
import { GameState } from "../logic/GameState";
import { Tick } from "../logic/TickLogic";
import { ITileData } from "../logic/Tile";
import { Singleton } from "../utilities/Singleton";
import { DefaultBuildingBody } from "./DefaultBuildingBody";
import { HeadquarterBuildingBody } from "./HeadquarterBuildingBody";
import { LoadingPage, LoadingPageStage } from "./LoadingPage";
import { MarketBuildingBody } from "./MarketBuildingBody";
import { MenuComponent } from "./MenuComponent";
import { PetraBuildingBody } from "./PetraBuildingBody";
import { PlayerTradeBuildingBody } from "./PlayerTradeBuildingBody";
import { StatisticsBuildingBody } from "./StatisticsBuildingBody";
import { WarehouseBuildingBody } from "./WarehouseBuildingBody";

const BuildingBodyOverride: Partial<Record<Building, FunctionComponent<IBuildingComponentProps>>> =
   {
      Headquarter: HeadquarterBuildingBody,
      Market: MarketBuildingBody,
      Statistics: StatisticsBuildingBody,
      Caravansary: PlayerTradeBuildingBody,
      Warehouse: WarehouseBuildingBody,
      Petra: PetraBuildingBody,
   };

export function BuildingPage({ tile }: { tile: ITileData }): React.ReactNode {
   if (tile.building == null) {
      Singleton().routeTo(LoadingPage, { stage: LoadingPageStage.LoadSave });
      return null;
   }
   const building = tile.building;
   const gs = useGameState();
   const definition = Tick.current.buildings[building.type];
   const Body = BuildingBodyOverride[building.type] ?? DefaultBuildingBody;
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{definition.name()}</div>
         </div>
         <MenuComponent />
         <Body gameState={gs} xy={tile.xy} />
      </div>
   );
}

export interface IBuildingComponentProps {
   gameState: GameState;
   xy: string;
}
