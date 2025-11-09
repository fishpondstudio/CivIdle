import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import { MAX_TECH_AGE } from "../../../shared/definitions/TechDefinitions";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions, getGameState, savedGame } from "../../../shared/logic/GameStateLogic";
import {
   DEFAULT_GREAT_PEOPLE_CHOICE_COUNT,
   rollPermanentGreatPeople,
} from "../../../shared/logic/RebirthLogic";
import {
   ChatChannels,
   UserAttributes,
   type AccountLevel,
   type ChatChannel,
} from "../../../shared/utilities/Database";
import {
   firstKeyOf,
   formatHM,
   formatNumber,
   hasFlag,
   HOUR,
   MINUTE,
   numberToRoman,
   safeParseInt,
   SECOND,
   sizeOf,
   uuid4,
} from "../../../shared/utilities/Helper";
import { compressSave, decompressSave, overwriteSaveGame, resetToCity, saveGame } from "../Global";
import {
   addSystemMessage,
   canEarnGreatPeopleFromReborn,
   clearSystemMessages,
   client,
   getPlayerMap,
} from "../rpc/RPCClient";
import { isSteam, SteamClient } from "../rpc/SteamClient";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { WorldScene } from "../scenes/WorldScene";
import { Singleton } from "../utilities/Singleton";
import { randomizeBuildingAndResourceColor } from "./ThemeColor";

