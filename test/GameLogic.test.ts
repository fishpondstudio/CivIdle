import { assert, test } from "vitest";
import type { TechAge } from "../shared/definitions/TechDefinitions";
import {
   getBuildingCost,
   getPowerRequired,
   getStorageFor,
   getTotalBuildingCost,
} from "../shared/logic/BuildingLogic";
import { Config } from "../shared/logic/Config";
import { calculateTierAndPrice } from "../shared/logic/Constants";
import { GameOptions, GameState, SavedGame } from "../shared/logic/GameState";
import { deserializeSave, serializeSave } from "../shared/logic/GameStateLogic";
import { initializeGameState } from "../shared/logic/InitializeGameState";
import { getBuyAmountRange, getTradePercentage } from "../shared/logic/PlayerTradeLogic";
import {
   getEligibleRank,
   getGreatPersonThisRunLevel,
   getTotalGreatPeopleUpgradeCost,
   getUpgradeCostFib,
   upgradeAllPermanentGreatPeople,
} from "../shared/logic/RebirthLogic";
import {
   addResourceTo,
   deductResourceFrom,
   getAvailableStorage,
   getResourcesValue,
} from "../shared/logic/ResourceLogic";
import {
   getAllPrerequisites,
   getBuildingUnlockAge,
   getBuildingsUnlockedBefore,
   getNextAge,
   getTechUnlockCostInAge,
   isAllTechUnlocked,
   isPrerequisiteOf,
} from "../shared/logic/TechLogic";
import { makeBuilding } from "../shared/logic/Tile";
import { fossilDeltaApply, fossilDeltaCreate } from "../shared/thirdparty/FossilDelta";
import {
   AccountLevel,
   UserAttributes,
   UserColors,
   type IAddTradeRequest,
   type IUser,
} from "../shared/utilities/Database";
import {
   HOUR,
   SECOND,
   base64ToBytes,
   bytesToBase64,
   forEach,
   pointToTile,
   round,
} from "../shared/utilities/Helper";

test("getBuildingCost", (t) => {
   assert.equal(10, getBuildingCost({ type: "CoalMine", level: 0 }).Brick);
   assert.equal(15, getBuildingCost({ type: "CoalMine", level: 1 }).Brick);
   assert.equal(22.5, getBuildingCost({ type: "CoalMine", level: 2 }).Brick);
});

test("getTotalBuildingCost", () => {
   assert.equal(10 + 15 + 22.5, getTotalBuildingCost({ type: "CoalMine" }, 0, 3).Brick);
   assert.equal(15, getTotalBuildingCost({ type: "CoalMine" }, 1, 2).Brick);
   assert.equal(15 + 22.5, getTotalBuildingCost({ type: "CoalMine" }, 1, 3).Brick);
});

test("getBuildingValue", () => {
   calculateTierAndPrice();
   assert.equal(0, getResourcesValue(getTotalBuildingCost({ type: "CoalMine" }, 0, 0)));
   assert.equal(4, Config.ResourcePrice.Brick);
   assert.equal(10 + 15 + 22.5, getTotalBuildingCost({ type: "CoalMine" }, 0, 3).Brick);
   // construction: { Iron: 1, Brick: 1, Lumber: 1 }, 8 + 4 + 4
   assert.equal(
      (8 + 4 + 4) * (10 + 15 + 22.5),
      getResourcesValue(getTotalBuildingCost({ type: "CoalMine" }, 0, 3)),
   );
});

test("TileBitPacking", () => {
   const tile = pointToTile({ x: 13, y: 14 });
   assert.equal(13, (tile >> 16) & 0xffff);
   assert.equal(14, tile & 0xffff);
});

test("fibonacci", () => {
   assert.equal(2, getUpgradeCostFib(2));
   assert.equal(3, getUpgradeCostFib(3));
   assert.equal(5, getUpgradeCostFib(4));
   assert.equal(8, getUpgradeCostFib(5));
});

test("getGreatPersonThisRunLevel", () => {
   assert.equal(0, getGreatPersonThisRunLevel(0));
   assert.equal(1, getGreatPersonThisRunLevel(1));
   assert.equal(1.5, getGreatPersonThisRunLevel(2));
   assert.equal(1.83, getGreatPersonThisRunLevel(3));
   assert.equal(2.08, getGreatPersonThisRunLevel(4));
});

