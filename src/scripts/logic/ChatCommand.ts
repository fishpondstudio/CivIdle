import { decompressSave, getGameState, loadSave } from "../Global";
import { addSystemMessage, client } from "../rpc/RPCClient";
import { clamp, formatHM, formatNumber, safeParseInt } from "../utilities/Helper";
import { tickEverySecond } from "./Update";

export async function handleChatCommand(command: string): Promise<void> {
   const parts = command.split(" ");
   switch (parts[0]) {
      case "timetravel": {
         const time = clamp(safeParseInt(parts[1], 30), 0, 60 * 4);
         addSystemMessage(`Time travel ${time} minutes. This could take a while, please be patient...`);
         setTimeout(() => {
            const now = performance.now();
            const gs = getGameState();
            for (let i = 0; i < 60 * time; i++) {
               tickEverySecond(gs, true);
            }
            addSystemMessage(`Completed in ${formatNumber((performance.now() - now) / 1000)}s`);
         }, 500);
         break;
      }
      case "loadsave": {
         const [handle] = await window.showOpenFilePicker();
         const file = await handle.getFile();
         const bytes = await file.arrayBuffer();
         loadSave(await decompressSave(new Uint8Array(bytes)));
         addSystemMessage("Load save file");
         break;
      }
      case "playtime": {
         const playTime = await client.getPlayTime();
         addSystemMessage(`You have played ${formatHM(playTime * 1000)}`);
         break;
      }
      default: {
         addSystemMessage("Command not found");
         break;
      }
   }
}
