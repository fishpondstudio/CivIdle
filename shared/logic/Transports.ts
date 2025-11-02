import type { Material } from "../definitions/MaterialDefinitions";
import type { IPointData, Tile } from "../utilities/Helper";

export interface ITransportationDataV2 {
   id: number;
   fromXy: Tile;
   fromPosition: IPointData;
   toXy: Tile;
   toPosition: IPointData;
   ticksSpent: number;
   ticksRequired: number;
   resource: Material;
   amount: number;
   fuel: Material;
   fuelPerTick: number;
   fuelCurrentTick: number;
   hasEnoughFuel: boolean;
}

export const Transports: ITransportationDataV2[] = [];
