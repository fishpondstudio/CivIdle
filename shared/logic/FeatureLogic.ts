import type { GameState } from "./GameState";

export function hasFeature(f: GameFeature, gs: GameState): boolean {
   switch (f) {
      case GameFeature.BuildingProductionPriority:
         return !!gs.unlockedTech.Housing;
      case GameFeature.BuildingStockpileMode:
         return !!gs.unlockedTech.HorsebackRiding;
      case GameFeature.WarehouseUpgrade:
         return !!gs.unlockedTech.Machinery;
      case GameFeature.Electricity:
         return !!gs.unlockedTech.Electricity;
      case GameFeature.BuildingInputMode:
         return !!gs.unlockedTech.Herding;
      case GameFeature.WarehouseExtension:
         return !!gs.unlockedTech.Physics;
      case GameFeature.Festival:
         return !!gs.unlockedTech.Stateship;
      default:
         return false;
   }
}

export enum GameFeature {
   BuildingProductionPriority = 0,
   BuildingStockpileMode = 1,
   WarehouseUpgrade = 2,
   Electricity = 3,
   BuildingInputMode = 4,
   WarehouseExtension = 5,
   Festival = 6,
}
