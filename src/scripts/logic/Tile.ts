import { Building } from "../definitions/BuildingDefinitions";
import { Deposit, Resource } from "../definitions/ResourceDefinitions";
import { PartialSet, PartialTabulate } from "../definitions/TypeDefinitions";
import { clamp } from "../utilities/Helper";
import { Config } from "./Constants";
import { GameState } from "./GameState";

export interface ITileData {
   xy: string;
   explored: boolean;
   deposit: PartialSet<Resource>;
   building?: IBuildingData;
}

export type BuildingStatus = "building" | "upgrading" | "paused" | "completed";

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
}

export interface IMarketBuildingData extends IBuildingData {
   type: "Market";
   sellResources: PartialSet<Resource>;
}

export interface IHaveTypeAndLevel {
   type: Building;
   level: number;
}

export const STOCKPILE_CAPACITY_MIN = 0;
export const STOCKPILE_CAPACITY_MAX = 10;

export const STOCKPILE_MAX_MIN = 0;
export const STOCKPILE_MAX_MAX = 50;

export const PRIORITY_MIN = 1;
export const PRIORITY_MAX = 10;

export function makeBuilding(data: Pick<IBuildingData, "type"> & Partial<IBuildingData>): IBuildingData {
   const building: IBuildingData = {
      level: 1,
      desiredLevel: 1,
      resources: {},
      status: "building",
      capacity: 1,
      stockpileCapacity: 1,
      stockpileMax: 5,
      priority: PRIORITY_MIN,
      ...data,
   };

   if (building.type == "Market") {
      const market = building as IMarketBuildingData;
      if (!market.sellResources) {
         market.sellResources = {};
      }
   }

   building.stockpileCapacity = clamp(building.stockpileCapacity, STOCKPILE_CAPACITY_MIN, STOCKPILE_CAPACITY_MAX);
   building.stockpileMax = clamp(building.stockpileMax, STOCKPILE_MAX_MIN, STOCKPILE_MAX_MAX);
   building.priority = clamp(building.priority, PRIORITY_MIN, PRIORITY_MAX);

   return building;
}

export function getDepositTileCount(deposit: Deposit, gs: GameState): number {
   const city = Config.City[gs.city];
   const tiles = city.size * city.size;
   return Math.round(tiles * city.deposits[deposit]);
}
