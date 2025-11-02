import type { Building } from "../definitions/BuildingDefinitions";
import { BuildingSpecial } from "../definitions/BuildingDefinitions";
import type { City } from "../definitions/CityDefinitions";
import type { Deposit, Material } from "../definitions/MaterialDefinitions";
import { IsDeposit, NoPrice } from "../definitions/MaterialDefinitions";
import type { Tech, TechAge } from "../definitions/TechDefinitions";
import { TimedBuildingUnlock } from "../definitions/TimedBuildingUnlock";
import type { Upgrade } from "../definitions/UpgradeDefinitions";
import {
   forEach,
   formatHMS,
   formatNumber,
   isEmpty,
   keysOf,
   mapSafeAdd,
   numberToRoman,
   reduceOf,
   round,
   sizeOf,
} from "../utilities/Helper";
import type { PartialTabulate } from "../utilities/TypeDefinitions";
import {
   getBuildingCost,
   getBuildingDescription,
   getWonderBaseBuilderCapacity,
   isSpecialBuilding,
   isWorldOrNaturalWonder,
   isWorldWonder,
} from "./BuildingLogic";
import { Config } from "./Config";
import { getBuildingsThatProduce } from "./ResourceLogic";
import { getAgeForTech } from "./TechLogic";

export const SAVE_FILE_VERSION = 1;
export const SAVE_KEY = "CivIdle";
export const MAX_OFFLINE_PRODUCTION_SEC = 60 * 60 * 4;
export const SCIENCE_VALUE = 0.2;
export const TRADE_CANCEL_REFUND_PERCENT = 0.9;
export const MAX_CHAT_PER_CHANNEL = 200;
export const DISCORD_URL = "https://discord.com/invite/m5JWZtEKMZ";
export const BACKUP_RECOVERY_URL =
   "https://steamcommunity.com/app/2181940/discussions/0/7260435610010445264/";
export const ANTICHEAT_FAQ_URL = "https://steamcommunity.com/app/2181940/discussions/0/6629936675071563255/";
export const TRIBUNE_TRADE_VALUE_PER_MINUTE = 10000;
export const STEAM_PATCH_NOTES_URL = "https://store.steampowered.com/news/app/2181940";
export const SUPPORTER_PACK_URL = "https://store.steampowered.com/app/2788080/";
export const STEAM_GUIDE_URL = "https://steamcommunity.com/sharedfiles/filedetails/?id=3196523559";
export const MAX_TARIFF_RATE = 0.1;
export const OXFORD_SCIENCE_PER_UPGRADE = 5;
export const MARKET_DEFAULT_TRADE_COUNT = 5;
export const MAX_EXPLORER = 10;
export const EXPLORER_SECONDS = 60;
export const MANAGED_IMPORT_RANGE = 2;
export const DISABLE_PLAYER_TRADES = false;
export const MAX_TELEPORT = 10;
export const TELEPORT_SECONDS = 60;
export const MAX_PETRA_SPEED_UP = 16;
export const FESTIVAL_CONVERSION_RATE = 100;
export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
export const GOOGLE_PLAY_GAMES_CLIENT_ID =
   "242227196074-u9201vdqd82p0o0hvfg2metk3gl5ocro.apps.googleusercontent.com";
export const TOWER_BRIDGE_GP_PER_CYCLE = 3600;
export const EAST_INDIA_COMPANY_BOOST_PER_EV = 2000;
export const TRADE_TILE_BONUS = 5;
export const TRADE_TILE_NEIGHBOR_BONUS = 1;
export const TRADE_TILE_ALLY_BONUS = 2;

interface IRecipe {
   building: Building;
   input: PartialTabulate<Material>;
   output: PartialTabulate<Material>;
}