test("getPowerRequired", () => {
   const building = makeBuilding({ type: "IronMiningCamp" });
   assert.equal(0, getPowerRequired(building));
   building.electrification = 1;
   assert.equal(10, getPowerRequired(building));
   building.electrification = 2;
   assert.equal(20, getPowerRequired(building));
   building.electrification = 3;
   assert.equal(40, getPowerRequired(building));
   building.electrification = 4;
   assert.equal(80, getPowerRequired(building));

   building.type = "CarFactory";
   building.electrification = 0;
   assert.equal(0, getPowerRequired(building));
   building.electrification = 1;
   assert.equal(10, getPowerRequired(building));
   building.electrification = 2;
   assert.equal(20, getPowerRequired(building));
   building.electrification = 3;
   assert.equal(30, getPowerRequired(building));
   building.electrification = 4;
   assert.equal(50, getPowerRequired(building));
});

test("deductResourceFrom", async () => {
   const s = new SavedGame();
   initializeGameState(s.current, s.options);
   const tile1 = s.current.tiles.get(pointToTile({ x: 10, y: 10 }));
   const tile2 = s.current.tiles.get(pointToTile({ x: 10, y: 11 }));
   const tile3 = s.current.tiles.get(pointToTile({ x: 10, y: 12 }));

   tile1!.building = makeBuilding({
      type: "LumberMill",
      level: 10,
      status: "completed",
      resources: { Lumber: 1000 },
   });
   tile2!.building = makeBuilding({
      type: "LumberMill",
      level: 10,
      status: "completed",
      resources: { Lumber: 1000 },
   });
   tile3!.building = makeBuilding({
      type: "LumberMill",
      level: 10,
      status: "completed",
      resources: { Lumber: 1000 },
   });

   const result1 = deductResourceFrom(
      "Lumber",
      1500,
      [pointToTile({ x: 10, y: 10 }), pointToTile({ x: 10, y: 11 }), pointToTile({ x: 10, y: 12 })],
      s.current,
   );
   assert.equal(result1.amount, 1500);
   assert.equal(tile1?.building.resources.Lumber, 0);
   assert.equal(tile2?.building.resources.Lumber, 500);
   assert.equal(tile3?.building.resources.Lumber, 1000);

   result1.rollback();
   assert.equal(tile1?.building.resources.Lumber, 1000);
   assert.equal(tile2?.building.resources.Lumber, 1000);
   assert.equal(tile3?.building.resources.Lumber, 1000);

   const result2 = deductResourceFrom(
      "Lumber",
      2500,
      [pointToTile({ x: 10, y: 10 }), pointToTile({ x: 10, y: 11 })],
      s.current,
   );

   assert.equal(result2.amount, 2000);
   assert.equal(tile1?.building.resources.Lumber, 0);
   assert.equal(tile2?.building.resources.Lumber, 0);
   assert.equal(tile3?.building.resources.Lumber, 1000);

   result2.rollback();
   assert.equal(tile1?.building.resources.Lumber, 1000);
   assert.equal(tile2?.building.resources.Lumber, 1000);
   assert.equal(tile3?.building.resources.Lumber, 1000);
});

test("addResourceTo", async () => {
   const s = new SavedGame();
   initializeGameState(s.current, s.options);
   const tile1 = s.current.tiles.get(pointToTile({ x: 10, y: 10 }));
   const tile2 = s.current.tiles.get(pointToTile({ x: 10, y: 11 }));
   const tile3 = s.current.tiles.get(pointToTile({ x: 10, y: 12 }));

   tile1!.building = makeBuilding({
      type: "LumberMill",
      level: 1,
      status: "completed",
      resources: {},
   });
   tile2!.building = makeBuilding({
      type: "LumberMill",
      level: 1,
      status: "completed",
      resources: {},
   });
   tile3!.building = makeBuilding({
      type: "LumberMill",
      level: 1,
      status: "completed",
      resources: {},
   });

   const { total } = getStorageFor(tile1!.tile, s.current);

   const result1 = addResourceTo(
      "Lumber",
      total * 2.5,
      [pointToTile({ x: 10, y: 10 }), pointToTile({ x: 10, y: 11 }), pointToTile({ x: 10, y: 12 })],
      s.current,
   );

   assert.equal(result1.amount, total * 2.5);
   assert.equal(tile1?.building.resources.Lumber, total);
   assert.equal(tile2?.building.resources.Lumber, total);
   assert.equal(tile3?.building.resources.Lumber, 0.5 * total);
   assert.equal(
      getAvailableStorage(
         [pointToTile({ x: 10, y: 10 }), pointToTile({ x: 10, y: 11 }), pointToTile({ x: 10, y: 12 })],
         s.current,
      ),
      0.5 * total,
   );

   result1.rollback();

   assert.equal(tile1?.building.resources.Lumber, 0);
   assert.equal(tile2?.building.resources.Lumber, 0);
   assert.equal(tile3?.building.resources.Lumber, 0);
   assert.equal(
      getAvailableStorage(
         [pointToTile({ x: 10, y: 10 }), pointToTile({ x: 10, y: 11 }), pointToTile({ x: 10, y: 12 })],
         s.current,
      ),
      3 * total,
   );

   const result2 = addResourceTo(
      "Lumber",
      total * 3.5,
      [pointToTile({ x: 10, y: 10 }), pointToTile({ x: 10, y: 11 }), pointToTile({ x: 10, y: 12 })],
      s.current,
   );

   assert.equal(result2.amount, total * 3);
   assert.equal(tile1?.building.resources.Lumber, total);
   assert.equal(tile2?.building.resources.Lumber, total);
   assert.equal(tile3?.building.resources.Lumber, total);
   assert.equal(
      getAvailableStorage(
         [pointToTile({ x: 10, y: 10 }), pointToTile({ x: 10, y: 11 }), pointToTile({ x: 10, y: 12 })],
         s.current,
      ),
      0,
   );

   result2.rollback();
   assert.equal(tile1?.building.resources.Lumber, 0);
   assert.equal(tile2?.building.resources.Lumber, 0);
   assert.equal(tile3?.building.resources.Lumber, 0);
   assert.equal(
      getAvailableStorage(
         [pointToTile({ x: 10, y: 10 }), pointToTile({ x: 10, y: 11 }), pointToTile({ x: 10, y: 12 })],
         s.current,
      ),
      total * 3,
   );
});

