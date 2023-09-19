import { Singleton } from "./Global";
import { isSteam, SteamClient } from "./rpc/SteamClient";
import { ErrorPage } from "./ui/ErrorPage";

export async function checkSteamBranch() {
   if (!isSteam()) {
      return;
   }
   const beta = await SteamClient.getBetaName();
   if (beta !== "beta") {
      Singleton().routeTo(ErrorPage, {
         content: (
            <>
               <div className="title">Please Switch To Beta Branch On Steam</div>
               <div>
                  You are not currently on beta branch. Please close the game, go to Steam, right click CivIdle -&gt;
                  Properties -&gt; Betas and select "beta" in the dropdown menu. After Steam has finish downloading,
                  start the game again. If this error persists, please report the bug on Discord.
               </div>
            </>
         ),
      });
   }
}
