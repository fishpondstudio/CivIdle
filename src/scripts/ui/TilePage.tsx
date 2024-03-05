import type { Tile } from "../../../shared/utilities/Helper";
import { useGameState } from "../Global";
import { isSingletonReady } from "../utilities/Singleton";
import { BuildingPage } from "./BuildingPage";
import { ConstructionPage } from "./ConstructionPage";
import { EmptyTilePage } from "./EmptyTilePage";
import { UnexploredTile } from "./UnexploredTile";

export function TilePage(props: { xy: Tile }): React.ReactNode {
   const gameState = useGameState();
   const { xy } = props;
   if (!xy || !isSingletonReady()) {
      return null;
   }
   const tile = gameState.tiles.get(xy);
   if (!tile?.explored) {
      return <UnexploredTile />;
   }
   if (!tile.building) {
      return <EmptyTilePage tile={tile} />;
   }
   if (tile.building.status !== "completed") {
      return <ConstructionPage tile={tile} />;
   }
   return <BuildingPage {...props} tile={tile} />;
}
