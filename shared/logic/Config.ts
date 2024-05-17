import { BuildingDefinitions, type Building } from "../definitions/BuildingDefinitions";
import { CityDefinitions } from "../definitions/CityDefinitions";
import { GreatPersonDefinitions } from "../definitions/GreatPersonDefinitions";
import { ResourceDefinitions, type Resource } from "../definitions/ResourceDefinitions";
import { TechAgeDefinitions, TechDefinitions, type Tech, type TechAge } from "../definitions/TechDefinitions";
import { TraditionDefinitions } from "../definitions/TraditionDefinitions";
import { UpgradeDefinitions } from "../definitions/UpgradeDefinitions";
import { deepFreeze } from "../utilities/Helper";
import type { PartialTabulate } from "../utilities/TypeDefinitions";

const BuildingTier: PartialTabulate<Building> = {};
const BuildingTech: Partial<Record<Building, Tech>> = {};
const BuildingTechAge: Partial<Record<Building, TechAge>> = {};

const ResourceTier: PartialTabulate<Resource> = {};
const ResourcePrice: PartialTabulate<Resource> = {};
const ResourceTech: PartialTabulate<Resource> = {};

const BuildingHash: PartialTabulate<Building> = {};
const ResourceHash: PartialTabulate<Resource> = {};

export const Config = {
   Building: new BuildingDefinitions(),
   Resource: deepFreeze(new ResourceDefinitions()),
   GreatPerson: deepFreeze(new GreatPersonDefinitions()),
   City: deepFreeze(new CityDefinitions()),
   Tech: new TechDefinitions(),
   TechAge: deepFreeze(new TechAgeDefinitions()),
   Tradition: deepFreeze(new TraditionDefinitions()),
   Upgrade: deepFreeze(new UpgradeDefinitions()),
   BuildingTier,
   BuildingTech,
   BuildingTechAge,
   ResourceTier,
   ResourceTech,
   ResourcePrice,
   BuildingHash,
   ResourceHash,
} as const;
