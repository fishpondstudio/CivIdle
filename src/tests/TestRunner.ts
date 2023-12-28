import { getBuildingCost, getTotalBuildingCost } from "../scripts/logic/BuildingLogic";
import { GameState } from "../scripts/logic/GameState";

const title = "background: #636e72; color: #fff;";

function test(name: string, func: () => void): void {
   console.log(`%c🧪 ${name} `, title);
   func();
}

function assertEqual<T>(expect: T, actual: T): void {
   console.log("   %s Expected: %O, Actual: %O ", expect !== actual ? "❌" : "✅", expect, actual);
}

export function RunTests(gs: GameState): void {
   test("getBuildingCost", () => {
      assertEqual(10, getBuildingCost({ type: "CoalMine", level: 0 }).Brick);
      assertEqual(15, getBuildingCost({ type: "CoalMine", level: 1 }).Brick);
      assertEqual(22.5, getBuildingCost({ type: "CoalMine", level: 2 }).Brick);
   });

   test("getTotalBuildingCost", () => {
      assertEqual(10 + 15 + 22.5, getTotalBuildingCost("CoalMine", 0, 3).Brick);
      assertEqual(15, getTotalBuildingCost("CoalMine", 1, 2).Brick);
      assertEqual(15 + 22.5, getTotalBuildingCost("CoalMine", 1, 3).Brick);
   });
}