function requireOfflineRun(): void {
   if (canEarnGreatPeopleFromReborn()) {
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
      case "loadsave": {
         requireDevelopment();
         const [handle] = await window.showOpenFilePicker();
         const file = await handle.getFile();
         const bytes = await file.arrayBuffer();

         const save = await decompressSave(new Uint8Array(bytes));
         save.options.userId = `web:${uuid4()}`;

         overwriteSaveGame(save);
         await saveGame();
         addSystemMessage("Load save file");
         window.location.reload();
         break;
      }
      case "exportsave": {
         requireDevelopment();
         const handle = await window.showSaveFilePicker();
         savedGame.options.userId = null;
         const bytes = await compressSave(savedGame);
         const stream = await handle.createWritable();
         await stream.write(bytes);
         await stream.close();
         break;
      }
      case "playtime": {
         const playTime = await client.getPlayTime();
         addSystemMessage(`You have played actively and online for ${formatHM(playTime * 1000)}`);
         break;
      }
      case "clear": {
         clearSystemMessages();
         break;
      }
      case "reload": {
         saveGame().then(() => window.location.reload());
         break;
      }
      case "playercount": {
         const onlineCount = await client.getOnlinePlayerCount();
         const totalCount = await client.getTotalPlayerCount();
         addSystemMessage(`There are ${totalCount} players, ${onlineCount} of them are current online`);
         break;
      }
      case "recoverprogress": {
         if (parts[1] === "confirm") {
            const number = await client.doGreatPeopleRecovery();
            getGameOptions().greatPeople = {};
            getGameOptions().greatPeopleChoicesV2 = rollPermanentGreatPeople(
               number,
               Math.floor(number / sizeOf(Config.GreatPerson)),
               DEFAULT_GREAT_PEOPLE_CHOICE_COUNT,
               MAX_TECH_AGE,
               getGameState().city,
            );
            await resetToCity(uuid4(), firstKeyOf(Config.City)!, 0);
            await saveGame();
            window.location.reload();
         }
         const number = await client.getGreatPeopleRecovery();
         addSystemMessage(
            `Your pending progress recovery request will grant you ${number} great people. Type "/recoverprogress confirm" to claim them. Your current progress (this run and permanent great people) will be reset`,
         );
         break;
      }
      case "togglearrow": {
         getGameOptions().showTransportArrow = !getGameOptions().showTransportArrow;
         await saveGame();
         window.location.reload();
         break;
      }
      case "randomcolor": {
         randomizeBuildingAndResourceColor(getGameOptions());
         addSystemMessage("Assign random colors to buildings and resources");
         break;
      }
      case "locate": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         const results = Array.from(getGameState().tiles)
            .filter(
               ([, tile]) =>
                  tile.explored &&
                  tile.building &&
                  Config.Building[tile.building.type].name().toLowerCase().includes(parts[1].toLowerCase()),
            )
            .map(([xy]) => xy);
         addSystemMessage(`Found ${results.length} building(s) that contains "${parts[1]}"`);
         Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, results);
         break;
      }
      case "find": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         const query = parts[1].toLowerCase();
         let hasFound = false;
         for (const [xy, tile] of getPlayerMap()) {
            if (tile.handle.toLowerCase() === query) {
               addSystemMessage(`Found player ${parts[1]}, will pan camera to the tile`);
               Singleton().sceneManager.getCurrent(PlayerMapScene)?.lookAt(xy);
               hasFound = true;
               break;
            }
         }
         if (!hasFound) {
            addSystemMessage(`Failed to find player ${parts[1]}`);
         }
         break;
      }
      case "changelevel": {
         if (!parts[1] || !parts[2]) {
            throw new Error("Invalid command format");
         }
         await client.changePlayerLevel(parts[1], Number.parseInt(parts[2], 10) as AccountLevel);
         addSystemMessage("Player level has been changed");
         break;
      }
      case "setplayhour": {
         if (!parts[1] || !parts[2]) {
            throw new Error("Invalid command format");
         }
         const time = Number.parseInt(parts[2], 10);
         addSystemMessage(`Play time has been changed to ${time}h`);
         await client.setPlayTime(parts[1], time * 60 * 60);
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
      case "cleartilecd": {
         await client.clearTileCooldown();
         addSystemMessage("Trade tile cooldown has been cleared");
         break;
      }
      case "tabulate": {
         const resp = await client.tabulateVotedBoost();
         addSystemMessage(JSON.stringify(resp));
         break;
      }
      case "clearVotedBoost": {
         await client.clearVotedBoost();
         addSystemMessage("Voted boosts have been cleared");
         break;
      }
      case "queryplayer": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         const user = await client.queryPlayer(parts[1]);
         addSystemMessage(
            [
               JSON.stringify(user),
               "\nRelated:",
               ...(await client.queryRelatedPlayers(parts[1])).map((u) => JSON.stringify(u)),
            ].join("\n"),
         );
         break;
      }
      case "lssp": {
         const result = await client.listSpecialPlayers();
         const json = JSON.stringify(result);
         navigator.clipboard.writeText(json);
         const rows = result.map((user) => {
            const ev = user.heartbeatData?.empireValue ?? 0;
            const gp = user.heartbeatData?.greatPeopleLevel ?? 0;
            const clientTick = user.heartbeatData?.clientTick ?? 0;
            return [
               user.handle.padEnd(16),
               (hasFlag(user.attr, UserAttributes.DLC1) ? "*" : " ").padEnd(2),
               (numberToRoman(user.level + 1) ?? "").padEnd(6),
               (hasFlag(user.attr, UserAttributes.Suspicious) ? "S" : " ").padEnd(2),
               (hasFlag(user.attr, UserAttributes.Desynced) ? "D" : " ").padEnd(2),
               formatNumber(ev).padStart(10),
               formatNumber(ev / clientTick).padStart(10),
               formatNumber(gp).padStart(10),
               formatNumber(gp / (user.totalPlayTime / 3600)).padStart(10),
               `${Math.floor(user.totalPlayTime / 3600)}h`.padStart(10),
            ].join("");
         });
         rows.unshift(
            [
               "".padEnd(16),
               "".padEnd(2),
               "".padEnd(6),
               "".padEnd(2),
               "".padEnd(2),
               "EV".padStart(10),
               "EV/t".padStart(10),
               "GP".padStart(10),
               "GP/h".padStart(10),
               "Time".padStart(10),
            ].join(""),
         );
         addSystemMessage(`<code>${rows.join("\n")}<code>`);
         break;
      }
      case "playersave": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         try {
            const save = await client.queryPlayerSave(parts[1]);
            const newHandle = await window.showSaveFilePicker({ suggestedName: parts[1] });
            const writableStream = await newHandle.createWritable();
            await writableStream.write(save);
            await writableStream.close();
         } catch (error) {
            addSystemMessage(String(error));
         }
         break;
      }
      case "getplayerattr": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         const attr = await client.getPlayerAttr(parts[1]);
         addSystemMessage(
            [
               `Flag=${attr.toString(2)}`,
               `Mod=${hasFlag(attr, UserAttributes.Mod)}`,
               `DLC1=${hasFlag(attr, UserAttributes.DLC1)}`,
               `DLC2=${hasFlag(attr, UserAttributes.DLC2)}`,
               `Banned=${hasFlag(attr, UserAttributes.Banned)}`,
               `TribuneOnly=${hasFlag(attr, UserAttributes.TribuneOnly)}`,
               `NoRename=${hasFlag(attr, UserAttributes.DisableRename)}`,
               `Suspicious=${hasFlag(attr, UserAttributes.Suspicious)}`,
               `Desynced=${hasFlag(attr, UserAttributes.Desynced)}`,
            ].join(", "),
         );
         break;
      }
      case "setplayerattr": {
         if (!parts[1] || !parts[2]) {
            throw new Error("Invalid command format");
         }
         const attr = await client.setPlayerAttr(parts[1], Number.parseInt(parts[2], 2));
         addSystemMessage(
            [
               `Flag=${attr.toString(2)}`,
               `Mod=${hasFlag(attr, UserAttributes.Mod)}`,
               `DLC1=${hasFlag(attr, UserAttributes.DLC1)}`,
               `DLC2=${hasFlag(attr, UserAttributes.DLC2)}`,
               `Banned=${hasFlag(attr, UserAttributes.Banned)}`,
               `TribuneOnly=${hasFlag(attr, UserAttributes.TribuneOnly)}`,
               `NoRename=${hasFlag(attr, UserAttributes.DisableRename)}`,
               `Suspicious=${hasFlag(attr, UserAttributes.Suspicious)}`,
               `Desynced=${hasFlag(attr, UserAttributes.Desynced)}`,
            ].join(", "),
         );
         break;
      }
      case "announce": {
         if (!parts[1] || !parts[2]) {
            throw new Error("Invalid command format");
         }
         if (!(parts[1] in ChatChannels)) {
            throw new Error("Invalid chat channel");
         }
         await client.announce(parts[1] as ChatChannel, parts.slice(2).join(" "));
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
      case "gprank": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         const result = await client.getGreatPeopleLevelRank(safeParseInt(parts[1], 10));
         const json = JSON.stringify(result);
         navigator.clipboard.writeText(json);
         const rows = result.map((user) => {
            const gp = user.heartbeatData?.greatPeopleLevel ?? 0;
            return [
               user.handle.padEnd(16),
               (hasFlag(user.attr, UserAttributes.DLC1) ? "*" : " ").padEnd(2),
               (numberToRoman(user.level + 1) ?? "").padEnd(6),
               formatNumber(gp / (user.totalPlayTime / 3600)).padStart(10),
               gp.toString().padStart(10),
               `${Math.floor(user.totalPlayTime / 3600)}h`.padStart(10),
            ].join("");
         });
         rows.unshift(
            [
               "".padEnd(16),
               "".padEnd(2),
               "".padEnd(6),
               "GP/h".padStart(10),
               "GP".padStart(10),
               "Time".padStart(10),
            ].join(""),
         );
         addSystemMessage(`<code>${rows.join("\n")}<code>`);
         break;
      }
      case "evrank": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         const result = await client.getEmpireValueRank(safeParseInt(parts[1], 10));
         const json = JSON.stringify(result);
         navigator.clipboard.writeText(json);
         const rows = result.map((user) => {
            const ev = user.heartbeatData?.empireValue ?? 0;
            return [
               user.handle.padEnd(16),
               (hasFlag(user.attr, UserAttributes.DLC1) ? "*" : " ").padEnd(2),
               (numberToRoman(user.level + 1) ?? "").padEnd(6),
               formatNumber(ev).padStart(10),
               formatNumber(ev / user.heartbeatData!.clientTick).padStart(10),
               formatNumber(
                  ev / user.heartbeatData!.clientTick / (user.heartbeatData?.greatPeopleLevel ?? 1),
               ).padStart(10),
               `${Math.floor(user.totalPlayTime / 3600)}h`.padStart(10),
            ].join("");
         });
         rows.unshift(
            [
               "".padEnd(16),
               "".padEnd(2),
               "".padEnd(6),
               "EV".padStart(10),
               "EV/t".padStart(10),
               "EV/t/GP".padStart(10),
               "Time".padStart(10),
            ].join(""),
         );
         addSystemMessage(`<code>${rows.join("\n")}<code>`);
         break;
      }
      case "modlist": {
         const result = await client.getMods();
         addSystemMessage(`Current moderators: ${result.join(", ")}`);
         break;
      }
      case "muteplayer": {
         if (!parts[1] || !parts[2]) {
            throw new Error("Invalid command format");
         }
         const muteUntil = await client.mutePlayer(parts[1], Number.parseInt(parts[2], 10) * MINUTE);
         addSystemMessage(`Player ${parts[1]} has been muted until ${new Date(muteUntil).toLocaleString()}`);
         break;
      }
      case "slowplayer": {
         if (!parts[1] || !parts[2]) {
            throw new Error("Invalid command format");
         }
         const slow = await client.slowPlayer(
            parts[1],
            Number.parseInt(parts[2], 10) * HOUR,
            Number.parseInt(parts[3] ?? 0, 10) * SECOND,
         );
         addSystemMessage(
            `Player ${parts[1]} has been slowed until ${new Date(slow.time).toLocaleString()} for ${Math.ceil(
               slow.interval / SECOND,
            )}s`,
         );
         break;
      }
      case "mutelist": {
         const mutedPlayers = await client.getMutedPlayers();
         addSystemMessage(
            `<code>${mutedPlayers
               .map((m) => {
                  return `${m.handle} muted until ${new Date(m.time).toLocaleString()}`;
               })
               .join("\n")}</code>`,
         );
         break;
      }
      case "removetrade": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         const count = await client.removeTrade(parts[1]);
         addSystemMessage(`${count} trades has been removed`);
         break;
      }
      case "slowlist": {
         const mutedPlayers = await client.getSlowedPlayer();
         addSystemMessage(
            `<code>${mutedPlayers
               .map((m) => {
                  const t = new Date(m.time).toLocaleString();
                  const i = Math.ceil(m.interval / SECOND);
                  return `${m.handle} slowed for ${i}s until ${t}`;
               })
               .join("\n")}</code>`,
         );
         break;
      }
      case "rename": {
         if (!parts[1] || !parts[2]) {
            throw new Error("Invalid command format");
         }
         const newHandle = await client.renamePlayer(parts[1], parts[2]);
         addSystemMessage(`Player ${parts[1]} renamed to ${newHandle}`);
         break;
      }
      case "setgprec": {
         if (!parts[1] || !parts[2]) {
            throw new Error("Invalid command format");
         }
         const count = Number.parseInt(parts[2], 10);
         const result = await client.setGreatPeopleRecovery(parts[1], count);
         addSystemMessage(`Will grant Player ${parts[1]} ${result} great people`);
         break;
      }
      case "getgprec": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         const count = await client.queryGreatPeopleRecovery(parts[1]);
         addSystemMessage(`Player ${parts[1]} will receive ${count} great people`);
         break;
      }
      case "clearconnection": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         await client.clearConnection(parts[1]);
         addSystemMessage("Cross Platform connections have been cleared");
         break;
      }
      case "removetile": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         await client.removePlayerFromMap(parts[1]);
         addSystemMessage("Player has been removed from map");
         break;
      }
      case "checksum": {
         if (isSteam()) {
            addSystemMessage(
               `<code>Local Checksum: ${await SteamClient.getChecksum()}\n${JSON.stringify(await client.queryChecksums(), null, 2)}</code>`,
            );
         } else {
            addSystemMessage("Checksum is only available for Steam");
         }
         break;
      }
      case "addclaim": {
         if (!parts[1] || !parts[2] || !parts[3]) {
            throw new Error("Invalid command format");
         }
         if (!(parts[2] in Config.Material)) {
            throw new Error("Invalid resource");
         }
         await client.addPendingClaim(parts[1], parts[2] as Material, safeParseInt(parts[3], 10));
         addSystemMessage("Pending claim has been added");
         break;
      }
      case "cloudsave": {
         if (!parts[1]) {
            throw new Error("Invalid command format");
         }
         try {
            const save = await client.queryCloudSave(parts[1]);
            const newHandle = await window.showSaveFilePicker({ suggestedName: parts[1] });
            const writableStream = await newHandle.createWritable();
            await writableStream.write(save);
            await writableStream.close();
         } catch (error) {
            addSystemMessage(String(error));
         }
         break;
      }
      default: {
         addSystemMessage("Command not found");
         break;
      }
   }
}
