import { IAddTradeRequest } from "../../../server/src/Database";
import { Resource } from "../definitions/ResourceDefinitions";
import { Config } from "./Constants";

export function getSellAmountRange(trade: IAddTradeRequest): [number, number] {
   const amount =
      (trade.buyAmount * (Config.ResourcePrice[trade.buyResource as Resource] ?? 0)) /
      (Config.ResourcePrice[trade.sellResource as Resource] ?? 0);
   return [Math.round(amount * 0.5), Math.round(amount * 1.5)];
}

export function isTradeValid(trade: IAddTradeRequest): boolean {
   if (trade.buyResource == trade.sellResource) {
      return false;
   }
   if (trade.buyAmount < 1) {
      return false;
   }
   const [min, max] = getSellAmountRange(trade);
   if (trade.sellAmount > max || trade.sellAmount < min) {
      return false;
   }
   return true;
}
