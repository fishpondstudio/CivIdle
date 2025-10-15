import { LiveUpdate } from "@capawesome/capacitor-live-update";

export async function initLiveUpdate(): Promise<void> {
   const bundle = await LiveUpdate.getCurrentBundle();
}
