import { Config } from "../../../shared/logic/Config";
import { DISCORD_URL } from "../../../shared/logic/Constants";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import { getPermanentGreatPeopleCount } from "../../../shared/logic/RebirthLogic";
import { firstKeyOf, uuid4 } from "../../../shared/utilities/Helper";
import { hardReset, resetToCity, saveGame } from "../Global";
import { client, connectWebSocket } from "../rpc/RPCClient";
import { SteamClient, isSteam } from "../rpc/SteamClient";
import { openUrl } from "../utilities/Platform";
import { showToast } from "./GlobalModal";

export function SaveCorruptedPage(): React.ReactNode {
   return (
      <div className="error-page">
         <div className="title">Save File Corrupted</div>
         <div>
            Your save file is corrupted. To recover from local backups:
            <div
               className="pointer"
               onClick={() => {
                  if (isSteam()) SteamClient.openBackupSaveFolder();
               }}
            >
               - Open backup folder (Steam only)
            </div>
            <div
               className="pointer"
               onClick={() => {
                  if (isSteam()) SteamClient.openMainSaveFolder();
               }}
            >
               - Open main save folder (Steam only)
            </div>
            <div
               className="pointer"
               onClick={() => {
                  openUrl("https://cividle.com/images/recovery.png");
               }}
            >
               - Open detailed instructions (Steam only)
            </div>
            <div className="mt10">You can also try the following:</div>
            <div
               className="pointer"
               onClick={() => {
                  if (isSteam()) SteamClient.openLogFolder();
               }}
            >
               - Open log folder (Steam only)
            </div>
            <div className="pointer" onClick={() => recoverFromServer()}>
               - Recover from server (more outdated than local backups)
            </div>
            <div
               className="pointer"
               onClick={() => {
                  hardReset().then(() => {
                     window.location.reload();
                  });
               }}
            >
               - Hard reset and reload the game
            </div>
            <div
               className="pointer"
               onClick={() => {
                  openUrl(DISCORD_URL);
               }}
            >
               - Join Discord server
            </div>
         </div>
      </div>
   );
}

export async function recoverFromServer(): Promise<void> {
   try {
      await connectWebSocket();
      await resetToCity(uuid4(), firstKeyOf(Config.City)!, 0);
      const serverOptions = await client.getOptionsFromServer();
      const clientOptions = getGameOptions();
      if (
         serverOptions &&
         getPermanentGreatPeopleCount(serverOptions) > getPermanentGreatPeopleCount(clientOptions)
      ) {
         clientOptions.ageWisdom = serverOptions.ageWisdom;
         clientOptions.greatPeople = serverOptions.greatPeople;
      } else {
         throw new Error("No server record found");
      }
      await saveGame();
      window.location.reload();
   } catch (error) {
      showToast(String(`Failed to recover from server. ${error}`));
   }
}