export function calculateTierAndPrice(log?: (val: string) => void) {
   forEach(IsDeposit, (k) => {
      Config.MaterialTier[k] = 1;
      const tech = getDepositUnlockTech(k);
      Config.MaterialPrice[k] = Math.round(
         Config.Tech[tech].column + Math.pow(Config.TechAge[getAgeForTech(tech)!].idx, 2),
      );
   });

   const allRecipes: IRecipe[] = [];

   let buildingHash = 0;

   forEach(Config.Building, (building, buildingDef) => {
      Config.BuildingHash[building] = buildingHash++;
      if (isEmpty(buildingDef.input)) {
         forEach(buildingDef.output, (res) => {
            if (!Config.MaterialTier[res]) {
               Config.MaterialTier[res] = 1;
            }
            if (!Config.MaterialPrice[res]) {
               const tech = getBuildingUnlockTechSlow(building);
               if (tech) {
                  Config.MaterialPrice[res] = 1 + Config.Tech[tech].column;
               } else {
                  Config.MaterialPrice[res] = 1;
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

      const tech = getBuildingUnlockTechSlow(building);
      if (tech) {
         forEach(buildingDef.input, (res) => {
            const deps = getResourceUnlockTechs(res);
            console.assert(
               deps.some((t) => t === tech || Config.Tech[t].column < Config.Tech[tech].column),
               `${building} (Input: ${res}): Expect ${deps.join(", ")} to be before ${tech}`,
            );
            // if (t) {
            //    console.assert(
            //       Config.Tech[t].column < Config.Tech[tech].column,
            //       `Input: Expect Unlock(${building}=${tech},${Config.Tech[tech].column}) > Unlock(${res}=${t},${Config.Tech[t].column})`,
            //    );
            // } else {
            //    console.error(
            //       `Input: Expect Unlock(${building}=${tech},${Config.Tech[tech].column}) > Unlock(${res}=${t},NotFound)`,
            //    );
            // }
            // console.assert(
            //    deps.some((t) => isPrerequisiteOf(t, tech)),
            //    `${res} (${deps.join(", ")}) is not a prerequisite of ${tech} (${building}'s input)`,
            // );
         });
         forEach(buildingDef.construction, (res) => {
            const deps = getResourceUnlockTechs(res);
            // console.assert(
            //    deps.some((t) => isPrerequisiteOf(t, tech)),
            //    `${res} (${deps.join(", ")}) is not a prerequisite of ${building}'s construction`,
            // );
            console.assert(
               deps.some((t) => t === tech || Config.Tech[t].column <= Config.Tech[tech].column),
               `${building} (Construction: ${res}): Expect ${deps.join(", ")} to be before ${tech}`,
            );
         });
      } else {
         if (
            buildingDef.special !== BuildingSpecial.HQ &&
            buildingDef.special !== BuildingSpecial.NaturalWonder
         ) {
            console.error(`Building: ${building} is not unlocked by any tech!`);
         }
      }

      let key: Tech;
      const result: Tech[] = [];
      for (key in Config.Tech) {
         if (Config.Tech[key].unlockBuilding?.includes(building)) {
            result.push(key);
         }
      }
      console.assert(
         result.length <= 1,
         `Building ${building} should only be unlocked by one tech (${result.join(",")})`,
      );
   });

   forEach(Config.Tech, (tech, techDef) => {
      techDef.unlockBuilding?.forEach((b) => {
         const techLevel = techDef.column + 1;
         if (Config.BuildingTech[b]) {
            throw new Error(`A building is unlocked by two techs: ${Config.BuildingTech[b]}, ${tech}`);
         }
         Config.BuildingTech[b] = tech;
         Config.BuildingTechAge[b] = getAgeForTech(tech)!;
         forEach(Config.Building[b].output, (res) => {
            if (Config.MaterialTech[res] && Config.MaterialTech[res]! > techLevel) {
               return;
            }
            Config.MaterialTech[res] = techLevel;
         });
         forEach(Config.City, (city, def) => {
            if (def.uniqueBuildings[b]) {
               console.error(`${city}'s unique building ${b} should not be unlocked by ${tech}`);
            }
         });
         console.assert(
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            !isEmpty(Config.Building[b].input) || !isEmpty(Config.Building[b].construction),
            `${b}: A building should have either 'input' or 'construction' defined`,
         );
      });
   });

   forEach(Config.City, (city, def) => {
      forEach(def.uniqueBuildings, (building, tech) => {
         Config.BuildingTech[building] = tech;
         Config.BuildingTechAge[building] = getAgeForTech(tech)!;
      });
   });

   forEach(Config.Upgrade, (upgrade, def) => {
      def.unlockBuilding?.forEach((building) => {
         if (def.tech) {
            Config.BuildingTech[building] = def.tech;
            Config.BuildingTechAge[building] = getAgeForTech(def.tech)!;
         } else {
            console.error(`${upgrade} contains unlockBuilding but does not contain tech!`);
         }
      });
      if (def.tech && !def.unlockBuilding) {
         console.error(`${upgrade} does not contain unlockBuilding but contains tech!`);
      }
   });

   forEach(TimedBuildingUnlock, (building, def) => {
      Config.BuildingTech[building] = def.tech;
   });

   const resourceTierDependency: Partial<Record<Material, Material>> = {};
   const buildingTierDependency: Partial<Record<Building, Material>> = {};

   while (sizeOf(Config.BuildingTier) < sizeOf(Config.Building)) {
      allRecipes.forEach(({ building, input, output }) => {
         let maxInputResourceTier = 0;
         let inputResourcesValue = 0;
         let maxInputResource: Material | null = null;
         const allInputResourcesHasTier = keysOf(input).every((r) => {
            const tier = Config.MaterialTier[r];
            const price = Config.MaterialPrice[r];
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
            let notPricedResourceValue = 0;
            forEach(output, (res, amount) => {
               if (res === "Science") {
                  // Science is internally valued at 0.5
                  notPricedResourceValue += amount * SCIENCE_VALUE;
                  return;
               }
               if (!Config.MaterialTier[res] || targetTier < Config.MaterialTier[res]!) {
                  const oldTier = Config.MaterialTier[res];
                  Config.MaterialTier[res] = targetTier;
                  if (maxInputResource) {
                     resourceTierDependency[res] = maxInputResource;
                  }
                  forEach(resourceTierDependency, (k, v) => {
                     if (v === res) {
                        delete resourceTierDependency[k];
                        delete Config.MaterialTier[k];
                        log?.(
                           `Resource Tier of ${k} is decided by ${res}, but its tier has changed from ${
                              oldTier ?? "?"
                           } to ${targetTier}`,
                        );
                     }
                  });
                  forEach(buildingTierDependency, (k, v) => {
                     if (v === res) {
                        delete buildingTierDependency[k];
                        delete Config.BuildingTier[k];
                        log?.(
                           `Building Tier of ${k} is decided by ${res}, but its tier has changed from ${
                              oldTier ?? "?"
                           } to ${targetTier}`,
                        );
                     }
                  });
               }
               allOutputAmount += amount;
            });
            if (!Config.BuildingTier[building] || targetTier > Config.BuildingTier[building]!) {
               Config.BuildingTier[building] = targetTier;
            }
            // const multiplier = 0.5 + Math.sqrt(sizeOf(input));
            const multiplier = 1.5 + 0.25 * sizeOf(input);
            forEach(output, (res) => {
               const price = Math.round(
                  (multiplier * inputResourcesValue - notPricedResourceValue) / allOutputAmount,
               );
               if (!Number.isFinite(price)) {
                  return;
               }
               if (!Config.MaterialPrice[res]) {
                  Config.MaterialPrice[res] = price;
                  return;
               }
               if (price > Config.MaterialPrice[res]!) {
                  log?.(
                     `Price of ${res} changed from ${Config.MaterialPrice[res]!} to ${price} by ${building}`,
                  );
                  Config.MaterialPrice[res] = price;
               }
            });
         }
      });
   }

   forEach(Config.BuildingTier, (building) => {
      if (isSpecialBuilding(building)) {
         Config.BuildingTier[building] = 0;
      }
   });

   Config.BuildingTier.CloneFactory = 8;
   Config.BuildingTier.CloneLab = 8;

   Config.MaterialTier.Koti = 8;
   Config.MaterialPrice.Koti = 10_000_000;

   let resourceHash = 0;
   forEach(Config.Material, (r) => {
      Config.MaterialHash[r] = resourceHash++;
      if (!NoPrice[r]) {
         console.assert(!!Config.MaterialTier[r], `Resource = ${r} does not have a tier`);
         console.assert(!!Config.MaterialPrice[r], `Resource = ${r} does not have a price`);
      } else {
         Config.MaterialPrice[r] = 1;
         Config.MaterialTier[r] = 1;
      }
   });

   const resourcesUsedByBuildings = new Map<Material, number>();
   forEach(Config.Building, (b, def) => {
      if (def.special === BuildingSpecial.NaturalWonder || def.special === BuildingSpecial.HQ) {
         if (def.max !== 0) {
            throw new Error(`Natural Wonder: ${b} should have max = 0`);
         }
      }
      forEach(def.input, (res) => {
         mapSafeAdd(resourcesUsedByBuildings, res, 1);
      });
      if (def.output.Science) {
         const multiplier = 1.5 + 0.25 * sizeOf(def.input);
         const inputValue = Math.round(
            multiplier *
               reduceOf(
                  def.input,
                  (prev, res, amount) => prev + (Config.MaterialPrice[res] ?? 0) * amount,
                  0,
               ),
         );
         const outputValue = Math.round(
            reduceOf(
               def.output,
               (prev, res, amount) =>
                  prev + (res === "Science" ? SCIENCE_VALUE : (Config.MaterialPrice[res] ?? 0)) * amount,
               0,
            ),
         );
         console.assert(
            inputValue === outputValue,
            `Expect ${b} Input Value: ${inputValue} == Output Value: ${outputValue}`,
         );
      }
   });

   const uniqueBuildings: Partial<Record<Building, City>> = {};

   forEach(Config.City, (city, def) => {
      forEach(def.uniqueBuildings, (k, v) => {
         if (uniqueBuildings[k]) {
            console.error(`Duplicated unique buildings ${k} found in ${uniqueBuildings[k]} and ${city}`);
            return;
         }
         uniqueBuildings[k] = city;
      });
   });

   const wonderCost: string[] = [];
   const resourcesUsedByWonder = new Map<Material, number>();
   keysOf(Config.Building)
      .filter((b) => isWorldWonder(b))
      .sort((a, b) => {
         const techA = getBuildingUnlockTechSlow(a);
         const techB = getBuildingUnlockTechSlow(b);
         if (techA && techB) {
            return Config.Tech[techA].column - Config.Tech[techB].column;
         }
         return 0;
      })
      .forEach((k) => {
         let value = 0;
         let cost = "";
         let totalAmount = 0;
         const baseBuilderCapacity = getWonderBaseBuilderCapacity(k);
         const wonderAge = getAgeForTech(getBuildingUnlockTechSlow(k)!)!;
         forEach(getBuildingCost({ type: k, level: 0 }), (res, amount) => {
            mapSafeAdd(resourcesUsedByWonder, res, 1);
            const tech = getOrderedTechThatProduce(res);
            const resourceAge = getAgeForTech(tech[0])!;
            totalAmount += amount;
            const ageDiff = Config.TechAge[wonderAge].idx - Config.TechAge[resourceAge].idx;
            const ageDiffIndicator: string[] = [];
            for (let i = 0; i < ageDiff; i++) {
               ageDiffIndicator.push("*");
            }
            cost += `${ageDiffIndicator.join("")}${res}: ${formatNumber(amount)}, `;
            value += Config.MaterialPrice[res]! * amount;
         });
         cost = `${k.padEnd(25)} ${formatNumber(value, false).padEnd(15)}${formatHMS(
            (1000 * totalAmount) / baseBuilderCapacity,
            true,
         ).padEnd(10)}${cost}`;
         wonderCost.push(cost);
      });

   const resourcePrice: string[] = [];
   keysOf(Config.Material)
      .sort((a, b) => Config.MaterialTier[a]! - Config.MaterialTier[b]!)
      .filter((r) => !NoPrice[r])
      .forEach((r) => {
         resourcePrice.push(
            `${r.padEnd(20)}${numberToRoman(Config.MaterialTier[r]!)!.padEnd(10)}${String(
               Config.MaterialPrice[r]!,
            ).padEnd(10)}${String(resourcesUsedByWonder.get(r) ?? "0*").padEnd(10)}${
               resourcesUsedByBuildings.get(r) ?? "0*"
            }`,
         );
      });

   const boostedBuildings = new Set<Building>();
   const notBoostedBuildings: { building: Building; tech: Tech; age: TechAge }[] = [];
   forEach(Config.GreatPerson, (p, def) => {
      def.boost?.buildings.forEach((b) => {
         boostedBuildings.add(b);
      });
   });

   const buildingInputCost: string[] = [];
   keysOf(Config.Building)
      .sort((a, b) => Config.BuildingTier[a]! - Config.BuildingTier[b]!)
      .forEach((building) => {
         const def = Config.Building[building];
         if (isSpecialBuilding(building)) {
            return;
         }
         if (!boostedBuildings.has(building)) {
            const tech = getBuildingUnlockTechSlow(building)!;
            const age = getAgeForTech(tech)!;
            notBoostedBuildings.push({ building, tech, age });
         }
         let cost = 0;
         forEach(def.input, (res, amount) => {
            cost += Config.MaterialPrice[res]! * amount;
         });
         let construction = 0;
         forEach(def.construction, (res, amount) => {
            construction += Config.MaterialPrice[res]! * amount;
         });
         let constructionCost = "";
         if (construction > 0) {
            constructionCost = String(construction).padStart(10);
            if (construction !== cost) {
               constructionCost += "*";
            }
         }
         if (cost > 0) {
            buildingInputCost.push(
               `${def.name().padEnd(30)}${numberToRoman(Config.BuildingTier[building]!)!.padStart(10)}${round(
                  cost,
                  2,
               )
                  .toString()
                  .padStart(10)}${constructionCost}`,
            );
         }
      });

   notBoostedBuildings.sort((a, b) => Config.Tech[a.tech].column - Config.Tech[b.tech].column);

   // log?.("BuildingTier", sortTabulate(Config.BuildingTier));
   // log?.("BuildingTech", sortTabulate(Config.BuildingTech));
   // log?.("ResourceTier", sortTabulate(Config.ResourceTier));
   // log?.("ResourcePrice", sortTabulate(Config.ResourcePrice));
   // log?.("ResourceTech", sortTabulate(Config.ResourceTech));
   log?.(`>>>>>>>>>> ResourcePrice <<<<<<<<<<\n${resourcePrice.join("\n")}`);
   log?.(
      `>>>>>>>>>> WonderCost (${reduceOf(Config.Building, (prev, b, v) => (isWorldOrNaturalWonder(b) ? prev + 1 : prev), 0)}) <<<<<<<<<<\n${wonderCost.join("\n")}`,
   );
   log?.(
      `>>>>>>>>>> NotBoostedBuildings <<<<<<<<<<\n${notBoostedBuildings
         .map((a) => `${a.building.padEnd(25)}${a.tech.padEnd(30)}${a.age}`)
         .join("\n")}`,
   );
   log?.(`>>>>>>>>>> Building Input Cost <<<<<<<<<<\n${buildingInputCost.join("\n")}`);

   // keysOf(Config.Tech)
   //    .sort((a, b) => Config.Tech[a].column - Config.Tech[b].column)
   //    .forEach((tech) => {
   //       Config.Tech[tech].unlockBuilding?.forEach((b) => {
   //          if (!isSpecialBuilding(b)) {
   //             log?.(logBuildingFormula(b));
   //          }
   //       });
   //    });

   function logBuildingFormula(b: Building): string {
      const building = Config.Building[b];
      return [building.name(), ": ", getBuildingDescription(b)].join("");
   }
}

function getBuildingUnlockTechSlow(building: Building): Tech | null {
   let key: Tech;
   for (key in Config.Tech) {
      if (Config.Tech[key].unlockBuilding?.includes(building)) {
         return key;
      }
   }

   let city: City;
   for (city in Config.City) {
      const def = Config.City[city];
      if (def.uniqueBuildings[building]) {
         return def.uniqueBuildings[building]!;
      }
   }

   let upgrade: Upgrade;
   for (upgrade in Config.Upgrade) {
      const def = Config.Upgrade[upgrade];
      if (def.tech && def.unlockBuilding?.includes(building)) {
         return def.tech;
      }
   }

   const timedUnlock = TimedBuildingUnlock[building];
   if (timedUnlock) {
      return timedUnlock.tech;
   }

   return null;
}

function getResourceUnlockTechs(res: Material): Tech[] {
   const buildings = getBuildingsThatProduce(res);
   return buildings
      .flatMap((a) => {
         const tech = getBuildingUnlockTechSlow(a);
         if (!tech) {
            return [];
         }
         return [tech];
      })
      .sort((a, b) => Config.Tech[a].column - Config.Tech[b].column);
}

function getDepositUnlockTech(deposit: Deposit): Tech {
   let key: Tech;
   for (key in Config.Tech) {
      if (Config.Tech[key].revealDeposit?.includes(deposit)) {
         return key;
      }
   }
   throw new Error(`Deposit ${deposit} is not revealed by any technology, check TechDefinitions`);
}

function getOrderedTechThatProduce(res: Material): Tech[] {
   const tech: Tech[] = getBuildingsThatProduce(res).flatMap((b) => {
      const t = getBuildingUnlockTechSlow(b);
      return t ? [t] : [];
   });

   const result = Array.from(new Set(tech)).sort((a, b) => Config.Tech[a].column - Config.Tech[b].column);
   return result;
}
