import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import { getPermanentGreatPeopleLevel } from "../../../shared/logic/RebirthLogic";
import { getCurrentAge } from "../../../shared/logic/TechLogic";
import { totalEmpireValue } from "../../../shared/logic/TickLogic";
import { client, getUser } from "../rpc/RPCClient";

export async function clientHeartbeat(): Promise<void> {
   const user = getUser();
   const gs = getGameState();
   const options = getGameOptions();

   client.heartbeatV2({
      clientTick: gs.tick,
      clientTime: Date.now(),
      gameId: gs.id,
      city: gs.city,
      techAge: getCurrentAge(gs),
      userFlags: user?.attr ?? null,
      empireValue: totalEmpireValue(gs),
      greatPeopleLevel: getPermanentGreatPeopleLevel(options),
   });
}
