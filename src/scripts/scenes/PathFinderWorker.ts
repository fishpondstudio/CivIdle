import { handleRpc, isJsonRpcRequest } from "../../../shared/thirdparty/TRPCServer";
import type { IPointData } from "../../../shared/utilities/Helper";
import { dijkstra } from "../utilities/dijkstra";

export class PathFinderWorker {
   dijkstra(
      grid: number[],
      stride: number,
      start: IPointData,
      end: IPointData,
      freeTiles: Set<number>,
   ): IPointData[] {
      return dijkstra(grid, stride, start, end, freeTiles);
   }
}

const worker = new PathFinderWorker();

addEventListener("message", async (event) => {
   const req = event.data;
   if (isJsonRpcRequest(req)) {
      const res = await handleRpc(req, worker);
      postMessage(res);
   }
});
