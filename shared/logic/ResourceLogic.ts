import type { Building } from "../definitions/BuildingDefinitions";
import type { Deposit, Resource } from "../definitions/ResourceDefinitions";
import { type Tile, forEach, reduceOf } from "../utilities/Helper";
import type { PartialTabulate } from "../utilities/TypeDefinitions";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import { Tick } from "./TickLogic";

export function getResourceAmount(res: Resource, gs: GameState): number {
   return (
      Tick.current.resourcesByTile[res]?.reduce((prev, curr) => {
         const amount = gs.tiles.get(curr)?.building?.resources[res];
         if (amount && Number.isFinite(amount)) {
            return prev + amount;
         }
         return prev;
      }, 0) ?? 0
   );
}

export function trySpendResources(resources: PartialTabulate<Resource>, gs: GameState): boolean {
   let res: Resource;

   for (res in resources) {
      const amount = resources[res] ?? 0;
      if (getResourceAmount(res, gs) < amount) {
         return false;
      }
   }

   for (res in resources) {
      let amount = resources[res] ?? 0;
      const buildings = Tick.current.resourcesByTile[res] ?? [];
      buildings.sort((a, b) => {
         return (
            (gs.tiles.get(a)?.building?.resources[res] ?? 0) -
            (gs.tiles.get(b)?.building?.resources[res] ?? 0)
         );
      });
      for (const xy of buildings) {
         const building = gs.tiles.get(xy)?.building;
         if (!building) {
            continue;
         }
         const amountInStorage = building.resources[res] ?? 0;
         if (amountInStorage >= amount) {
            building.resources[res]! -= amount;
            return true;
         }
         amount -= amountInStorage;
         building.resources[res] = 0;
         if (amount <= 0) {
            break;
         }
      }
      console.error(`trySpendResource: Res = ${res}, Amount = ${amount}`);
   }
   return false;
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
      (prev, res, amount) => prev + (Config.Resource[res].canPrice ? Config.ResourcePrice[res]! * amount : 0),
      0,
   );
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