test("fossilDelta", async () => {
   const s = new SavedGame();
   s.current.tick = 1;
   const source = new TextEncoder().encode(serializeSave(s));
   s.current.tick = 10000;
   const dest = new TextEncoder().encode(serializeSave(s));
   const patch = fossilDeltaCreate(source, dest);
   assert.ok(patch.length < source.length, `patch ${patch.length} is smaller than source ${source.length}`);
   assert.ok(patch.length < dest.length, `patch ${patch.length} is smaller than dest ${dest.length}`);
   const newDest = fossilDeltaApply(source, patch, { verifyChecksum: true });
   assert.equal(dest.length, newDest.length);
   const newGameState = deserializeSave(new TextDecoder().decode(newDest));
   assert.equal(s.current.tick, newGameState.current.tick);
});

test("upgradeAllPermanentGreatPeople", () => {
   const options = new GameOptions();
   // 2, 4, 8
   options.greatPeople = {
      AdaLovelace: { level: 1, amount: 10 },
      Dido: { level: 1, amount: 0 },
      JamesWatt: { level: 1, amount: 14 },
   };
   upgradeAllPermanentGreatPeople(options);

   assert.equal(3, options.greatPeople.AdaLovelace?.level);
   assert.equal(4, options.greatPeople.AdaLovelace?.amount);

   assert.equal(1, options.greatPeople.Dido?.level);
   assert.equal(0, options.greatPeople.Dido?.amount);

   assert.equal(4, options.greatPeople.JamesWatt?.level);
   assert.equal(0, options.greatPeople.JamesWatt?.amount);
});

test("isPrerequisiteOf", () => {
   assert.equal(true, isPrerequisiteOf("Ballistics", "Rocketry"));
   assert.equal(true, isPrerequisiteOf("Refinery", "Rocketry"));
   assert.equal(true, isPrerequisiteOf("Electricity", "Rocketry"));
   assert.equal(false, isPrerequisiteOf("Enrichment", "Rocketry"));
   assert.equal(false, isPrerequisiteOf("GasPipeline", "Rocketry"));
});

test("getAllPrerequisites", () => {
   const prerequisites = getAllPrerequisites("Housing");
   assert.equal(5, prerequisites.size);
   assert.equal(true, prerequisites.has("Counting"));
   assert.equal(true, prerequisites.has("Masonry"));
   assert.equal(true, prerequisites.has("Fire"));
   assert.equal(true, prerequisites.has("StoneTools"));
   assert.equal(true, prerequisites.has("Logging"));
});

test("getTotalGreatPeopleUpgradeCost", () => {
   assert.equal(1 + 2 + 4, getTotalGreatPeopleUpgradeCost("AdaLovelace", 3));
   assert.equal(1 + 2 + 4 + 8, getTotalGreatPeopleUpgradeCost("AdaLovelace", 4));
   assert.equal(1 + 2 + 3, getTotalGreatPeopleUpgradeCost("Fibonacci", 3));
   assert.equal(1 + 2 + 3 + 5, getTotalGreatPeopleUpgradeCost("Fibonacci", 4));
});

