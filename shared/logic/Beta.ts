import type { Building } from "../definitions/BuildingDefinitions";
import type { City } from "../definitions/CityDefinitions";
import type { Material } from "../definitions/MaterialDefinitions";

export const BetaBuildings = new Set<Building>(["FusionFuelPlant", "FusionPowerPlant"]);
export const BetaMaterials = new Set<Material>(["FusionFuel"]);
export const BetaCities = new Set<City>(["Australian"]);
