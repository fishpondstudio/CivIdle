import type { Building } from "../definitions/BuildingDefinitions";
import { NoPrice, type Deposit, type Material } from "../definitions/MaterialDefinitions";
import { clamp, forEach, reduceOf, safeAdd, type Tile } from "../utilities/Helper";
import type { PartialTabulate } from "../utilities/TypeDefinitions";
import { getStorageFor } from "./BuildingLogic";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import { Tick } from "./TickLogic";
import { hashTileAndRes } from "./Update";

export function getResourceAmount(res: Material): number {
   return Tick.current.resourceAmount.get(res) ?? 0;
}

export function getAmountInTransit(xy: Tile, res: Material) {
   return Tick.current.amountInTransit.get(hashTileAndRes(xy, res)) ?? 0;
}

export function getResourcesValue(resources: PartialTabulate<Material>): number {
   return reduceOf(
      resources,
      (prev, res, amount) => prev + (NoPrice[res] ? 0 : (Config.MaterialPrice[res] ?? 0) * amount),
      0,
   );
}

export function deductResourceFrom(
   res: Material,
   amount: number,
   tiles: Tile[],
   gs: GameState,
): { amount: number; rollback: () => void } {
   const rollbacks: (() => void)[] = [];
   let amountLeft = clamp(amount, 0, Number.POSITIVE_INFINITY);

   for (const tile of tiles) {
      const resources = gs.tiles.get(tile)?.building?.resources;
      if (!resources || !resources[res]) {
         continue;
      }
      if (resources[res] >= amountLeft) {
         const amountToDeduct = amountLeft;
         resources[res] -= amountToDeduct;
         rollbacks.push(() => {
            if (resources[res]) {
               resources[res] += amountToDeduct;
            } else {
               resources[res] = amountToDeduct;
            }
         });
         amountLeft = 0;
         break;
      }
      const amountToDeduct = resources[res];
      amountLeft -= amountToDeduct;
      resources[res] -= amountToDeduct;
      rollbacks.push(() => {
         if (resources[res]) {
            resources[res] += amountToDeduct;
         } else {
            resources[res] = amountToDeduct;
         }
      });
   }

   return {
      amount: clamp(amount - amountLeft, 0, Number.POSITIVE_INFINITY),
      rollback: () => rollbacks.forEach((r) => r()),
   };
}

export function addResourceTo(
   res: Material,
   amount: number,
   tiles: Tile[],
   gs: GameState,
): { amount: number; rollback: () => void } {
   amount = Number.isFinite(amount) ? amount : 0;
   const rollbacks: (() => void)[] = [];
   let amountLeft = clamp(amount, 0, Number.POSITIVE_INFINITY);

   for (const tile of tiles) {
      const resources = gs.tiles.get(tile)?.building?.resources;
      if (!resources) {
         continue;
      }

      const { total, used } = getStorageFor(tile, gs);
      const available = total - used;

      if (available >= amountLeft) {
         const amountToAdd = amountLeft;
         safeAdd(resources, res, amountToAdd);
         rollbacks.push(() => {
            safeAdd(resources, res, -amountToAdd);
         });
         amountLeft = 0;
         break;
      }

      const amountToAdd = available;
      amountLeft -= amountToAdd;
      safeAdd(resources, res, amountToAdd);
      rollbacks.push(() => {
         safeAdd(resources, res, -amountToAdd);
      });
   }

   return {
      amount: clamp(amount - amountLeft, 0, Number.POSITIVE_INFINITY),
      rollback: () => rollbacks.forEach((r) => r()),
   };
}

export function getAvailableStorage(tiles: Tile[], gs: GameState): number {
   let result = 0;
   for (const tile of tiles) {
      const { total, used } = getStorageFor(tile, gs);
      result += clamp(total - used, 0, Number.POSITIVE_INFINITY);
   }
   return result;
}

export function getBuildingsThatProduce(res: Material): Building[] {
   if (res === "Koti") {
      return ["SwissBank"];
   }
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

export function combineResources(resources: PartialTabulate<Material>[]): PartialTabulate<Material> {
   const result: PartialTabulate<Material> = {};
   resources.forEach((r) => {
      forEach(r, (res, amount) => {
         safeAdd(result, res, amount);
      });
   });
   return result;
}
