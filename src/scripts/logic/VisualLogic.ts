import { Texture } from "pixi.js";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import type { City } from "../../../shared/definitions/CityDefinitions";
import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import { NotProducingReason } from "../../../shared/logic/TickLogic";

export function getBuildingTexture(b: Building, textures: Record<string, Texture>, city: City) {
   return textures[`Building_${b}_${city}`] ?? textures[`Building_${b}`];
}

export function getNotProducingTexture(reason: NotProducingReason, textures: Record<string, Texture>) {
   switch (reason) {
      case NotProducingReason.NotEnoughResources:
         return getTexture("Misc_NotEnoughResources", textures);
      case NotProducingReason.NotEnoughWorkers:
         return getTexture("Misc_NotEnoughWorkers", textures);
      case NotProducingReason.StorageFull:
         return getTexture("Misc_StorageFull", textures);
      case NotProducingReason.TurnedOff:
         return getTexture("Misc_TurnedOff", textures);
      case NotProducingReason.NotOnDeposit:
         return getTexture("Misc_NotProducingGeneral", textures);
      case NotProducingReason.NoPower:
         return getTexture("Misc_NoPower", textures);
      default:
         return Texture.EMPTY;
   }
}

export function getTileTexture(r: Material, textures: Record<string, Texture>) {
   return getTexture(`Tile_${r}`, textures);
}

export function getTexture(key: string, textures: Record<string, Texture>) {
   const texture = textures[key];
   if (!texture) {
      throw new Error(`Cannot find texture ${key}`);
   }
   return textures[key];
}
