import { IAddTradeRequest, ITrade } from "../../../server/src/Database";
import { Resource } from "../definitions/ResourceDefinitions";
import { Config } from "./Constants";

export interface IClientTrade extends ITrade {
   buyResource: Resource;
   sellResource: Resource;
}

export interface IClientAddTradeRequest extends IAddTradeRequest {
   buyResource: Resource;
   sellResource: Resource;
}

export function getBuyAmountRange(trade: IClientAddTradeRequest): [number, number] {
   const amount =
      (trade.sellAmount * (Config.ResourcePrice[trade.sellResource] ?? 0)) /
      (Config.ResourcePrice[trade.buyResource] ?? 0);
   return [Math.round(amount * 0.5), Math.round(amount * 1.5)];
}
