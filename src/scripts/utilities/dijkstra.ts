import type { IPointData } from "pixi.js";
import { PriorityQueue } from "./PriorityQueue";

interface ValueAndPriority<T> {
   value: T;
   priority: number;
}

export function dijkstra(
   grid: number[],
   stride: number,
   start: IPointData,
   end: IPointData,
   freeTiles: Set<number>,
): IPointData[] {
   const frontier = new PriorityQueue<ValueAndPriority<IPointData>>({
      comparator: (a, b) => a.priority - b.priority,
   });
   const cameFrom = new Map<number, IPointData>();
   const costSoFar = new Map<number, number>();
   const maxX = stride;
   const maxY = grid.length / stride;
   const hash = (x: number, y: number) => y * maxX + x;

   frontier.queue({ value: start, priority: 0 });

   const key = hash(start.x, start.y);
   cameFrom.set(key, start);
   costSoFar.set(key, 0);

   function expandFrontier(nextX: number, nextY: number, current: IPointData) {
      const nextXy = hash(nextX, nextY);
      const currentXy = hash(current.x, current.y);
      const newCost = costSoFar.get(currentXy)! + (freeTiles.has(nextXy) ? 0 : grid[nextXy]);
      if (newCost >= (costSoFar.get(nextXy) ?? Number.POSITIVE_INFINITY)) {
         return;
      }
      costSoFar.set(nextXy, newCost);
      const priority = newCost + Math.abs(nextX - end.x) + Math.abs(nextY - end.y);
      frontier.queue({ value: { x: nextX, y: nextY }, priority });
      cameFrom.set(nextXy, current);
   }

   function isPassable(x: number, y: number): boolean {
      return grid[hash(x, y)] >= 0;
   }

   while (frontier.length > 0) {
      const current = frontier.dequeue();
      if (current.value === end) {
         break;
      }

      if (current.value.x + 1 < maxX && isPassable(current.value.x + 1, current.value.y)) {
         expandFrontier(current.value.x + 1, current.value.y, current.value);
      }

      if (current.value.x - 1 >= 0 && isPassable(current.value.x - 1, current.value.y)) {
         expandFrontier(current.value.x - 1, current.value.y, current.value);
      }

      if (current.value.y + 1 < maxY && isPassable(current.value.x, current.value.y + 1)) {
         expandFrontier(current.value.x, current.value.y + 1, current.value);
      }

      if (current.value.y - 1 >= 0 && isPassable(current.value.x, current.value.y - 1)) {
         expandFrontier(current.value.x, current.value.y - 1, current.value);
      }
   }

   let current = end;
   const path: IPointData[] = [];
   if (cameFrom.has(hash(end.x, end.y))) {
      while (current.x !== start.x || current.y !== start.y) {
         path.unshift(current);
         current = cameFrom.get(hash(current.x, current.y))!;
      }
      path.unshift(start);
   }
   return path;
}
