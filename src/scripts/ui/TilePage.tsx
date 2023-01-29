import { isSingletonReady, useGameState } from "../Global";
import { BuildingPage } from "./BuildingPage";
import { ConstructionPage } from "./ConstructionPage";
import { EmptyTilePage } from "./EmptyTilePage";
import { UnexploredTile } from "./UnexploredTile";
import { UpgradingPage } from "./UpgradingPage";

export function TilePage({ xy }: { xy: string }) {
   const gameState = useGameState();
   if (!xy || !isSingletonReady()) {
      return null;
   }
   const tile = gameState.tiles[xy];
   if (!tile?.explored) {
      return <UnexploredTile />;
   }
   if (!tile.building) {
      return <EmptyTilePage tile={tile} />;
   }
   if (tile.building.status === "building" || tile.building.status === "paused") {
      return <ConstructionPage tile={tile} />;
   }
   if (tile.building.status === "upgrading") {
      return <UpgradingPage tile={tile} />;
   }
   return <BuildingPage tile={tile} />;
}
