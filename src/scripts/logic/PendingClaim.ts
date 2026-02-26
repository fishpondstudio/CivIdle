import type { IPendingClaim } from "../../../shared/utilities/Database";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";
import { client } from "../rpc/RPCClient";

export const PendingClaims: IPendingClaim[] = [];
export const RequestPendingClaimUpdate = new TypedEvent<void>();
export const PendingClaimUpdated = new TypedEvent<void>();
let pendingClaimRequestId = 0;

RequestPendingClaimUpdate.on(() => {
   const requestId = ++pendingClaimRequestId;
   client.getPendingClaims().then((pendingClaims) => {
      if (requestId !== pendingClaimRequestId) {
         return;
      }
      PendingClaims.length = 0;
      pendingClaims.forEach((pendingClaim) => {
         PendingClaims.push(pendingClaim);
      });
      PendingClaimUpdated.emit();
   });
});
