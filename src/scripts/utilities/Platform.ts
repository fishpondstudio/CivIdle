import { SteamClient, isSteam } from "../rpc/SteamClient";

export function openUrl(url: string): void {
   if (isSteam()) {
      SteamClient.openUrl(url);
      return;
   }
   window.open(url, "_blank");
}
