import { client } from "../rpc/RPCClient";
import { fossilDeltaCreate } from "../utilities/FossilDelta";
import { wyhash } from "../utilities/wyhash";
import { compress } from "../workers/Compress";

export class Heartbeat {
   constructor(private data: Uint8Array) {}

   public init() {
      return client.fullHeartbeat(this.data);
   }

   public update(data: Uint8Array): void {
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
