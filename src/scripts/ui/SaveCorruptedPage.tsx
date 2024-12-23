import { DISCORD_URL } from "../../../shared/logic/Constants";
import { OnKeydown } from "../../../shared/logic/Shortcut";
import { isSteam, SteamClient } from "../rpc/SteamClient";
import { useTypedEvent } from "../utilities/Hook";
import { openUrl } from "../utilities/Platform";

export function SaveCorruptedPage(): React.ReactNode {
   useTypedEvent(OnKeydown, (e) => {
      if (e.key === "d") {
         openUrl(DISCORD_URL);
      }
      if (e.key === "h") {
         openUrl("https://cividle.com/images/recovery.png");
      }
      if (e.key === "s") {
         if (isSteam()) SteamClient.openMainSaveFolder();
      }
      if (e.key === "b") {
         if (isSteam()) SteamClient.openBackupSaveFolder();
      }
      if (e.key === "l") {
         if (isSteam()) SteamClient.openLogFolder();
      }
   });
   return (
      <div className="error-page">
         <div className="title">Save File Corrupted</div>
         <div>
            Your save file is corrupted. You can try to recover from automatic backups. Open backup folder
            (press [B]), choose the most recent backup (sort by last modified date) and overwrite your save
            file (press [S] to open save folder). If you need help, Press [H] to open detailed instructions or
            press [D] to open link to Discord server.
         </div>
      </div>
   );
}
