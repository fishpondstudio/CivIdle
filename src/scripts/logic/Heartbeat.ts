import { fossilDeltaCreate } from "../../../shared/FossilDelta";
import { wyhash } from "../../../shared/wyhash";
import { getGameOptions, getGameState } from "../Global";
import { client } from "../rpc/RPCClient";
import { compress } from "../workers/Compress";

export class Heartbeat {
   constructor(private data: Uint8Array) {}

   public init() {
      if (getGameState().isOffline || getGameOptions().isOffline) {
         return;
      }
      return client.fullHeartbeat(this.data);
   }

   public update(data: Uint8Array): void {
      if (getGameState().isOffline || getGameOptions().isOffline) {
         client.pulse();
         return;
      }
      const patch = fossilDeltaCreate(this.data, data);
      compress(patch).then((p) => {
         client
            .heartbeat(p, wyhash(data, BigInt(0)).toString(16))
            .then(() => {
               this.data = data;
            })
            .catch((e) => {
               console.error(e);
               this.data = data;
               this.init();
            });
      });
   }
}
