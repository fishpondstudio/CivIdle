import WorldMap from "../../../shared/definitions/WorldMap.json";
import { usePlayerMap } from "../rpc/RPCClient";
import { getMyMapXy } from "../scenes/PathFinder";
import { WorldScene } from "../scenes/WorldScene";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { MyTilePage } from "./MyTilePage";
import { OceanTilePage } from "./OceanTilePage";
import { PlayerTilePage } from "./PlayerTilePage";
import { UnclaimedTilePage } from "./UnclaimedTilePage";

export function PlayerMapPage({ xy }: { xy: string }): React.ReactNode {
   const playerMap = usePlayerMap();
   const myXy = getMyMapXy();
   useShortcut(
      "PlayerMapPageGoBackToCity",
      () => {
         Singleton().sceneManager.loadScene(WorldScene);
      },
      [xy],
   );
   if (myXy === xy) {
      return <MyTilePage xy={xy} />;
   }
   if (playerMap.has(xy)) {
      return <PlayerTilePage xy={xy} />;
   }
   if ((WorldMap as Record<string, boolean>)[xy]) {
      return <UnclaimedTilePage xy={xy} />;
   }
   return <OceanTilePage xy={xy} />;
}
