import type { GreatPerson } from "../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../shared/logic/Config";
import type { SavedGame } from "../../shared/logic/GameState";
import { getGrid } from "../../shared/logic/IntraTickCache";
import { ShortcutActions } from "../../shared/logic/Shortcut";
import { BuildingInputMode, ResourceImportOptions, makeBuilding } from "../../shared/logic/Tile";
import { forEach, isNullOrUndefined, pointToTile, tileToPoint } from "../../shared/utilities/Helper";
import { getConstructionPriority, getProductionPriority } from "./Global";

export function migrateSavedGame(save: SavedGame) {
   const grid = getGrid(save.current);
   grid.forEach((point) => {
      const xy = pointToTile(point);
      if (save.current.tiles.has(xy)) return;
      save.current.tiles.set(xy, {
         tile: xy,
         deposit: {},
         explored: false,
      });
   });
   if ("Skyscrapper" in save.current.unlockedTech) {
      delete save.current.unlockedTech.Skyscrapper;
      save.current.unlockedTech.Skyscraper = true;
   }

   save.current.tiles.forEach((tile, xy) => {
      if (!grid.isValid(tileToPoint(xy))) {
         save.current.tiles.delete(xy);
         return;
      }
      if (tile.building) {
         // @ts-expect-error
         if (tile.building.type === "Cathedral") {
            delete tile.building;
            return;
         }
         // @ts-expect-error
         if (tile.building.type === "DiaryFarm") {
            tile.building.type = "DairyFarm";
         }
         // @ts-expect-error
         if (tile.building.status === "paused") {
            tile.building.status = "building";
         }
         // @ts-expect-error
         if (tile.building.disabledInput) {
            // @ts-expect-error
            delete tile.building.disabledInput;
         }
         tile.tile = xy;
         if (isNullOrUndefined(tile.building.suspendedInput)) {
            tile.building.suspendedInput = new Map();
         }
         if (isNullOrUndefined(tile.building.inputMode)) {
            tile.building.inputMode = BuildingInputMode.Distance;
         }
         if (isNullOrUndefined(tile.building.maxInputDistance)) {
            tile.building.maxInputDistance = Number.POSITIVE_INFINITY;
         }
         if (isNullOrUndefined(tile.building.productionPriority)) {
            // @ts-expect-error
            tile.building.productionPriority = getProductionPriority(tile.building.priority);
         }
         if (isNullOrUndefined(tile.building.constructionPriority)) {
            // @ts-expect-error
            tile.building.constructionPriority = getConstructionPriority(tile.building.priority);
         }
         // @ts-expect-error
         delete tile.building.priority;
         if ("resourceImports" in tile.building && !("resourceImportOptions" in tile.building)) {
            // @ts-expect-error
            tile.building.resourceImportOptions = ResourceImportOptions.None;
         }
         if (!Config.Building[tile.building.type]) {
            delete tile.building;
            return;
         }
         tile.building = makeBuilding(tile.building);
         forEach(tile.building.resources, (res, amount) => {
            if (!Config.Resource[res] || !Number.isFinite(amount)) {
               delete tile.building!.resources[res];
            }
         });
      }
   });

   if (!save.current.transportationV2) {
      save.current.transportationV2 = [];
   }

   // @ts-expect-error
   if (save.current.transportation) {
      // @ts-expect-error
      save.current.transportation.forEach((ts) => {
         // @ts-expect-error
         ts.forEach((t) => {
            save.current.transportationV2.push({
               fromXy: t.fromXy,
               fromPosition: t.fromPosition,
               toXy: t.toXy,
               toPosition: t.toPosition,
               id: t.id,
               ticksSpent: t.ticksSpent,
               ticksRequired: t.ticksRequired,
               resource: t.resource,
               amount: t.amount,
               fuel: t.fuel,
               fuelPerTick: t.fuelAmount,
               fuelCurrentTick: t.currentFuelAmount,
               hasEnoughFuel: t.hasEnoughFuel,
            });
         });
      });

      // @ts-expect-error
      delete save.current.transportation;
   }

   if (isNullOrUndefined(save.options.defaultProductionPriority)) {
      // @ts-expect-error
      save.options.defaultProductionPriority = getProductionPriority(save.options.defaultPriority);
   }
   if (isNullOrUndefined(save.options.defaultConstructionPriority)) {
      // @ts-expect-error
      save.options.defaultConstructionPriority = getConstructionPriority(save.options.defaultPriority);
   }
   if (isNullOrUndefined(save.options.chatChannels) || save.options.chatChannels.size === 0) {
      save.options.chatChannels = new Set();
      // @ts-expect-error
      if (save.options.chatSendChannel) {
         // @ts-expect-error
         save.options.chatChannels.add(save.options.chatSendChannel);
      } else {
         save.options.chatChannels.add("en");
      }
   }
   // @ts-expect-error
   delete save.options.buildingColors.Cathedral;
   // @ts-expect-error
   delete save.options.buildingDefaults.Cathedral;
   forEach(save.options.greatPeople, (k, v) => {
      if (!Config.GreatPerson[k]) {
         delete save.options.greatPeople[k];
      }
   });
   forEach(save.options.shortcuts, (k) => {
      if (!(k in ShortcutActions)) {
         delete save.options.shortcuts[k];
      }
   });
   // @ts-expect-error
   delete save.options.chatSendChannel;
   // @ts-expect-error
   delete save.options.chatReceiveChannel;
   // @ts-expect-error
   delete save.options.defaultPriority;
   forEach(save.options.buildingDefaults, (building, d) => {
      forEach(d, (k, v) => {
         if (isNullOrUndefined(v)) {
            delete d[k];
         }
      });
   });
   if (isNullOrUndefined(save.options.greatPeopleChoicesV2)) {
      save.options.greatPeopleChoicesV2 = [];
   }
   if ("greatPeopleChoices" in save.options) {
      (save.options.greatPeopleChoices as GreatPerson[][]).forEach((c) => {
         save.options.greatPeopleChoicesV2.push({ choices: c, amount: 1 });
      });
      delete save.options.greatPeopleChoices;
   }
   if ("greatPeopleChoices" in save.current) {
      (save.current.greatPeopleChoices as GreatPerson[][]).forEach((c) => {
         save.current.greatPeopleChoicesV2.push({ choices: c, amount: 1 });
      });
      delete save.current.greatPeopleChoices;
   }
}
