import { clamp } from "../utilities/Helper";
import { Tick } from "./TickLogic";

export function getGreatPeopleAtReborn(): number {
   return clamp(Math.floor(Math.log(Tick.current.totalValue / 1e6) / Math.log(10)), 0, Infinity);
}
