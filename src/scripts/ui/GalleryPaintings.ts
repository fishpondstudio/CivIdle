import CafeTerraceAtNight from "../../images/Paintings/CafeTerraceAtNight.webp";
import GirlWithAPearlEarring from "../../images/Paintings/GirlWithAPearlEarring.webp";
import Sunflowers from "../../images/Paintings/Sunflowers.webp";
import TheJewishBride from "../../images/Paintings/TheJewishBride.webp";
import TheNightWatch from "../../images/Paintings/TheNightWatch.webp";
import TheStarryNight from "../../images/Paintings/TheStarryNight.webp";

interface IPainting {
   width: number;
   height: number;
   image: string;
   painter: Painter;
   theme: Theme;
   year: number;
}

export const Painters = {
   RembrandtVanRijn: () => "Rembrandt van Rijn",
   JohannesVermeer: () => "Johannes Vermeer",
   VincentVanGogh: () => "Vincent van Gogh",
} as const satisfies Record<string, () => string>;

export type Painter = keyof typeof Painters;

export const Themes = {
   Portrait: () => "Portrait",
   Landscape: () => "Landscape",
   DomesticScene: () => "Domestic Scene",
   StillLife: () => "Still Life",
   Maritime: () => "Maritime",
   Cityscape: () => "Cityscape",
   Abstract: () => "Abstract",
} as const satisfies Record<string, () => string>;

export type Theme = keyof typeof Themes;

export const Paintings = {
   Sunflowers: {
      width: 3,
      height: 4,
      image: Sunflowers,
      painter: "VincentVanGogh",
      theme: "StillLife",
      year: 1888,
   },
   CafeTerraceAtNight: {
      width: 4,
      height: 5,
      image: CafeTerraceAtNight,
      painter: "VincentVanGogh",
      theme: "Cityscape",
      year: 1888,
   },
   TheStarryNight: {
      width: 5,
      height: 4,
      image: TheStarryNight,
      painter: "VincentVanGogh",
      theme: "Landscape",
      year: 1889,
   },
   GirlWithAPearlEarring: {
      width: 5,
      height: 6,
      image: GirlWithAPearlEarring,
      painter: "JohannesVermeer",
      theme: "Portrait",
      year: 1665,
   },
   TheJewishBride: {
      width: 7,
      height: 5,
      image: TheJewishBride,
      painter: "RembrandtVanRijn",
      theme: "Portrait",
      year: 1667,
   },
   TheNightWatch: {
      width: 10,
      height: 8,
      image: TheNightWatch,
      painter: "RembrandtVanRijn",
      theme: "Portrait",
      year: 1642,
   },
} as const satisfies Record<string, IPainting>;
