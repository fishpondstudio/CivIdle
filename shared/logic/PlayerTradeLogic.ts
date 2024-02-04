import type { Resource } from "../definitions/ResourceDefinitions";
import { AccountLevel, type IAddTradeRequest, type ITrade, type IUser } from "../utilities/Database";
import { Config } from "./Config";

export interface IClientTrade extends ITrade {
   buyResource: Resource;
   sellResource: Resource;
}

export interface IClientAddTradeRequest extends IAddTradeRequest {
   buyResource: Resource;
   sellResource: Resource;
}

export function getBuyAmountRange(trade: IClientAddTradeRequest, user: IUser | null): [number, number] {
   const amount =
      (trade.sellAmount * (Config.ResourcePrice[trade.sellResource] ?? 0)) /
      (Config.ResourcePrice[trade.buyResource] ?? 0);
   const range = user ? getUserTradePriceRange(user) : 0.05;
   return [Math.round(amount * (1 - range)), Math.round(amount * (1 + range))];
}

export function getUserTradePriceRange(user: IUser): number {
   switch (user.level) {
      case AccountLevel.Quaestor:
         return 0.1;
      case AccountLevel.Aedile:
         return 0.15;
      case AccountLevel.Praetor:
         return 0.2;
      case AccountLevel.Consul:
         return 0.25;
      default:
         return 0.05;
   }
}
