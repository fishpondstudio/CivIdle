import { Building, BuildingDefinitions } from "../definitions/BuildingDefinitions";
import { CityDefinitions } from "../definitions/CityDefinitions";
import { GreatPersonDefinitions } from "../definitions/GreatPersonDefinitions";
import { DepositResources, Resource, ResourceDefinitions } from "../definitions/ResourceDefinitions";
import { Tech } from "../definitions/TechDefinitions";
import { PartialTabulate } from "../definitions/TypeDefinitions";
import { deepFreeze, forEach, isEmpty, keysOf, sizeOf, tabulateAdd } from "../utilities/Helper";
import { GameState } from "./GameState";
import { getBuildingUnlockTech, getDepositUnlockTech, getResourceUnlockTech } from "./TechLogic";

const BuildingTier: PartialTabulate<Building> = {};
const BuildingTech: PartialTabulate<Building> = {};

const ResourceTier: PartialTabulate<Resource> = {};
const ResourcePrice: PartialTabulate<Resource> = {};
const ResourceTech: PartialTabulate<Resource> = {};

export const Config = {
   Building: deepFreeze(new BuildingDefinitions()),
   Resource: deepFreeze(new ResourceDefinitions()),
   GreatPerson: deepFreeze(new GreatPersonDefinitions()),
   City: deepFreeze(new CityDefinitions()),
   BuildingTier,
   BuildingTech,
   ResourceTier,
   ResourceTech,
   ResourcePrice,
} as const;

interface IRecipe {
   building: Building;
   input: PartialTabulate<Resource>;
   output: PartialTabulate<Resource>;
}

export function calculateTierAndPrice(gs: GameState) {
   forEach(DepositResources, (k) => {
      Config.ResourceTier[k] = 1;
      Config.ResourcePrice[k] = 1 + Tech[getDepositUnlockTech(k)].column;
   });

   const allRecipes: IRecipe[] = [];

   forEach(Config.Building, (building, buildingDef) => {
      if (isEmpty(buildingDef.input)) {
         forEach(buildingDef.output, (res) => {
            if (!Config.ResourceTier[res]) {
               Config.ResourceTier[res] = 1;
            }
            if (!Config.ResourcePrice[res]) {
               const tech = getBuildingUnlockTech(building);
               if (tech) {
                  Config.ResourcePrice[res] = 1 + Tech[tech].column;
               } else {
                  Config.ResourcePrice[res] = 1;
               }
            }
         });
         if (!Config.BuildingTier[building]) {
            Config.BuildingTier[building] = 1;
         }
      }
      if (!isEmpty(buildingDef.input) || !isEmpty(buildingDef.output)) {
         allRecipes.push({
            building,
            input: buildingDef.input,
            output: buildingDef.output,
         });
      }

      const tech = getBuildingUnlockTech(building);
      if (tech) {
         forEach(buildingDef.input, (res) => {
            const t = getResourceUnlockTech(res);
            if (t) {
               console.assert(
                  Tech[t].column <= Tech[tech].column,
                  `${building}'s input resource ${res} is unlocked (${t}) later than the building itself (${tech})`
               );
            }
         });
      }

      let key: Tech;
      const result: Tech[] = [];
      for (key in Tech) {
         if (Tech[key].unlockBuilding?.includes(building)) {
            result.push(key);
         }
      }
      console.assert(
         result.length <= 1,
         `Building ${building} should only be unlocked by one tech (${result.join(",")})`
      );
   });

   forEach(Tech, (tech, techDef) => {
      techDef.unlockBuilding?.forEach((b) => {
         const techLevel = techDef.column + 1;
         Config.BuildingTech[b] = techLevel;
         forEach(Config.Building[b].output, (res) => {
            if (Config.ResourceTech[res] && Config.ResourceTech[res]! > techLevel) {
               return;
            }
            Config.ResourceTech[res] = techLevel;
         });
         console.assert(
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            !isEmpty(Config.Building[b].input) || !isEmpty(Config.Building[b].construction),
            `${b}: A building should have either 'input' or 'construction' defined`
         );
      });
      forEach(techDef.buildingModifier, (building, modifier) => {
         allRecipes.push({
            building,
            input: tabulateAdd(Config.Building[building].input, modifier.input ?? {}),
            output: tabulateAdd(Config.Building[building].output, modifier.output),
         });
      });
   });

   const resourceTierDependency: Partial<Record<Resource, Resource>> = {};
   const buildingTierDependency: Partial<Record<Building, Resource>> = {};

   while (sizeOf(Config.BuildingTier) < sizeOf(Config.Building)) {
      allRecipes.forEach(({ building, input, output }) => {
         let maxInputResourceTier = 0;
         let inputResourcesValue = 0;
         let maxInputResource: Resource | null = null;
         const allInputResourcesHasTier = keysOf(input).every((r) => {
            const tier = Config.ResourceTier[r];
            const price = Config.ResourcePrice[r];
            if (tier && tier > maxInputResourceTier) {
               maxInputResourceTier = tier;
               maxInputResource = r;
            }
            if (price) {
               inputResourcesValue += price * (input[r] ?? 0);
            }
            return tier && price;
         });
         if (allInputResourcesHasTier) {
            const targetTier = maxInputResourceTier + 1;
            let allOutputAmount = 0;
            forEach(output, (res, amount) => {
               if (!Config.ResourceTier[res] || targetTier < Config.ResourceTier[res]!) {
                  Config.ResourceTier[res] = targetTier;
                  if (maxInputResource) {
                     resourceTierDependency[res] = maxInputResource;
                  }
                  forEach(resourceTierDependency, (k, v) => {
                     if (v === res) {
                        delete resourceTierDependency[k];
                        delete Config.ResourceTier[k];
                        console.log(`Resource Tier of ${k} is decided by ${res}, but its tier has changed.`);
                     }
                  });
                  forEach(buildingTierDependency, (k, v) => {
                     if (v === res) {
                        delete buildingTierDependency[k];
                        delete Config.BuildingTier[k];
                        console.log(`Building Tier of ${k} is decided by ${res}, but its tier has changed.`);
                     }
                  });
               }
               allOutputAmount += amount;
            });
            if (!Config.BuildingTier[building] || targetTier > Config.BuildingTier[building]!) {
               Config.BuildingTier[building] = targetTier;
            }
            forEach(output, (res) => {
               const price = (2 * inputResourcesValue) / allOutputAmount;
               if (!Config.ResourcePrice[res] || price > Config.ResourcePrice[res]!) {
                  Config.ResourcePrice[res] = price;
               }
            });
         }
      });
   }

   forEach(Config.Resource, (r) => {
      if (Config.Resource[r].canPrice) {
         console.assert(Config.ResourceTier[r], `Resource = ${r} does not have a tier`);
         console.assert(Config.ResourcePrice[r], `Resource = ${r} does not have a price`);
      } else {
         Config.ResourcePrice[r] = 1;
         Config.ResourceTier[r] = 1;
      }
   });

   console.log("AllRecipes", allRecipes);
   console.log("BuildingTier", Config.BuildingTier);
   console.log("BuildingTech", Config.BuildingTech);
   console.log("ResourceTier", Config.ResourceTier);
   console.log("ResourcePrice", Config.ResourcePrice);
   console.log("ResourceTech", Config.ResourceTech);
}
