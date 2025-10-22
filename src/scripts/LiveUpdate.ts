import { LiveUpdate } from "@capawesome/capacitor-live-update";
import { getBuildNumber } from "./logic/Version";

export async function initLiveUpdate(): Promise<void> {
   await LiveUpdate.ready();
   const response = await fetch(`https://ota.fishpondstudio.com/cividle-v1.json?t=${Date.now()}`);
   const json = await response.json();
   if (getBuildNumber() >= json.build) {
      console.log("Current app is shipped with latest build:", json.build);
      return;
   }
   const build = String(json.build);
   const current = await LiveUpdate.getCurrentBundle();
   if (current.bundleId === build) {
      console.log("Current bundle is already the latest build:", build);
      return;
   }
   const bundles = await LiveUpdate.getBundles();
   const bundle = bundles.bundleIds.find((id) => id === build);
   if (bundle) {
      console.log("Found latest bundle on disk, will set it as next bundle:", build);
      await LiveUpdate.setNextBundle({ bundleId: build });
   } else {
      console.log("Will download the latest bundle:", build);
      await LiveUpdate.downloadBundle({
         url: `https://ota.fishpondstudio.com/cividle-${build}.zip`,
         bundleId: build,
      });
      await LiveUpdate.setNextBundle({ bundleId: build });
   }
}