test("isAllTechUnlocked", () => {
   const gs = new GameState();
   assert.isFalse(isAllTechUnlocked("StoneAge", gs));
   gs.unlockedTech.Fire = true;
   gs.unlockedTech.StoneTools = true;
   gs.unlockedTech.Logging = true;
   gs.unlockedTech.Shelter = true;
   gs.unlockedTech.Masonry = true;
   gs.unlockedTech.Counting = true;
   assert.isFalse(isAllTechUnlocked("StoneAge", gs));
   gs.unlockedTech.Farming = true;
   assert.isTrue(isAllTechUnlocked("StoneAge", gs));
});

test("getNextAge", () => {
   assert.equal("InformationAge" as TechAge, getNextAge("ColdWarAge"));
   assert.equal(null, getNextAge("InformationAge"));
});

test("getTechUnlockCostInAge", () => {
   forEach(Config.TechAge, (age, def) => {
      const [min, max] = getTechUnlockCostInAge(age);
      assert.isTrue(Number.isFinite(min), age);
      assert.isTrue(Number.isFinite(max), age);
      assert.isTrue(max > min, age);
   });
});

test("getBuildingsUnlockedBefore", () => {
   forEach(Config.TechAge, (age, def) => {
      getBuildingsUnlockedBefore(age).forEach((b) => {
         assert.isTrue(Config.TechAge[getBuildingUnlockAge(b)].idx < Config.TechAge[age].idx, b);
      });
   });
});

test("getEligibleRank", () => {
   const user: IUser = {
      userId: "userId",
      ip: "ip",
      handle: "handle",
      token: null,
      lastDisconnectAt: 0,
      lastGameTick: 0,
      totalPlayTime: 0,
      flag: "EARTH",
      color: UserColors.Default,
      lastHeartbeatAt: Date.now(),
      level: AccountLevel.Tribune,
      empireValues: [],
      tradeValues: [],
      attr: UserAttributes.None,
   };
   assert.equal(getEligibleRank(user), AccountLevel.Tribune);

   user.totalPlayTime = (200 * HOUR) / SECOND;
   user.empireValues = [{ value: 0, time: 0, tick: 0, totalGreatPeopleLevel: 200 }];
   assert.equal(getEligibleRank(user), AccountLevel.Tribune, "need at least Quaestor");

   user.level = AccountLevel.Quaestor;
   user.totalPlayTime = (200 * HOUR) / SECOND;
   user.empireValues = [{ value: 0, time: 0, tick: 0, totalGreatPeopleLevel: 200 }];
   assert.equal(getEligibleRank(user), AccountLevel.Aedile);

   user.totalPlayTime = (600 * HOUR) / SECOND;
   user.empireValues = [{ value: 0, time: 0, tick: 0, totalGreatPeopleLevel: 200 }];
   assert.equal(getEligibleRank(user), AccountLevel.Aedile);

   user.totalPlayTime = (200 * HOUR) / SECOND;
   user.empireValues = [{ value: 0, time: 0, tick: 0, totalGreatPeopleLevel: 600 }];
   assert.equal(getEligibleRank(user), AccountLevel.Aedile);

   user.totalPlayTime = (200 * HOUR) / SECOND;
   user.empireValues = [{ value: 0, time: 0, tick: 0, totalGreatPeopleLevel: 600 }];
   assert.equal(getEligibleRank(user), AccountLevel.Aedile);

   user.totalPlayTime = (500 * HOUR) / SECOND;
   user.empireValues = [{ value: 0, time: 0, tick: 0, totalGreatPeopleLevel: 500 }];
   assert.equal(getEligibleRank(user), AccountLevel.Praetor);

   user.level = AccountLevel.Praetor;
   user.totalPlayTime = (200 * HOUR) / SECOND;
   user.empireValues = [{ value: 0, time: 0, tick: 0, totalGreatPeopleLevel: 200 }];
   assert.equal(getEligibleRank(user), AccountLevel.Praetor);
});

test("getTradePercentage", () => {
   const trade: IAddTradeRequest = {
      buyAmount: 0,
      buyResource: "Car",
      sellAmount: 1000,
      sellResource: "Train",
   };
   const result = getBuyAmountRange(trade, 0.25);
   trade.buyAmount = result.min;
   assert.equal(round(getTradePercentage(trade), 2), 0.25);
   trade.buyAmount = result.max;
   assert.equal(round(getTradePercentage(trade), 2), -0.25);
});

test("bytesToBase64", () => {
   const data = new Uint8Array(1_000_000);
   for (let i = 0; i < data.length; i++) {
      data[i] = Math.floor(Math.random() * 256);
   }
   console.time("Encode");
   const base64 = bytesToBase64(data);
   console.timeEnd("Encode");

   console.time("Decode");
   const rt = base64ToBytes(base64);
   console.timeEnd("Decode");
   rt.forEach((v, i) => {
      assert.equal(v, data[i]);
   });
});
