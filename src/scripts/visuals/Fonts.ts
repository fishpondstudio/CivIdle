import { getGameOptions } from "../../../shared/logic/GameStateLogic";

export const Fonts = {
   Cabin: "Cabin",
   Marcellus: "Marcellus",
   CabinSketch: "CabinSketch",
} as const;

export const FallbackFont = "Serif";

export function fontWithFallback(font: keyof typeof Fonts): string {
   if (getGameOptions().language === "ru") {
      return FallbackFont;
   }
   return font;
}
