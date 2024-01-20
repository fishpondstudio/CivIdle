import { clamp, isNullOrUndefined, type Tile } from "../../../shared/Helper";
import type { PartialSet, PartialTabulate } from "../../../shared/TypeDefinitions";
import type { Building } from "../definitions/BuildingDefinitions";
import type { Deposit, Resource } from "../definitions/ResourceDefinitions";
import { Config } from "./Config";
import type { GameState } from "./GameState";

export interface ITileData {
   tile: Tile;
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

export function getProductionPriority(v: number): number {
   return v & 0x0000ff;
}

export function setProductionPriority(priority: number, v: number): number {
   return (priority & 0xffff00) | (v & 0xff);
}

export function getConstructionPriority(v: number): number {
   return (v & 0x00ff00) >> 8;
}

export function setConstructionPriority(priority: number, v: number): number {
   return (priority & 0xff00ff) | ((v & 0xff) << 8);
}

export function getUpgradePriority(v: number): number {
   return (v & 0xff0000) >> 16;
}

export function setUpgradePriority(priority: number, v: number): number {
   return (priority & 0x00ffff) | ((v & 0xff) << 16);
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
   speedUp: number;
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
      priority: 0x010101,
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
         if (isNullOrUndefined(petra.speedUp)) {
            petra.speedUp = 1;
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
   building.priority = setProductionPriority(
      building.priority,
      clamp(getProductionPriority(building.priority), PRIORITY_MIN, PRIORITY_MAX),
   );
   building.priority = setConstructionPriority(
      building.priority,
      clamp(getConstructionPriority(building.priority), PRIORITY_MIN, PRIORITY_MAX),
   );
   building.priority = setUpgradePriority(
      building.priority,
      clamp(getUpgradePriority(building.priority), PRIORITY_MIN, PRIORITY_MAX),
   );
   return building;
}

export function getDepositTileCount(deposit: Deposit, gs: GameState): number {
   const city = Config.City[gs.city];
   const tiles = city.size * city.size;
   return Math.round(tiles * city.deposits[deposit]);
}
