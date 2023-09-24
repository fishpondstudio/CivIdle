import { IPointData } from "pixi.js";
import { MAP_MAX_X, MAP_MAX_Y } from "../../../server/src/Database";
import WorldMap from "../../../server/WorldMap.json";
import { getGameOptions } from "../Global";
import { getPlayerMap, OnPlayerMapChanged } from "../rpc/RPCClient";
import { dijkstra } from "../utilities/dijkstra";

export const grid: number[][] = [];

function buildPathfinderGrid() {
   for (let y = 0; y < MAP_MAX_Y; y++) {
      const row = [];
      for (let x = 0; x < MAP_MAX_X; x++) {
         const xy = `${x},${y}`;
         if (!(WorldMap as Record<string, boolean>)[xy]) {
            row.push(-1);
            continue;
         }
         const map = getPlayerMap();
         const cost = map[xy]?.tariffRate ?? 0;
         row.push(cost);
      }
      grid.push(row);
   }

   // console.time("PathFinder.findPath");
   // for (let i = 0; i < 100; i++) {
   //    findPath({ x: 106, y: 33 }, { x: 106, y: 38 });
   // }
   // console.timeEnd("PathFinder.findPath");
}

OnPlayerMapChanged.on(buildPathfinderGrid);

export function findPath(start: IPointData, end: IPointData): IPointData[] {
   const result = dijkstra(grid, start, end);
   return result;
}

export function findUserOnMap(userId: string): string | null {
   const map = getPlayerMap();
   for (const key in map) {
      const value = map[key];
      if (value.userId == userId) {
         return key;
      }
   }
   return null;
}

export function getMyMapXy() {
   const playerMap = getPlayerMap();
   for (const xy in playerMap) {
      const entry = playerMap[xy];
      if (entry.userId == getGameOptions().id) {
         return xy;
      }
   }
   return null;
}
