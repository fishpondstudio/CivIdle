import { rpcClient } from "typed-rpc";
import type { IPCService } from "../../../electron/src/IPCService";

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
