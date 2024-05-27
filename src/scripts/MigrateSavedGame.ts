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
}
