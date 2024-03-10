import type { Building } from "../definitions/BuildingDefinitions";
import { NoPrice, type Deposit, type Resource } from "../definitions/ResourceDefinitions";
import { Tech } from "../definitions/TechDefinitions";
import { forEach, reduceOf, type Tile } from "../utilities/Helper";
import type { PartialTabulate } from "../utilities/TypeDefinitions";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import { getBuildingUnlockTech } from "./TechLogic";
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
      const buildings = Tick.current.resourcesByTile.get(res) ?? [];
      buildings.sort((a, b) => {
         return (
            (gs.tiles.get(a.tile)?.building?.resources[res] ?? 0) -
            (gs.tiles.get(b.tile)?.building?.resources[res] ?? 0)
         );
      });
      for (const br of buildings) {
         const building = gs.tiles.get(br.tile)?.building;
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
      (prev, res, amount) => prev + (NoPrice[res] ? 0 : Config.ResourcePrice[res]! * amount),
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

export function getOrderedTechThatProduce(res: Resource): Tech[] {
   const tech: Tech[] = getBuildingsThatProduce(res).flatMap((b) => {
      const t = getBuildingUnlockTech(b);
      return t ? [t] : [];
   });

   const result = Array.from(new Set(tech)).sort((a, b) => Config.Tech[a].column - Config.Tech[b].column);
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
