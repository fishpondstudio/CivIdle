import type { Resource } from "../definitions/ResourceDefinitions";
import type { IPointData, Tile } from "../utilities/Helper";

export interface ITransportationDataV2 {
   id: number;
   fromXy: Tile;
   fromPosition: IPointData;
   toXy: Tile;
   toPosition: IPointData;
   ticksSpent: number;
   ticksRequired: number;
   resource: Resource;
   amount: number;
   fuel: Resource;
   fuelPerTick: number;
   fuelCurrentTick: number;
   hasEnoughFuel: boolean;
}

export const Transports: ITransportationDataV2[] = [];
