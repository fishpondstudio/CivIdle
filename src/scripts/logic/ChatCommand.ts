import randomColor from "randomcolor";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import { AccountLevel } from "../../../shared/utilities/Database";
import {
   HOUR,
   clamp,
   forEach,
   formatHM,
   formatNumber,
   safeParseInt,
   sizeOf,
} from "../../../shared/utilities/Helper";
import { decompressSave, loadSave } from "../Global";
import { addSystemMessage, client } from "../rpc/RPCClient";
import { tickEverySecond } from "./Tick";

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
         addSystemMessage(`You have played actively and online for ${formatHM(playTime * 1000)}`);
         break;
      }
      case "randomcolor": {
         const colors = randomColor({
            luminosity: "light",
            count: sizeOf(Config.Building) + sizeOf(Config.Resource),
         });
         forEach(Config.Building, (k, v) => {
            getGameOptions().buildingColors[k] = colors.pop();
         });
         forEach(Config.Resource, (k, v) => {
            getGameOptions().resourceColors[k] = colors.pop();
         });
         addSystemMessage("Assign random colors to buildings and resources");
         break;
      }
      case "changelevel": {
         if (!parts[1] || !parts[2]) {
            throw new Error("Invalid command format");
         }
         await client.changePlayerLevel(parts[1], parseInt(parts[2], 10) as AccountLevel);
         addSystemMessage("Player level has been changed");
         break;
      }
      case "setplaytime": {
         if (!parts[1] || !parts[2]) {
            throw new Error("Invalid command format");
         }
         await client.setPlayTime(parts[1], parseInt(parts[2], 10));
         addSystemMessage("Play time has been changed");
         break;
      }
      case "makemod": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         await client.makeMod(parts[1]);
         addSystemMessage("Player mod has been changed");
         break;
      }
      case "muteplayer": {
         if (!parts[1] || !parts[2]) {
            throw new Error("Invalid command format");
         }
         const muteUntil = await client.mutePlayer(parts[1], parseInt(parts[2], 10) * HOUR);
         addSystemMessage(`Player ${parts[1]} has been muted until ${new Date(muteUntil).toLocaleString()}`);
         break;
      }
      case "mutelist": {
         const mutedPlayers = await client.getMutedPlayers();
         mutedPlayers.forEach((m) => {
            addSystemMessage(`${m.handle} muted until ${new Date(m.time).toLocaleString()}`);
         });
         break;
      }
      default: {
         addSystemMessage("Command not found");
         break;
      }
   }
}
