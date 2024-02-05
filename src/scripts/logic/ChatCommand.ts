import randomColor from "randomcolor";
import { isSpecialBuilding } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import { AccountLevel } from "../../../shared/utilities/Database";
import {
   HOUR,
   clamp,
   forEach,
   formatHM,
   formatNumber,
   reduceOf,
   safeParseInt,
   sizeOf,
   uuid4,
} from "../../../shared/utilities/Helper";
import { decompressSave, loadSave } from "../Global";
import { addSystemMessage, client } from "../rpc/RPCClient";
import { tickEverySecond } from "./Tick";

function requireOfflineRun(): void {
   if (!getGameState().isOffline) {
      throw new Error("Command is only available for trial run");
   }
}

function requireDevelopment(): void {
   if (!import.meta.env.DEV) {
      throw new Error("Command is only available for development");
   }
}

export async function handleChatCommand(command: string): Promise<void> {
   const parts = command.split(" ");
   switch (parts[0]) {
      case "timetravel": {
         requireOfflineRun();
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
         requireDevelopment();
         const [handle] = await window.showOpenFilePicker();
         const file = await handle.getFile();
         const bytes = await file.arrayBuffer();

         const save = await decompressSave(new Uint8Array(bytes));
         save.options.id = uuid4();

         loadSave(save);
         addSystemMessage("Load save file");
         break;
      }
      case "playtime": {
         const playTime = await client.getPlayTime();
         addSystemMessage(`You have played actively and online for ${formatHM(playTime * 1000)}`);
         break;
      }
      case "playercount": {
         const playerCount = await client.getPlayerCount();
         addSystemMessage(`There are ${playerCount} players current online`);
         break;
      }
      case "randomcolor": {
         const colors = randomColor({
            luminosity: "light",
            count:
               reduceOf(Config.Building, (prev, k) => prev + (isSpecialBuilding(k) ? 0 : 1), 0) +
               sizeOf(Config.Resource),
         });
         forEach(Config.Building, (k, v) => {
            if (!isSpecialBuilding(k)) {
               getGameOptions().buildingColors[k] = colors.pop();
            } else {
               delete getGameOptions().buildingColors[k];
            }
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
         await client.makeMod(parts[1], true);
         addSystemMessage(`${parts[1]} is now a mod`);
         break;
      }
      case "unmakemod": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         await client.makeMod(parts[1], false);
         addSystemMessage(`${parts[1]} is no longer a mod`);
         break;
      }
      case "modlist": {
         const result = await client.getMods();
         addSystemMessage(`Current censors: ${result.join(", ")}`);
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
