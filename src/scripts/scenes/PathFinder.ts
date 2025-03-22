import type { IPointData } from "pixi.js";
import WorldMap from "../../../shared/definitions/WorldMap.json";
import { getGameState } from "../../../shared/logic/GameStateLogic";
import {
   DEFAULT_LAND_TILE_COST,
   RequestPathFinderGridUpdate,
   getSeaTileCost,
   wrapX,
} from "../../../shared/logic/PlayerTradeLogic";
import { MAP_MAX_X, MAP_MAX_Y, TileType } from "../../../shared/utilities/Database";
import { OnPlayerMapChanged, getPlayerMap, getUser } from "../rpc/RPCClient";
import { dijkstra } from "../utilities/dijkstra";

export const GRID1: number[] = [];
export const GRID2: number[] = [];

export function buildPathfinderGrid() {
   const seaTileCost = getSeaTileCost(getGameState());
   const user = getUser();
   for (let y = 0; y < MAP_MAX_Y; y++) {
      for (let x = 0; x < MAP_MAX_X; x++) {
         const xy = `${x},${y}`;
         const idx1 = y * MAP_MAX_X + x;
         const idx2 = y * MAP_MAX_X + wrapX(x);
         if (!(WorldMap as Record<string, boolean>)[xy]) {
            GRID1[idx1] = seaTileCost;
            GRID2[idx2] = seaTileCost;
            continue;
         }
         const map = getPlayerMap();
         const tile = map.get(xy);
         let cost = tile?.tariffRate ?? DEFAULT_LAND_TILE_COST;
         if (tile && user && tile.userId === user.userId) {
            cost = 0;
         }
         GRID1[idx1] = cost;
         GRID2[idx2] = cost;
      }
   }
}

OnPlayerMapChanged.on(buildPathfinderGrid);
RequestPathFinderGridUpdate.on(buildPathfinderGrid);

function getTotalCost(path: IPointData[], grid: number[]): number {
   if (path.length === 0) {
      return Number.POSITIVE_INFINITY;
   }
   return path.reduce((prev, curr) => {
      const idx = curr.y * MAP_MAX_X + curr.x;
      if (grid[idx] > 0) {
         return prev + grid[idx];
      }
      return prev + 0.001;
   }, 0);
}

export function findPath(start: IPointData, end: IPointData): IPointData[] {
   const result1 = dijkstra(GRID1, MAP_MAX_X, start, end);
   const cost1 = getTotalCost(result1, GRID1);
   const result2 = dijkstra(
      GRID2,
      MAP_MAX_X,
      { x: wrapX(start.x), y: start.y },
      { x: wrapX(end.x), y: end.y },
   );
   const cost2 = getTotalCost(result2, GRID2);
   if (cost2 < cost1) {
      return result2.map((p) => ({ x: wrapX(p.x), y: p.y }));
   }
   return result1;
}

export function findUserOnMap(userId: string): string | null {
   const map = getPlayerMap();
   for (const [key, value] of map) {
      if (value?.userId === userId) {
         return key;
      }
   }
   return null;
}

export function getOwnedTradeTile(): string | null {
   const playerMap = getPlayerMap();
   const userId = getUser()?.userId;
   if (!userId) return null;
   for (const [xy, entry] of playerMap) {
      if (entry.userId === userId && entry.type === TileType.Owned) {
         return xy;
      }
   }
   return null;
}

export function getOwnedOrOccupiedTiles(): string[] {
   const playerMap = getPlayerMap();
   const userId = getUser()?.userId;
   const result: string[] = [];
   if (!userId) return result;
   for (const [xy, entry] of playerMap) {
      if (entry.userId === userId) {
         result.push(xy);
      }
   }
   return result;
}
