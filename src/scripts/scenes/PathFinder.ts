import type { IPointData } from "pixi.js";
import WorldMap from "../../../shared/definitions/WorldMap.json";
import { getGameState } from "../../../shared/logic/GameStateLogic";
import {
   DEFAULT_LAND_TILE_COST,
   RequestPathFinderGridUpdate,
   getSeaTileCost,
   wrapX,
} from "../../../shared/logic/PlayerTradeLogic";
import { RpcError, removeTrailingUndefs, rpcClient } from "../../../shared/thirdparty/TRPCClient";
import { MAP_MAX_X, MAP_MAX_Y, TileType, type IClientMapEntry } from "../../../shared/utilities/Database";
import { OnPlayerMapChanged, getPlayerMap, getUser } from "../rpc/RPCClient";
import type { PathFinderWorker } from "./PathFinderWorker";

export const GRID1: number[] = [];
export const GRID2: number[] = [];

export function buildPathfinderGrid() {
   const seaTileCost = getSeaTileCost(getGameState());
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
         const cost = tile?.tariffRate ?? DEFAULT_LAND_TILE_COST;
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

const pathFinderWorker = new Worker(new URL("./PathFinderWorker.ts", import.meta.url), { type: "module" });

let requestId = 0;
const rpcRequests: Record<number, { resolve: (v: any) => void; reject: (e: any) => void; time: number }> = {};

export const worker = rpcClient<PathFinderWorker>({
   request: (method: string, params: any[]) => {
      return new Promise((resolve, reject) => {
         const id = ++requestId;
         const request = {
            jsonrpc: "2.0",
            id: id,
            method,
            params: removeTrailingUndefs(params),
         };
         pathFinderWorker.postMessage(request);
         rpcRequests[id] = { resolve, reject, time: Date.now() };
      });
   },
});

pathFinderWorker.onmessage = (event) => {
   const response = event.data;
   if (!response || !response.id) {
      throw new Error(`Invalid RPC Response received: ${response}`);
   }
   if (!rpcRequests[response.id]) {
      throw new Error(`RPC Request ${response.id} is already handled`);
   }
   const { resolve, reject } = rpcRequests[response.id];
   delete rpcRequests[response.id];
   const { result, error } = response;
   if (error) {
      const { code, message, data } = error;
      reject(new RpcError(message, code, data));
   }
   resolve(result);
};

export async function findPathAsync(
   start: IPointData,
   end: IPointData,
   freeTiles: Set<number>,
): Promise<IPointData[]> {
   const result1 = await worker.dijkstra(GRID1, MAP_MAX_X, start, end, freeTiles);
   const cost1 = getTotalCost(result1, GRID1);
   const result2 = await worker.dijkstra(
      GRID2,
      MAP_MAX_X,
      { x: wrapX(start.x), y: start.y },
      { x: wrapX(end.x), y: end.y },
      freeTiles,
   );
   const cost2 = getTotalCost(result2, GRID2);
   if (cost2 < cost1) {
      return result2.map((p) => ({ x: wrapX(p.x), y: p.y }));
   }
   return result1;
}

// export function findPath(start: IPointData, end: IPointData, freeTiles: Set<number>): IPointData[] {
//    const result1 = dijkstra(GRID1, MAP_MAX_X, start, end, freeTiles);
//    const cost1 = getTotalCost(result1, GRID1);
//    const result2 = dijkstra(
//       GRID2,
//       MAP_MAX_X,
//       { x: wrapX(start.x), y: start.y },
//       { x: wrapX(end.x), y: end.y },
//       freeTiles,
//    );
//    const cost2 = getTotalCost(result2, GRID2);
//    if (cost2 < cost1) {
//       return result2.map((p) => ({ x: wrapX(p.x), y: p.y }));
//    }
//    return result1;
// }

export function findUserOwnedTile(userId: string): string | null {
   const map = getPlayerMap();
   for (const [key, value] of map) {
      if (value.userId === userId && value.type === TileType.Owned) {
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

export function getNeighboringPlayers(): Map<string, [string, IClientMapEntry][]> {
   const me = getUser()?.userId;
   if (!me) return new Map();
   const tiles = getOwnedOrOccupiedTiles();
   const users = new Map<string, [string, IClientMapEntry][]>();
   const playerMap = getPlayerMap();
   for (const tile of tiles) {
      const [x, y] = tile.split(",").map(Number);
      const tile1 = playerMap.get(`${x - 1},${y}`);
      if (tile1 && !users.has(tile1.userId)) {
         users.set(tile1.userId, []);
      }
      const tile2 = playerMap.get(`${x + 1},${y}`);
      if (tile2 && !users.has(tile2.userId)) {
         users.set(tile2.userId, []);
      }
      const tile3 = playerMap.get(`${x},${y - 1}`);
      if (tile3 && !users.has(tile3.userId)) {
         users.set(tile3.userId, []);
      }
      const tile4 = playerMap.get(`${x},${y + 1}`);
      if (tile4 && !users.has(tile4.userId)) {
         users.set(tile4.userId, []);
      }
   }

   users.delete(me);

   for (const [xy, entry] of playerMap) {
      const r = users.get(entry.userId);
      if (r) {
         r.push([xy, entry]);
      }
   }

   return users;
}
