import type React from "react";
import type { FunctionComponent } from "react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import type { ITileData } from "../../../shared/logic/Tile";
import type { Tile } from "../../../shared/utilities/Helper";
import { useGameState } from "../Global";
import { Singleton } from "../utilities/Singleton";
import { BritishMuseumBuildingBody } from "./BritishMuseumBuildingBody";
import { BroadwayBuildingBody } from "./BroadwayBuildingBody";
import { DefaultBuildingBody } from "./DefaultBuildingBody";
import { EastIndiaCompanyBuildingBody } from "./EastIndiaCompanyBuildingBody";
import { EuphratesRiverBuildingBody } from "./EuphratesRiverBuildingBody";
import { GrandBazaarBuildingBody } from "./GrandBazaarBuildingBody";
import { HagiaSophiaBuildingBody } from "./HagiaSophiaBuildingBody";
import { HeadquarterBuildingBody } from "./HeadquarterBuildingBody";
import { IdeologyBuildingBody } from "./IdeologyBuildingBody";
import { LoadingPage, LoadingPageStage } from "./LoadingPage";
import { MarketBuildingBody } from "./MarketBuildingBody";
import { MenuComponent } from "./MenuComponent";
import { PetraBuildingBody } from "./PetraBuildingBody";
import { PlayerTradeBuildingBody } from "./PlayerTradeBuildingBody";
import { ReligionBuildingBody } from "./ReligionBuildingBody";
import { ScienceProductionWonderBuildingBody } from "./ScienceProductionWonderBuildingBody";
import { StatisticsBuildingBody } from "./StatisticsBuildingBody";
import { TheMetBuildingBody } from "./TheMetBuildingBody";
import { ToggleWonderBuildingBody } from "./ToggleableWonderBuildingBody";
import { TowerBridgeBuildingBody } from "./TowerBridgeBuildingBody";
import { TraditionBuildingBody } from "./TraditionBuildingBody";
import { UnitedNationsBuildingBody } from "./UnitedNationsBuildingBody";
import { UpgradableWonderBuildingBody } from "./UpgradableWonderBuildingBody";
import { WarehouseBuildingBody } from "./WarehouseBuildingBody";
import { ZugspitzeBuildingBody } from "./ZugspitzeBuildingBody";

const BuildingBodyOverride: Partial<Record<Building, FunctionComponent<IBuildingComponentProps>>> = {
   Headquarter: HeadquarterBuildingBody,
   Market: MarketBuildingBody,
   Statistics: StatisticsBuildingBody,
   Caravansary: PlayerTradeBuildingBody,
   Warehouse: WarehouseBuildingBody,
   Petra: PetraBuildingBody,
   OxfordUniversity: ScienceProductionWonderBuildingBody,
   StPetersBasilica: ScienceProductionWonderBuildingBody,
   ProphetsMosque: ScienceProductionWonderBuildingBody,
   GreatDagonPagoda: ScienceProductionWonderBuildingBody,
   Pantheon: ScienceProductionWonderBuildingBody,
   Atomium: ScienceProductionWonderBuildingBody,
   GrandBazaar: GrandBazaarBuildingBody,
   UnitedNations: UnitedNationsBuildingBody,
   ChoghaZanbil: TraditionBuildingBody,
   Broadway: BroadwayBuildingBody,
   TheMet: TheMetBuildingBody,
   LuxorTemple: ReligionBuildingBody,
   BigBen: IdeologyBuildingBody,
   EuphratesRiver: EuphratesRiverBuildingBody,
   ZigguratOfUr: ToggleWonderBuildingBody,
   HagiaSophia: HagiaSophiaBuildingBody,
   InternationalSpaceStation: UpgradableWonderBuildingBody,
   MarinaBaySands: UpgradableWonderBuildingBody,
   PalmJumeirah: UpgradableWonderBuildingBody,
   AldersonDisk: UpgradableWonderBuildingBody,
   DysonSphere: UpgradableWonderBuildingBody,
   MatrioshkaBrain: UpgradableWonderBuildingBody,
   LargeHadronCollider: UpgradableWonderBuildingBody,
   CologneCathedral: UpgradableWonderBuildingBody,
   Zugspitze: ZugspitzeBuildingBody,
   SantaClausVillage: UpgradableWonderBuildingBody,
   YearOfTheSnake: UpgradableWonderBuildingBody,
   BritishMuseum: BritishMuseumBuildingBody,
   TowerBridge: TowerBridgeBuildingBody,
   EastIndiaCompany: EastIndiaCompanyBuildingBody,
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
