import { LiveUpdate } from "@capawesome/capacitor-live-update";

export async function initLiveUpdate(): Promise<void> {
   await LiveUpdate.ready();
   const response = await fetch("https://cividle.fishpondstudio.com/v1.json");
   const json = await response.json();
   const build = String(json.build);
   const current = await LiveUpdate.getCurrentBundle();
   if (current.bundleId === build) {
      console.log("Current bundle is already the latest version:", build);
      return;
   }
   const bundles = await LiveUpdate.getBundles();
   const bundle = bundles.bundleIds.find((id) => id === build);
   if (bundle) {
      console.log("Find latest bundle on disk, will set it as next bundle:", build);
      await LiveUpdate.setNextBundle({ bundleId: build });
   } else {
      console.log("Will download the latest bundle:", build);
      await LiveUpdate.downloadBundle({
         url: `https://cividle.fishpondstudio.com/ota-${build}.zip`,
         bundleId: build,
      });
      await LiveUpdate.setNextBundle({ bundleId: build });
   }
}
