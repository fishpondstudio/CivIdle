import { IPointData } from "pixi.js";
import { PriorityQueue } from "./PriorityQueue";

interface ValueAndPriority<T> {
   value: T;
   priority: number;
}

export function dijkstra(graph: number[][], start: IPointData, end: IPointData): IPointData[] {
   const frontier = new PriorityQueue<ValueAndPriority<IPointData>>({ comparator: (a, b) => a.priority - b.priority });
   const cameFrom = new Map<number, IPointData>();
   const costSoFar = new Map<number, number>();
   const maxY = graph.length;
   const hash = (p: IPointData) => p.y * maxY + p.x;

   frontier.queue({ value: start, priority: 0 });

   const key = hash(start);
   cameFrom.set(key, start);
   costSoFar.set(key, 0);

   const neighbors: IPointData[] = [];

   while (frontier.length > 0) {
      const current = frontier.dequeue();
      if (current.value == end) {
         break;
      }

      neighbors.length = 0;

      if (graph[current.value.y]?.[current.value.x + 1] >= 0) {
         neighbors.push({ x: current.value.x + 1, y: current.value.y });
      }

      if (graph[current.value.y]?.[current.value.x - 1] >= 0) {
         neighbors.push({ x: current.value.x - 1, y: current.value.y });
      }

      if (graph[current.value.y + 1]?.[current.value.x] >= 0) {
         neighbors.push({ x: current.value.x, y: current.value.y + 1 });
      }

      if (graph[current.value.y - 1]?.[current.value.x] >= 0) {
         neighbors.push({ x: current.value.x, y: current.value.y - 1 });
      }

      for (let i = 0; i < neighbors.length; i++) {
         const next = neighbors[i];
         const newCost = costSoFar.get(hash(current.value))! + graph[next.y][next.x];
         const nextXy = hash(next);
         if (!costSoFar.has(nextXy) || newCost < costSoFar.get(nextXy)!) {
            costSoFar.set(nextXy, newCost);
            const priority = newCost;
            frontier.queue({ value: next, priority });
            cameFrom.set(nextXy, current.value);
         }
      }
   }

   let current = end;
   const path: IPointData[] = [];
   if (cameFrom.has(hash(end))) {
      while (current.x != start.x || current.y != start.y) {
         path.unshift(current);
         current = cameFrom.get(hash(current))!;
      }
      path.unshift(start);
   }
   return path;
}
