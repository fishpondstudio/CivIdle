import type { Building } from "../definitions/BuildingDefinitions";
import type { Deposit, Resource } from "../definitions/ResourceDefinitions";
import type { PartialSet, PartialTabulate } from "../definitions/TypeDefinitions";
import { clamp, isNullOrUndefined } from "../utilities/Helper";
import { Config } from "./Config";
import type { GameState } from "./GameState";

export interface ITileData {
   xy: string;
   explored: boolean;
   deposit: PartialSet<Resource>;
   building?: IBuildingData;
}

export type BuildingStatus = "building" | "upgrading" | "paused" | "completed";

export enum BuildingOptions {
   None = 0,
}

export interface IBuildingData {
   type: Building;
   level: number;
   desiredLevel: number;
   resources: PartialTabulate<Resource>;
   status: BuildingStatus;
   capacity: number;
   stockpileCapacity: number;
   stockpileMax: number;
   priority: number;
   options: BuildingOptions;
   electrification: number;
}

export enum MarketOptions {
   None = 0,
   ClearAfterUpdate = 1 << 0,
}

export interface IMarketBuildingData extends IBuildingData {
   sellResources: PartialSet<Resource>;
   availableResources: Partial<Record<Resource, Resource>>;
   marketOptions: MarketOptions;
}

export interface IResourceImport {
   perCycle: number;
   cap: number;
}

export interface IResourceImportBuildingData extends IBuildingData {
   resourceImports: Partial<Record<Resource, IResourceImport>>;
}

export enum WarehouseOptions {
   None = 0,
   Autopilot = 1 << 0,
}

export interface IWarehouseBuildingData extends IResourceImportBuildingData {
   warehouseOptions: WarehouseOptions;
}

export enum PetraOptions {
   None = 0,
   TimeWarp = 1 << 0,
}

export interface IPetraBuildingData extends IBuildingData {
   petraOptions: PetraOptions;
   offlineProductionPercent: number;
}

export type IHaveTypeAndLevel = Pick<IBuildingData, "type" | "level">;

export const STOCKPILE_CAPACITY_MIN = 0;
export const STOCKPILE_CAPACITY_MAX = 10;

export const STOCKPILE_MAX_MIN = 0;
export const STOCKPILE_MAX_MAX = 50;

export const PRIORITY_MIN = 1;
export const PRIORITY_MAX = 10;

export function makeBuilding(data: Pick<IBuildingData, "type"> & Partial<IBuildingData>): IBuildingData {
   const building: IBuildingData = {
      level: 0,
      desiredLevel: 0,
      resources: {},
      status: "building",
      capacity: 1,
      stockpileCapacity: 1,
      stockpileMax: 5,
      priority: PRIORITY_MIN,
      options: BuildingOptions.None,
      electrification: 0,
      ...data,
   };

   switch (building.type) {
      case "Market": {
         const market = building as IMarketBuildingData;
         if (!market.sellResources) {
            market.sellResources = {};
            market.availableResources = {};
         }
         if (isNullOrUndefined(market.marketOptions)) {
            market.marketOptions = MarketOptions.None;
         }
         break;
      }
      case "Caravansary": {
         const trade = building as IResourceImportBuildingData;
         if (!trade.resourceImports) {
            trade.resourceImports = {};
         }
         break;
      }
      case "Warehouse": {
         const warehouse = building as IWarehouseBuildingData;
         if (!warehouse.resourceImports) {
            warehouse.resourceImports = {};
         }
         if (isNullOrUndefined(warehouse.warehouseOptions)) {
            warehouse.warehouseOptions = WarehouseOptions.None;
         }
         break;
      }
      case "Petra": {
         const petra = building as IPetraBuildingData;
         if (isNullOrUndefined(petra.petraOptions)) {
            petra.petraOptions = PetraOptions.None;
         }
         if (isNullOrUndefined(petra.offlineProductionPercent)) {
            petra.offlineProductionPercent = 1;
         }
      }
   }

   building.stockpileCapacity = clamp(
      building.stockpileCapacity,
      STOCKPILE_CAPACITY_MIN,
      STOCKPILE_CAPACITY_MAX,
   );
   building.stockpileMax = clamp(building.stockpileMax, STOCKPILE_MAX_MIN, STOCKPILE_MAX_MAX);
   building.priority = clamp(building.priority, PRIORITY_MIN, PRIORITY_MAX);

   return building;
}

export function getDepositTileCount(deposit: Deposit, gs: GameState): number {
   const city = Config.City[gs.city];
   const tiles = city.size * city.size;
   return Math.round(tiles * city.deposits[deposit]);
}
