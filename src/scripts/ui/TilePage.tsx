import { getGrid } from "../../../shared/logic/IntraTickCache";
import { Direction } from "../../../shared/utilities/Grid";
import { pointToTile, tileToPoint, type Tile } from "../../../shared/utilities/Helper";
import { useGameState } from "../Global";
import { LookAtMode, WorldScene } from "../scenes/WorldScene";
import { useShortcut } from "../utilities/Hook";
import { isSingletonReady, Singleton } from "../utilities/Singleton";
import { playClick } from "../visuals/Sound";
import { BuildingPage } from "./BuildingPage";
import { ConstructionPage } from "./ConstructionPage";
import { EmptyTilePage } from "./EmptyTilePage";
import { UnexploredTile } from "./UnexploredTile";
import { UpgradingPage } from "./UpgradingPage";

export function TilePage(props: { xy: Tile }): React.ReactNode {
   const gameState = useGameState();
   const { xy } = props;
   if (!xy || !isSingletonReady()) {
      return null;
   }
   const tile = gameState.tiles.get(xy);
   const selectNeighbor = (direction: Direction) => {
      const neighbor = getGrid(gameState).getNeighbor(tileToPoint(xy), direction);
      if (neighbor) {
         const tile = pointToTile(neighbor);
         playClick();
         Singleton().sceneManager.getCurrent(WorldScene)?.lookAtTile(tile, LookAtMode.Select);
      }
   };
   useShortcut("CityMapSelectEast", () => selectNeighbor(Direction.East), [xy]);
   useShortcut("CityMapSelectNortheast", () => selectNeighbor(Direction.Northeast), [xy]);
   useShortcut("CityMapSelectNorthwest", () => selectNeighbor(Direction.Northwest), [xy]);
   useShortcut("CityMapSelectWest", () => selectNeighbor(Direction.West), [xy]);
   useShortcut("CityMapSelectSouthwest", () => selectNeighbor(Direction.Southwest), [xy]);
   useShortcut("CityMapSelectSoutheast", () => selectNeighbor(Direction.Southeast), [xy]);
   if (!tile?.explored) {
      return <UnexploredTile />;
   }
   if (!tile.building) {
      return <EmptyTilePage tile={tile} />;
   }
   if (tile.building.status === "building") {
      return <ConstructionPage tile={tile} />;
   }
   if (tile.building.status === "upgrading") {
      return <UpgradingPage tile={tile} />;
   }
   return <BuildingPage {...props} tile={tile} />;
}
