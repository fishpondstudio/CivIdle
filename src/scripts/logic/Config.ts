import { BuildingDefinitions, type Building } from "../definitions/BuildingDefinitions";
import { CityDefinitions } from "../definitions/CityDefinitions";
import { GreatPersonDefinitions } from "../definitions/GreatPersonDefinitions";
import { ResourceDefinitions, type Resource } from "../definitions/ResourceDefinitions";
import { TechAgeDefinitions, TechDefinitions } from "../definitions/TechDefinitions";
import type { PartialTabulate } from "../definitions/TypeDefinitions";
import { deepFreeze } from "../utilities/Helper";

const BuildingTier: PartialTabulate<Building> = {};
const BuildingTech: PartialTabulate<Building> = {};

const ResourceTier: PartialTabulate<Resource> = {};
const ResourcePrice: PartialTabulate<Resource> = {};
const ResourceTech: PartialTabulate<Resource> = {};

export const Config = {
   Building: new BuildingDefinitions(),
   Resource: new ResourceDefinitions(),
   GreatPerson: deepFreeze(new GreatPersonDefinitions()),
   City: deepFreeze(new CityDefinitions()),
   Tech: new TechDefinitions(),
   TechAge: deepFreeze(new TechAgeDefinitions()),
   BuildingTier,
   BuildingTech,
   ResourceTier,
   ResourceTech,
   ResourcePrice,
} as const;
