import { Unlockable } from "../definitions/CityDefinitions";
import { RomeProvince } from "../definitions/RomeProvinceDefinitions";
import { Singleton } from "../Global";
import { RomeProvinceScene } from "../scenes/RomeProvinceScene";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { WorldScene } from "../scenes/WorldScene";
import { forEach, pointToXy, safePush, xyToPoint } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { GameState } from "./GameState";
import { getBuildingsByType } from "./IntraTickCache";
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

   // if (building.type === "HatshepsutTemple") {
   //    forEach(gs.tiles, (xy, tile) => {
   //       if (tile.deposit.Water) {
   //          tile.explored = true;
   //          Singleton().sceneManager.getCurrent(WorldScene)?.getTileVisual(xy)?.reveal().catch(console.error);
   //       }
   //    });
   // }
}

export function onBuildingProductionComplete(xy: string, gs: GameState) {
   const building = gs.tiles[xy].building;

   if (!building) {
      return;
   }

   const buildingsByType = getBuildingsByType(gs);

   const { grid } = Singleton();

   // if (building.type === "HatshepsutTemple") {
   //    buildingsByType.Farmland?.forEach((f) => {
   //       if (f.building) {
   //          let adjacentWaterTiles = 0;
   //          grid.getNeighbors(xyToPoint(f.xy)).forEach((neighbor) => {
   //             if (gs.tiles[pointToXy(neighbor)]?.deposit.Water) {
   //                ++adjacentWaterTiles;
   //             }
   //          });
   //          if (adjacentWaterTiles > 0) {
   //             safePush(Tick.next.tileMultipliers, f.xy, {
   //                output: adjacentWaterTiles,
   //                source: Tick.current.buildings.HatshepsutTemple.name(),
   //             });
   //          }
   //       }
   //    });
   // }

   if (building.type === "Colosseum") {
      grid.getNeighbors(xyToPoint(xy)).forEach((neighbor) => {
         safePush(Tick.next.tileMultipliers, pointToXy(neighbor), {
            output: 1,
            worker: 1,
            storage: 1,
            source: Tick.current.buildings.Colosseum.name(),
         });
      });
   }
   if (building.type === "CircusMaximus") {
      forEach(Tick.current.buildings, (building, def) => {
         if (def.output.Worker) {
            addMultiplier(building, { output: 1 }, Tick.current.buildings.CircusMaximus.name());
         }
      });
   }
   if (building.type === "Alps") {
      forEach(gs.tiles, (xy, tile) => {
         if (tile.building) {
            const mul = Math.floor(tile.building.level / 10);
            if (mul > 0) {
               safePush(Tick.next.tileMultipliers, xy, {
                  input: mul,
                  output: mul,
                  source: t(L.NaturalWonderName, { name: Tick.current.buildings.Alps.name() }),
               });
            }
         }
      });
   }
}

export function onUnlockableUnlocked(id: string, type: keyof typeof Unlockable | undefined, gs: GameState) {
   if (!type) {
      Singleton().sceneManager.getCurrent(TechTreeScene)?.renderTechTree("animate");
      Singleton()
         .sceneManager.getCurrent(RomeProvinceScene)
         ?.annexProvince(id as RomeProvince);
   }
   if (type === "RomeProvince") {
      Singleton()
         .sceneManager.loadScene(RomeProvinceScene, true)
         .selectProvince(id as RomeProvince);
   }
}
