import { IAddTradeRequest } from "../../../server/src/Database";
import { Resource } from "../definitions/ResourceDefinitions";
import { Config } from "./Constants";

export function getBuyAmountRange(trade: IAddTradeRequest): [number, number] {
   const amount =
      (trade.sellAmount * (Config.ResourcePrice[trade.sellResource as Resource] ?? 0)) /
      (Config.ResourcePrice[trade.buyResource as Resource] ?? 0);
   return [Math.round(amount * 0.5), Math.round(amount * 1.5)];
}
