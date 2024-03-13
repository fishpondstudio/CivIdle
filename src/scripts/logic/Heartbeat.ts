import { getGameState } from "../../../shared/logic/GameStateLogic";
import { fossilDeltaCreate } from "../../../shared/thirdparty/FossilDelta";
import { wyhash } from "../../../shared/thirdparty/wyhash";
import { client, isOnlineUser } from "../rpc/RPCClient";
import { compress } from "../workers/Compress";

export class Heartbeat {
   constructor(private data: Uint8Array) {}

   public init(): void {
      if (!this.shouldSendBytes()) {
         return;
      }
      compress(this.data).then((d) => client.fullHeartbeat(d));
   }

   private shouldSendBytes(): boolean {
      if (import.meta.env.DEV) {
         return true;
      }
      if (getGameState().isOffline || !isOnlineUser()) {
         return false;
      }
      return true;
   }

   public update(data: Uint8Array): void {
      const gs = getGameState();
      if (!this.shouldSendBytes()) {
         client.tick(gs.tick);
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
