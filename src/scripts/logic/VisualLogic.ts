import type { Texture } from "pixi.js";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import type { City } from "../../../shared/definitions/CityDefinitions";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import type { NotProducingReason } from "../../../shared/logic/TickLogic";

export function getBuildingTexture(b: Building, textures: Record<string, Texture>, city: City) {
   return textures[`Building${b}_${city}`] ?? textures[`Building${b}`];
}

export function getNotProducingTexture(reason: NotProducingReason, textures: Record<string, Texture>) {
   switch (reason) {
      case "NotEnoughResources":
         return textures.NotEnoughResources;
      case "NotEnoughWorkers":
         return textures.NotEnoughWorkers;
      case "StorageFull":
         return textures.StorageFull;
      default:
         return textures.NotProducingGeneral;
   }
}

export function getTileTexture(r: Resource, textures: Record<string, Texture>) {
   return textures[`Tile${r}`];
}
