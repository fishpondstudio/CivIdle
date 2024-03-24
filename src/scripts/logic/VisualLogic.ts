import type { Texture } from "pixi.js";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import type { City } from "../../../shared/definitions/CityDefinitions";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import type { NotProducingReason } from "../../../shared/logic/TickLogic";

export function getBuildingTexture(b: Building, textures: Record<string, Texture>, city: City) {
   return textures[`Building_${b}_${city}`] ?? textures[`Building_${b}`];
}

export function getNotProducingTexture(reason: NotProducingReason, textures: Record<string, Texture>) {
   switch (reason) {
      case "NotEnoughResources":
         return getTexture("Misc_NotEnoughResources", textures);
      case "NotEnoughWorkers":
         return getTexture("Misc_NotEnoughWorkers", textures);
      case "StorageFull":
         return getTexture("Misc_StorageFull", textures);
      case "NoPower":
         return getTexture("Misc_NoPower", textures);
      default:
         return getTexture("Misc_NotProducingGeneral", textures);
   }
}

export function getTileTexture(r: Resource, textures: Record<string, Texture>) {
   return getTexture(`Tile_${r}`, textures);
}

export function getTexture(key: string, textures: Record<string, Texture>) {
   const texture = textures[key];
   if (!texture) {
      throw new Error(`Cannot find texture ${key}`);
   }
   return textures[key];
}
