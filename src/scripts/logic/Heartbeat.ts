import { getGameState } from "../../../shared/logic/GameStateLogic";
import { fossilDeltaCreate } from "../../../shared/thirdparty/FossilDelta";
import { wyhash } from "../../../shared/thirdparty/wyhash";
import { client, isOnlineUser } from "../rpc/RPCClient";
import { compress } from "../workers/Compress";

export class Heartbeat {
   constructor(private data: Uint8Array) {}

   public init(): void {
      if (!getGameState().isOffline || !isOnlineUser()) {
         return;
      }
      compress(this.data).then((d) => client.fullHeartbeat(d));
   }

   public update(data: Uint8Array): void {
      if (getGameState().isOffline || !isOnlineUser()) {
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
