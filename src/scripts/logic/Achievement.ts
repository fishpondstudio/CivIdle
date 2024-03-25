import type { TechAge } from "../../../shared/definitions/TechDefinitions";
import type { GameState } from "../../../shared/logic/GameState";
import { SteamClient, isSteam } from "../rpc/SteamClient";

export function checkAgeAchievements(currentAge: TechAge): void {
   if (!isSteam()) {
      return;
   }
   switch (currentAge) {
      case "BronzeAge": {
         SteamClient.unlockAchievement("Bronze");
         break;
      }
      case "IronAge": {
         SteamClient.unlockAchievement("Iron");
         break;
      }
      case "ClassicalAge": {
         SteamClient.unlockAchievement("Classical");
         break;
      }
      case "MiddleAge": {
         SteamClient.unlockAchievement("Medieval");
         break;
      }
      case "RenaissanceAge": {
         SteamClient.unlockAchievement("Renaissance");
         break;
      }
      case "IndustrialAge": {
         SteamClient.unlockAchievement("Industrial");
         break;
      }
      case "WorldWarAge": {
         SteamClient.unlockAchievement("WorldWars");
         break;
      }
   }
}

export function checkRebirthAchievements(extraGP: number, gs: GameState): void {
   if (extraGP >= 1) {
      switch (gs.city) {
         case "Rome": {
            SteamClient.unlockAchievement("PaxRomana");
            break;
         }
         case "Athens": {
            SteamClient.unlockAchievement("Olympian");
            break;
         }
         case "Memphis": {
            SteamClient.unlockAchievement("EyeOfHorus");
            break;
         }
      }
   }
}
