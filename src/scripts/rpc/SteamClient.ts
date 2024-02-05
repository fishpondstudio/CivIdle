import type { IPCService } from "../../../electron/src/IPCService";
import { rpcClient } from "../../../shared/thirdparty/TRPCClient";

export function isSteam() {
   return typeof IPCBridge !== "undefined";
}

export const SteamClient = rpcClient<IPCService>({
   request: (method: string, params: any[]) => {
      if (!IPCBridge) {
         throw new Error("SteamClient is not defined");
      }
      return IPCBridge.rpcCall(method, params);
   },
});
