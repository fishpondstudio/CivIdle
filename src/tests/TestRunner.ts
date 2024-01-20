import { getBuildingCost, getPowerRequired, getTotalBuildingCost } from "../../shared/logic/BuildingLogic";
import { SavedGame, type GameState } from "../../shared/logic/GameState";
import { deserializeSave, serializeSave } from "../../shared/logic/GameStateLogic";
import {
   getConstructionPriority,
   getProductionPriority,
   getUpgradePriority,
   setConstructionPriority,
   setProductionPriority,
   setUpgradePriority,
} from "../../shared/logic/Tile";
import { initializeGameState } from "../../shared/logic/initializeGameState";
import { fossilDeltaApply, fossilDeltaCreate } from "../../shared/utilities/FossilDelta";
import { Grid } from "../../shared/utilities/Grid";
import { compressSave, decompressSave } from "../scripts/Global";

const title = "background: #636e72; color: #fff;";

function test(name: string, func: () => void | PromiseLike<void>): PromiseLike<void> {
   console.log(`%c🧪 ${name} `, title);
   const result = func();
   if (result) {
      return result;
   }
   return Promise.resolve();
}

function assertEqual<T>(expect: T, actual: T): void {
   console.log("   %s Expected: %O, Actual: %O ", expect !== actual ? "❌" : "✅", expect, actual);
}

function assertTrue<T>(cond: boolean, desc: string): void {
   console.log("   %s Assert True: %s", cond ? "✅" : "❌", desc);
}

export function RunTests(gs: GameState): void {
   test("getBuildingCost", () => {
      assertEqual(10, getBuildingCost({ type: "CoalMine", level: 0 }).Brick);
      assertEqual(15, getBuildingCost({ type: "CoalMine", level: 1 }).Brick);
      assertEqual(22.5, getBuildingCost({ type: "CoalMine", level: 2 }).Brick);
   })
      .then(() =>
         test("getTotalBuildingCost", () => {
            assertEqual(10 + 15 + 22.5, getTotalBuildingCost("CoalMine", 0, 3).Brick);
            assertEqual(15, getTotalBuildingCost("CoalMine", 1, 2).Brick);
            assertEqual(15 + 22.5, getTotalBuildingCost("CoalMine", 1, 3).Brick);
         }),
      )
      .then(() =>
         test("getPowerRequired", () => {
            assertEqual(0, getPowerRequired(0));
            assertEqual(10, getPowerRequired(1));
            assertEqual(20, getPowerRequired(2));
            assertEqual(40, getPowerRequired(3));
         }),
      )
      .then(() =>
         test("gameSaveRoundTrip", async () => {
            const s = new SavedGame();
            s.options.id = "my-user-id";
            assertEqual(s.options.id, (await decompressSave(await compressSave(s))).options.id);
         }),
      )
      .then(() =>
         test("fossilDelta", async () => {
            const s = new SavedGame();
            initializeGameState(s.current, new Grid(50, 50, 50));
            s.current.tick = 1;
            const source = serializeSave(s);
            s.current.tick = 10000;
            const dest = serializeSave(s);
            const patch = fossilDeltaCreate(source, dest);
            assertTrue(
               patch.length < source.length,
               `patch ${patch.length} is smaller than source ${source.length}`,
            );
            assertTrue(
               patch.length < dest.length,
               `patch ${patch.length} is smaller than dest ${dest.length}`,
            );
            const newDest = fossilDeltaApply(source, patch, { verifyChecksum: true });
            assertEqual(dest.length, newDest.length);
            const newGameState = deserializeSave(newDest);
            assertEqual(s.current.tick, newGameState.current.tick);
         }),
      )
      .then(() =>
         test("priority", () => {
            const priority = 0x123456;
            assertEqual(0x56, getProductionPriority(priority));
            assertEqual(0x34, getConstructionPriority(priority));
            assertEqual(0x12, getUpgradePriority(priority));

            assertEqual(0x123478, setProductionPriority(priority, 0x78));
            assertEqual(5, getProductionPriority(setProductionPriority(priority, 5)));
            assertEqual(0x127856, setConstructionPriority(priority, 0x78));
            assertEqual(6, getConstructionPriority(setConstructionPriority(priority, 6)));
            assertEqual(0x783456, setUpgradePriority(priority, 0x78));
            assertEqual(7, getUpgradePriority(setUpgradePriority(priority, 7)));

            let p = 0x050505;
            p = setConstructionPriority(p, 1);
            p = setUpgradePriority(p, 1);
            p = setProductionPriority(p, 1);
            assertEqual(1, getProductionPriority(p));
            assertEqual(1, getUpgradePriority(p));
            assertEqual(1, getConstructionPriority(p));
         }),
      );
}
