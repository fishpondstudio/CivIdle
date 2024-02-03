import type { IPCService } from "../../../electron/src/IPCService";
import { rpcClient } from "../../../shared/thirdparty/typedrpc/client";

export const STEAM_APP_ID = 2181940;

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
