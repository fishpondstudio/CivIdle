import { Config } from "../../shared/logic/Config";
import type { SavedGame } from "../../shared/logic/GameState";
import { BuildingInputMode, ResourceImportOptions, makeBuilding } from "../../shared/logic/Tile";
import { forEach, isNullOrUndefined } from "../../shared/utilities/Helper";
import { getConstructionPriority, getProductionPriority } from "./Global";

export function migrateSavedGame(save: SavedGame) {
   save.current.tiles.forEach((tile) => {
      if (tile.building) {
         // @ts-expect-error
         if (tile.building.status === "paused") {
            tile.building.status = "building";
         }
         if (!tile.building.disabledInput) {
            tile.building.disabledInput = new Set();
         }
         if (isNullOrUndefined(tile.building.inputMode)) {
            tile.building.inputMode = BuildingInputMode.Distance;
         }
         if (isNullOrUndefined(tile.building.maxInputDistance)) {
            tile.building.maxInputDistance = Infinity;
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
   if (save.options.chatSendChannel) {
      save.options.chatReceiveChannel[save.options.chatSendChannel] = true;
   }
   if (isNullOrUndefined(save.options.defaultProductionPriority)) {
      // @ts-expect-error
      save.options.defaultProductionPriority = getProductionPriority(save.options.defaultPriority);
   }
   if (isNullOrUndefined(save.options.defaultConstructionPriority)) {
      // @ts-expect-error
      save.options.defaultConstructionPriority = getConstructionPriority(save.options.defaultPriority);
   }
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
