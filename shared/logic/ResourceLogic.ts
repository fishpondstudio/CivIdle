import type { Building } from "../definitions/BuildingDefinitions";
import { NoPrice, type Deposit, type Resource } from "../definitions/ResourceDefinitions";
import { clamp, forEach, reduceOf, safeAdd, type Tile } from "../utilities/Helper";
import type { PartialTabulate } from "../utilities/TypeDefinitions";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import { Tick } from "./TickLogic";

export function getResourceAmount(res: Resource, gs: GameState): number {
   return (
      Tick.current.resourcesByTile.get(res)?.reduce((prev, curr) => {
         const amount = gs.tiles.get(curr.tile)?.building?.resources[res];
         if (amount && Number.isFinite(amount)) {
            return prev + amount;
         }
         return prev;
      }, 0) ?? 0
   );
}

export function getAmountInTransit(xy: Tile, res: Resource, gs: GameState) {
   return (
      gs.transportation.get(xy)?.reduce((prev, curr) => {
         return prev + (curr.resource === res ? curr.amount : 0);
      }, 0) ?? 0
   );
}

export function getResourcesValue(resources: PartialTabulate<Resource>): number {
   return reduceOf(
      resources,
      (prev, res, amount) => prev + (NoPrice[res] ? 0 : Config.ResourcePrice[res]! * amount),
      0,
   );
}

export function deductResourceFrom(
   res: Resource,
   amount: number,
   tiles: Tile[],
   gs: GameState,
): { amount: number; rollback: () => void } {
   const rollbacks: (() => void)[] = [];
   let amountLeft = amount;

   for (const tile of tiles) {
      const resources = gs.tiles.get(tile)?.building?.resources;
      if (!resources || !resources[res]) {
         continue;
      }
      if (resources[res]! >= amountLeft) {
         const amountToDeduct = amountLeft;
         resources[res]! -= amountToDeduct;
         rollbacks.push(() => {
            resources[res]! += amountToDeduct;
         });
         amountLeft = 0;
         break;
      }
      const amountToDeduct = resources[res]!;
      amountLeft -= amountToDeduct;
      resources[res]! -= amountToDeduct;
      rollbacks.push(() => {
         resources[res]! += amountToDeduct;
      });
   }

   return {
      amount: clamp(amount - amountLeft, 0, Number.POSITIVE_INFINITY),
      rollback: () => rollbacks.forEach((r) => r()),
   };
}

export function getBuildingsThatProduce(res: Resource): Building[] {
   const result: Building[] = [];
   forEach(Config.Building, (b, def) => {
      if (def.output[res]) {
         result.push(b);
      }
   });
   return result;
}

export function getRevealedDeposits(gs: GameState): Deposit[] {
   const deposits: Deposit[] = [];
   forEach(gs.unlockedTech, (tech) => {
      Config.Tech[tech].revealDeposit?.forEach((d) => deposits.push(d));
   });
   return deposits;
}

export function getTransportStat(gs: GameState) {
   let totalFuel = 0;
   let totalTransports = 0;
   let stalled = 0;
   gs.transportation.forEach((target) => {
      target.forEach((t) => {
         totalFuel += t.currentFuelAmount;
         ++totalTransports;
         if (!t.hasEnoughFuel) {
            ++stalled;
         }
      });
   });
   return { totalFuel, totalTransports, stalled };
}

export function combineResources(resources: PartialTabulate<Resource>[]): PartialTabulate<Resource> {
   const result: PartialTabulate<Resource> = {};
   resources.forEach((r) => {
      forEach(r, (res, amount) => {
         safeAdd(result, res, amount);
      });
   });
   return result;
}
