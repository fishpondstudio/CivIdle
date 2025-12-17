import type { Building } from "../definitions/BuildingDefinitions";
import type { City } from "../definitions/CityDefinitions";
import type { Material } from "../definitions/MaterialDefinitions";

export const BetaBuildings = new Set<Building>(["AILab", "Cosmodrome"]);
export const BetaMaterials = new Set<Material>([]);
export const BetaCities = new Set<City>(["Russian", "Canadian"]);
