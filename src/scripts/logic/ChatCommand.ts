import { decompressSave, getGameState, loadSave } from "../Global";
import { clamp, safeParseInt } from "../utilities/Helper";
import { tickEverySecond } from "./Update";

export async function handleChatCommand(command: string): Promise<string> {
   const parts = command.split(" ");
   switch (parts[0]) {
      case "timetravel": {
         const time = clamp(safeParseInt(parts[1], 30), 0, 60 * 4);
         setTimeout(() => {
            const gs = getGameState();
            for (let i = 0; i < 60 * time; i++) {
               tickEverySecond(gs, true);
            }
         }, 500);
         return `Time travel ${time} minutes\nThis could take a while...`;
      }
      case "loadsave": {
         const [handle] = await window.showOpenFilePicker();
         const file = await handle.getFile();
         const bytes = await file.arrayBuffer();
         loadSave(await decompressSave(new Uint8Array(bytes)));
         return "Load save file";
      }
      default: {
         return "command not found";
      }
   }
}
