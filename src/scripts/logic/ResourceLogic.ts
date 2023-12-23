import { Building } from "../definitions/BuildingDefinitions";
import { Resource } from "../definitions/ResourceDefinitions";
import { PartialTabulate } from "../definitions/TypeDefinitions";
import { forEach, reduceOf } from "../utilities/Helper";
import { Config } from "./Constants";
import { GameState } from "./GameState";
import { Tick } from "./TickLogic";

export function getResourceAmount(res: Resource, gs: GameState): number {
   return (
      Tick.current.resourcesByXy[res]?.reduce(
         (prev, curr) => prev + (gs.tiles[curr]?.building?.resources[res] ?? 0),
         0,
      ) ?? 0
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
      const buildings = Tick.current.resourcesByXy[res] ?? [];
      buildings.sort((a, b) => {
         return (gs.tiles[a]?.building?.resources[res] ?? 0) - (gs.tiles[b]?.building?.resources[res] ?? 0);
      });
      for (const xy of buildings) {
         const building = gs.tiles[xy]?.building;
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

export function getAmountInTransit(xy: string, res: Resource, gs: GameState) {
   return (
      gs.transportation[xy]?.reduce((prev, curr) => {
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
