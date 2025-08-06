import { BuildingDefinitions, type Building } from "../definitions/BuildingDefinitions";
import { CityDefinitions } from "../definitions/CityDefinitions";
import { GreatPersonDefinitions } from "../definitions/GreatPersonDefinitions";
import { IdeologyDefinitions } from "../definitions/IdeologyDefinitions";
import { ReligionDefinitions } from "../definitions/ReligionDefinitions";
import { ResourceDefinitions, type Resource } from "../definitions/ResourceDefinitions";
import { TechAgeDefinitions, TechDefinitions, type Tech, type TechAge } from "../definitions/TechDefinitions";
import { TraditionDefinitions } from "../definitions/TraditionDefinitions";
import { UpgradeDefinitions } from "../definitions/UpgradeDefinitions";
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
   Resource: new ResourceDefinitions(),
   GreatPerson: new GreatPersonDefinitions(),
   City: new CityDefinitions(),
   Tech: new TechDefinitions(),
   TechAge: new TechAgeDefinitions(),
   Tradition: new TraditionDefinitions(),
   Religion: new ReligionDefinitions(),
   Ideology: new IdeologyDefinitions(),
   Upgrade: new UpgradeDefinitions(),
   BuildingTier,
   BuildingTech,
   BuildingTechAge,
   ResourceTier,
   ResourceTech,
   ResourcePrice,
   BuildingHash,
   ResourceHash,
} as const;
