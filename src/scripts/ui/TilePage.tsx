import { findSpecialBuilding, togglePetraTimeWarp } from "../../../shared/logic/BuildingLogic";
import type { IPetraBuildingData } from "../../../shared/logic/Tile";
import { isNullOrUndefined, type Tile } from "../../../shared/utilities/Helper";
import { useGameState } from "../Global";
import { useShortcut } from "../utilities/Hook";
import { isSingletonReady } from "../utilities/Singleton";
import { BuildingPage } from "./BuildingPage";
import { ConstructionPage } from "./ConstructionPage";
import { EmptyTilePage } from "./EmptyTilePage";
import { UnexploredTile } from "./UnexploredTile";

export function TilePage(props: { xy: Tile | undefined }): React.ReactNode {
   const gameState = useGameState();
   const { xy } = props;
   if (isNullOrUndefined(xy) || !isSingletonReady()) {
      return null;
   }
   const tile = gameState.tiles.get(xy);
   useShortcut(
      "TogglePetraWarp",
      () => {
         const petra = findSpecialBuilding("Petra", gameState);
         if (petra) {
            const petraBuilding = petra.building as IPetraBuildingData;
            if (petraBuilding.speedUp !== 1) {
               petraBuilding.lastUsedSpeedUp = petraBuilding.speedUp;
            }
            togglePetraTimeWarp(petraBuilding);
         }
      },
      [],
   );
   if (!tile?.explored) {
      return <UnexploredTile xy={xy} gameState={gameState} />;
   }
   if (!tile.building) {
      return <EmptyTilePage tile={tile} />;
   }
   if (tile.building.status !== "completed") {
      return <ConstructionPage tile={tile} />;
   }
   return <BuildingPage {...props} tile={tile} />;
}
