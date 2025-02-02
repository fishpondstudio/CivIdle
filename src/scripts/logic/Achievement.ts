import type { TechAge } from "../../../shared/definitions/TechDefinitions";
import type { GameState } from "../../../shared/logic/GameState";
import { OnTechUnlocked } from "../../../shared/logic/Update";
import { SteamClient, isSteam } from "../rpc/SteamClient";

OnTechUnlocked.on((tech) => {
   if (!isSteam()) return;
   switch (tech) {
      case "Future": {
         SteamClient.unlockAchievement("Future");
         break;
      }
   }
});

export function checkAgeAchievements(currentAge: TechAge): void {
   if (!isSteam()) return;
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
      case "ColdWarAge": {
         SteamClient.unlockAchievement("ColdWar");
         break;
      }
      case "InformationAge": {
         SteamClient.unlockAchievement("Information");
         break;
      }
   }
}

export function checkRebirthAchievements(extraGP: number, gs: GameState): void {
   if (!isSteam()) return;
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
         case "Beijing": {
            SteamClient.unlockAchievement("MandateOfHeaven");
            break;
         }
         case "NewYork": {
            SteamClient.unlockAchievement("TheBigApple");
            break;
         }
         case "Babylon": {
            SteamClient.unlockAchievement("LionOfBabylon");
            break;
         }
         case "Kyoto": {
            SteamClient.unlockAchievement("Heian-kyo");
            break;
         }
         case "German": {
            SteamClient.unlockAchievement("EisernerKanzler");
            break;
         }
         case "English": {
            SteamClient.unlockAchievement("ThreeLions");
            break;
         }
      }
   }
}
