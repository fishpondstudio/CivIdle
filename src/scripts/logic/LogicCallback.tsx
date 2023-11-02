import { Tech } from "../definitions/TechDefinitions";
import { Singleton } from "../Global";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { WorldScene } from "../scenes/WorldScene";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { showModal } from "../ui/GlobalModal";
import { forEach, pointToXy, safePush, xyToPoint } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { GameState } from "./GameState";
import { getBuildingsByType } from "./IntraTickCache";
import { getGreatPeopleChoices } from "./TechLogic";
import { ensureTileFogOfWar } from "./TerrainLogic";
import { Tick } from "./TickLogic";
import { addMultiplier } from "./Update";

export function onBuildingComplete(xy: string, gs: GameState) {
   ensureTileFogOfWar(xy, gs, Singleton().grid).forEach((xy) => {
      Singleton().sceneManager.getCurrent(WorldScene)?.getTile(xy)?.reveal().catch(console.error);
   });

   const building = gs.tiles[xy].building;

   if (!building) {
      return;
   }

   switch (building.type) {
      case "HatshepsutTemple": {
         forEach(gs.tiles, (xy, tile) => {
            if (tile.deposit.Water) {
               tile.explored = true;
               Singleton().sceneManager.getCurrent(WorldScene)?.getTile(xy)?.reveal().catch(console.error);
            }
         });
         break;
      }
      case "Parthenon": {
         gs.greatPeopleChoices.push(getGreatPeopleChoices("ClassicalAge"));
         if (gs.greatPeopleChoices.length > 0) {
            showModal(<ChooseGreatPersonModal greatPeopleChoice={gs.greatPeopleChoices[0]} />);
         }
         break;
      }
   }
}

export function onBuildingProductionComplete(xy: string, gs: GameState) {
   const building = gs.tiles[xy].building;

   if (!building) {
      return;
   }

   const buildingsByType = getBuildingsByType(gs);

   const { grid } = Singleton();

   const buildingName = Tick.current.buildings[building.type].name();

   switch (building.type) {
      case "HatshepsutTemple": {
         buildingsByType.WheatFarm?.forEach((f) => {
            if (f.building) {
               let adjacentWaterTiles = 0;
               grid.getNeighbors(xyToPoint(f.xy)).forEach((neighbor) => {
                  if (gs.tiles[pointToXy(neighbor)]?.deposit.Water) {
                     ++adjacentWaterTiles;
                  }
               });
               if (adjacentWaterTiles > 0) {
                  safePush(Tick.next.tileMultipliers, f.xy, {
                     output: adjacentWaterTiles,
                     source: buildingName,
                  });
               }
            }
         });
         break;
      }
      case "Colosseum": {
         grid.getNeighbors(xyToPoint(xy)).forEach((neighbor) => {
            safePush(Tick.next.tileMultipliers, pointToXy(neighbor), {
               output: 1,
               worker: 1,
               storage: 1,
               source: buildingName,
            });
         });
         break;
      }
      case "CircusMaximus": {
         forEach(Tick.current.buildings, (building, def) => {
            if (def.output.Worker) {
               addMultiplier(building, { output: 1 }, buildingName);
            }
         });
         break;
      }
      case "Alps": {
         forEach(gs.tiles, (xy, tile) => {
            if (tile.building) {
               const mul = Math.floor(tile.building.level / 10);
               if (mul > 0) {
                  safePush(Tick.next.tileMultipliers, xy, {
                     input: mul,
                     output: mul,
                     source: t(L.NaturalWonderName, { name: buildingName }),
                  });
               }
            }
         });
         break;
      }
      case "PyramidOfGiza": {
         forEach(Tick.current.buildings, (building, def) => {
            if (def.output.Worker) {
               addMultiplier(building, { output: 1 }, buildingName);
            }
         });
         break;
      }
      case "ChichenItza": {
         grid.getNeighbors(xyToPoint(xy)).forEach((neighbor) => {
            safePush(Tick.next.tileMultipliers, pointToXy(neighbor), {
               output: 1,
               storage: 1,
               worker: 1,
               source: buildingName,
            });
         });
         break;
      }
      case "TempleOfHeaven": {
         forEach(gs.tiles, (xy, tile) => {
            if (tile.building) {
               if (tile.building.level >= 10) {
                  safePush(Tick.next.tileMultipliers, xy, {
                     worker: 1,
                     source: buildingName,
                  });
               }
            }
         });
         break;
      }
      case "LuxorTemple": {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: 1,
            source: buildingName,
         });
         break;
      }
   }
}

export function onUnlockableUnlocked(tech: Tech, gs: GameState) {
   Singleton().sceneManager.getCurrent(TechTreeScene)?.renderTechTree("animate");
}
