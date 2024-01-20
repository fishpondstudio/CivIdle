import type { IAddTradeRequest, ITrade } from "../../../shared/Database";
import type { Resource } from "../definitions/ResourceDefinitions";
import { Config } from "./Config";

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
