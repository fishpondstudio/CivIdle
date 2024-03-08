import type {GameState} from "../../../shared/logic/GameState";
import type {IBuildingData} from "../../../shared/logic/Tile";
import type {Tile} from "../../../shared/utilities/Helper";
import {Singleton} from "./Singleton";
import {LookAtMode, WorldScene} from "../scenes/WorldScene";

export function navigateToSameTypeBuilding(gameState: GameState, building: IBuildingData | null, xy: Tile, direction: 'prev' | 'next') {
    if(!building) return;
    const sameBuilding = Array.from(gameState.tiles.entries())
        .filter(([coords, tile]) => tile.building && tile.building.type === building.type && tile.explored)
        .sort(([coords1], [coords2]) => direction === 'prev' ? coords2 - coords1 : coords1 - coords2);

    const buildingIndex = sameBuilding.findIndex(([coords]) => direction === 'prev' ? coords < xy : coords > xy);

    if (buildingIndex !== -1 || sameBuilding.length > 0) {
        const index = buildingIndex === -1 ? 0 : buildingIndex;
        Singleton().sceneManager.getCurrent(WorldScene)?.lookAtTile(sameBuilding[index][0], LookAtMode.Select);
    }
}
