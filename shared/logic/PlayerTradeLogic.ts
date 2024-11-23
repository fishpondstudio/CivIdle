import type { Resource } from "../definitions/ResourceDefinitions";
import type { Tech } from "../definitions/TechDefinitions";
import _WorldMap from "../definitions/WorldMap.json";
import {
   AccountLevel,
   MAP_MAX_X,
   TradeTileReservationDays,
   type IAddTradeRequest,
   type IClientMapEntry,
   type IUser,
} from "../utilities/Database";
import { DAY, WEEK, type IPointData } from "../utilities/Helper";
import type { PartialTabulate } from "../utilities/TypeDefinitions";
import { TypedEvent } from "../utilities/TypedEvent";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import { Tick } from "./TickLogic";

const WorldMap = _WorldMap as Record<string, boolean>;

export function getUserTradePriceRange(user: IUser | null): number {
   if (!user) {
      return 0.05;
   }
   switch (user.level) {
      case AccountLevel.Quaestor:
         return 0.1;
      case AccountLevel.Aedile:
         return 0.15;
      case AccountLevel.Praetor:
         return 0.2;
      case AccountLevel.Consul:
         return 0.25;
      default:
         return 0.05;
   }
}

export function getMaxActiveTrades(user: IUser): number {
   switch (user.level) {
      case AccountLevel.Quaestor:
         return 4;
      case AccountLevel.Aedile:
         return 6;
      case AccountLevel.Praetor:
         return 8;
      case AccountLevel.Consul:
         return 10;
      default:
         return 2;
   }
}

export function getBuyAmountRange(trade: IAddTradeRequest, range: number) {
   const amount =
      (trade.sellAmount * (Config.ResourcePrice[trade.sellResource] ?? 0)) /
      (Config.ResourcePrice[trade.buyResource] ?? 0);
   return { min: Math.round(amount * (1 - range)), max: Math.round(amount * (1 + range)), amount };
}

export function getTradePercentage(trade: IAddTradeRequest): number {
   const standardAmount =
      (trade.sellAmount * Config.ResourcePrice[trade.sellResource]!) /
      Config.ResourcePrice[trade.buyResource]!;
   return -(trade.buyAmount - standardAmount) / standardAmount;
}

export function isTileReserved(entry: Pick<IClientMapEntry, "lastSeenAt" | "level">): boolean {
   return Date.now() - entry.lastSeenAt <= TradeTileReservationDays[entry.level] * DAY;
}

export function wrapX(x: number): number {
   return x >= MAP_MAX_X / 2 ? x - MAP_MAX_X / 2 : x + MAP_MAX_X / 2;
}

export function isTradePathValid(path: IPointData[]): boolean {
   for (let i = 0; i < path.length; i++) {
      if (i === 0) {
         continue;
      }
      const current = path[i];
      const prev = path[i - 1];
      const isAdjacent =
         Math.abs(current.x - prev.x) + Math.abs(current.y - prev.y) <= 1 ||
         Math.abs(wrapX(current.x) - wrapX(prev.x)) + Math.abs(current.y - prev.y) <= 1;
      if (!isAdjacent) {
         return false;
      }
   }
   return true;
}

export const DEFAULT_LAND_TILE_COST = 0;
export const SEA_TILE_COST_1 = 0.01;
export const SEA_TILE_COST_2 = 0.005;
export const SEA_TILE_COST_3 = 0.001;

export const SEA_TILE_COSTS = {
   Capitalism: SEA_TILE_COST_3,
   Optics: SEA_TILE_COST_2,
   Geography: SEA_TILE_COST_1,
} satisfies PartialTabulate<Tech>;

export function getSeaTileCost(gs: GameState): number {
   if (gs.unlockedTech.Capitalism) {
      return SEA_TILE_COSTS.Capitalism;
   }
   if (gs.unlockedTech.Optics) {
      return SEA_TILE_COSTS.Optics;
   }
   if (gs.unlockedTech.Geography) {
      return SEA_TILE_COSTS.Geography;
   }
   return -1;
}

export function getTotalSeaTileCost(path: string[], seaTileCost: number): number {
   const seaTileCount = path.reduce((prev, xy) => {
      return prev + (WorldMap[xy] ? 0 : 1);
   }, 0);
   if (seaTileCount > 0 && seaTileCost < 0) {
      throw new Error("You cannot trade across the sea");
   }
   return seaTileCount * seaTileCost;
}

export const RequestPathFinderGridUpdate = new TypedEvent<void>();

export function getVotedBoostId(): number {
   return Math.floor(Date.now() / WEEK);
}

export function getVotingTime(): number {
   return (getVotedBoostId() + 1) * WEEK - Date.now();
}

export function hasResourceForPlayerTrade(res: Resource): boolean {
   for (const [xy, building] of Tick.current.playerTradeBuildings) {
      if ((building.resources[res] ?? 0) > 0) {
         return true;
      }
   }
   return false;
}
