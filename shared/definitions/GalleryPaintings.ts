import type { GlobalMultipliers } from "../logic/TickLogic";
import { createTile, mapSafeAdd, tileToPoint, type Tile } from "../utilities/Helper";
import { $t, L } from "../utilities/i18n";

export interface IPainting {
   width: number;
   height: number;
   name: () => string;
   painter: Painter;
   theme: Theme;
   year: number;
   masterpiece: boolean;
}

export const Painters = {
   RembrandtVanRijn: () => $t(L.GalleryPainterRembrandtVanRijn),
   JohannesVermeer: () => $t(L.GalleryPainterJohannesVermeer),
   VincentVanGogh: () => $t(L.GalleryPainterVincentVanGogh),
   JanSteen: () => $t(L.GalleryPainterJanSteen),
   PietMondrian: () => $t(L.GalleryPainterPietMondrian),
   FransHals: () => $t(L.GalleryPainterFransHals),
   JacobVanRuisdael: () => $t(L.GalleryPainterJacobVanRuisdael),
   PieterBruegelTheElder: () => $t(L.GalleryPainterPieterBruegelTheElder),
   GeorgeHendrikBreitner: () => $t(L.GalleryPainterGeorgeHendrikBreitner),
   RachelRuysch: () => $t(L.GalleryPainterRachelRuysch),
   PieterDeHooch: () => $t(L.GalleryPainterPieterDeHooch),
   KarelAppel: () => $t(L.GalleryPainterKarelAppel),
} as const satisfies Record<string, () => string>;

export type Painter = keyof typeof Painters;

export const Themes = {
   Portrait: () => $t(L.GalleryThemePortrait),
   LandscapeCityscape: () => $t(L.GalleryThemeLandscapeCityscape),
   DomesticScene: () => $t(L.GalleryThemeDomesticScene),
   StillLife: () => $t(L.GalleryThemeStillLife),
   Abstract: () => $t(L.GalleryThemeAbstract),
} as const satisfies Record<string, () => string>;

export type Theme = keyof typeof Themes;

export const _Paintings = {
   Sunflowers: {
      name: () => $t(L.GalleryPaintingSunflowers),
      width: 3,
      height: 4,
      painter: "VincentVanGogh",
      theme: "StillLife",
      year: 1888,
      masterpiece: false,
   },
   CafeTerraceAtNight: {
      name: () => $t(L.GalleryPaintingCafeTerraceAtNight),
      width: 4,
      height: 5,
      painter: "VincentVanGogh",
      theme: "LandscapeCityscape",
      year: 1888,
      masterpiece: false,
   },
   TheStarryNight: {
      name: () => $t(L.GalleryPaintingTheStarryNight),
      width: 5,
      height: 4,
      painter: "VincentVanGogh",
      theme: "LandscapeCityscape",
      year: 1889,
      masterpiece: true,
   },
   WheatFieldWithCrows: {
      name: () => $t(L.GalleryPaintingWheatFieldWithCrows),
      width: 8,
      height: 4,
      painter: "VincentVanGogh",
      theme: "LandscapeCityscape",
      year: 1890,
      masterpiece: false,
   },
   GirlWithAPearlEarring: {
      name: () => $t(L.GalleryPaintingGirlWithAPearlEarring),
      width: 5,
      height: 6,
      painter: "JohannesVermeer",
      theme: "Portrait",
      year: 1665,
      masterpiece: true,
   },
   TheMilkmaid: {
      name: () => $t(L.GalleryPaintingTheMilkmaid),
      width: 5,
      height: 6,
      painter: "JohannesVermeer",
      theme: "DomesticScene",
      year: 1658,
      masterpiece: false,
   },
   TheArtOfPainting: {
      name: () => $t(L.GalleryPaintingTheArtOfPainting),
      width: 4,
      height: 5,
      painter: "JohannesVermeer",
      theme: "DomesticScene",
      year: 1666,
      masterpiece: false,
   },
   TheAnatomyLessonOfDrNicolaesTulp: {
      name: () => $t(L.GalleryPaintingTheAnatomyLessonOfDrNicolaesTulp),
      width: 6,
      height: 4,
      painter: "RembrandtVanRijn",
      theme: "Portrait",
      year: 1632,
      masterpiece: false,
   },
   TheJewishBride: {
      name: () => $t(L.GalleryPaintingTheJewishBride),
      width: 7,
      height: 5,
      painter: "RembrandtVanRijn",
      theme: "Portrait",
      year: 1667,
      masterpiece: false,
   },
   TheNightWatch: {
      name: () => $t(L.GalleryPaintingTheNightWatch),
      width: 8,
      height: 6,
      painter: "RembrandtVanRijn",
      theme: "Portrait",
      year: 1642,
      masterpiece: true,
   },
   TheFeastOfSaintNicholas: {
      name: () => $t(L.GalleryPaintingTheFeastOfSaintNicholas),
      width: 5,
      height: 6,
      painter: "JanSteen",
      theme: "DomesticScene",
      year: 1665,
      masterpiece: true,
   },
   TheMerryFamily: {
      name: () => $t(L.GalleryPaintingTheMerryFamily),
      width: 5,
      height: 4,
      painter: "JanSteen",
      theme: "DomesticScene",
      year: 1668,
      masterpiece: false,
   },
   CompositionWithRedBlueAndYellow: {
      name: () => $t(L.GalleryPaintingCompositionWithRedBlueAndYellow),
      width: 4,
      height: 4,
      painter: "PietMondrian",
      theme: "Abstract",
      year: 1930,
      masterpiece: true,
   },
   BroadwayBoogieWoogie: {
      name: () => $t(L.GalleryPaintingBroadwayBoogieWoogie),
      width: 4,
      height: 4,
      painter: "PietMondrian",
      theme: "Abstract",
      year: 1943,
      masterpiece: false,
   },
   GrayTree: {
      name: () => $t(L.GalleryPaintingGrayTree),
      width: 4,
      height: 3,
      painter: "PietMondrian",
      theme: "Abstract",
      year: 1911,
      masterpiece: false,
   },
   TheLaughingCavalier: {
      name: () => $t(L.GalleryPaintingTheLaughingCavalier),
      width: 4,
      height: 5,
      painter: "FransHals",
      theme: "Portrait",
      year: 1624,
      masterpiece: true,
   },
   TheBanquetOfTheOfficersOfTheStGeorgeMilitiaCompany: {
      name: () => $t(L.GalleryPaintingTheBanquetOfTheOfficersOfTheStGeorgeMilitiaCompany),
      width: 8,
      height: 4,
      painter: "FransHals",
      theme: "Portrait",
      year: 1616,
      masterpiece: false,
   },
   ViewOfHaarlemWithBleachingFields: {
      name: () => $t(L.GalleryPaintingViewOfHaarlemWithBleachingFields),
      width: 4,
      height: 5,
      painter: "JacobVanRuisdael",
      theme: "LandscapeCityscape",
      year: 1670,
      masterpiece: false,
   },
   WindmillAtWijkBijDuurstede: {
      name: () => $t(L.GalleryPaintingWindmillAtWijkBijDuurstede),
      width: 5,
      height: 4,
      painter: "JacobVanRuisdael",
      theme: "LandscapeCityscape",
      year: 1670,
      masterpiece: false,
   },
   TheHuntersInTheSnow: {
      name: () => $t(L.GalleryPaintingTheHuntersInTheSnow),
      width: 6,
      height: 4,
      painter: "PieterBruegelTheElder",
      theme: "LandscapeCityscape",
      year: 1565,
      masterpiece: false,
   },
   TheLittleStreet: {
      name: () => $t(L.GalleryPaintingTheLittleStreet),
      width: 4,
      height: 5,
      painter: "JohannesVermeer",
      theme: "LandscapeCityscape",
      year: 1657,
      masterpiece: false,
   },
   SelfPortrait: {
      name: () => $t(L.GalleryPaintingSelfPortrait1889),
      width: 5,
      height: 6,
      painter: "VincentVanGogh",
      theme: "Portrait",
      year: 1889,
      masterpiece: false,
   },
   ThePotatoEaters: {
      name: () => $t(L.GalleryPaintingThePotatoEaters),
      width: 6,
      height: 4,
      painter: "VincentVanGogh",
      theme: "DomesticScene",
      year: 1885,
      masterpiece: false,
   },
   GirlInAWhiteKimono: {
      name: () => $t(L.GalleryPaintingGirlInAWhiteKimono),
      width: 4,
      height: 4,
      painter: "GeorgeHendrikBreitner",
      theme: "DomesticScene",
      year: 1894,
      masterpiece: true,
   },
   StillLifeWithFlowersOnAMarbleSlab: {
      name: () => $t(L.GalleryPaintingStillLifeWithFlowersOnAMarbleSlab),
      width: 4,
      height: 5,
      painter: "RachelRuysch",
      theme: "StillLife",
      year: 1716,
      masterpiece: false,
   },
   TheCourtyardOfAHouseInDelft: {
      name: () => $t(L.GalleryPaintingTheCourtyardOfAHouseInDelft),
      width: 4,
      height: 5,
      painter: "PieterDeHooch",
      theme: "DomesticScene",
      year: 1658,
      masterpiece: true,
   },
   AMothersDuty: {
      name: () => $t(L.GalleryPaintingAMothersDuty),
      width: 6,
      height: 5,
      painter: "PieterDeHooch",
      theme: "DomesticScene",
      year: 1658,
      masterpiece: false,
   },
   TheCryingCrocodileTriesToCatchTheSun: {
      name: () => $t(L.GalleryPaintingTheCryingCrocodileTriesToCatchTheSun),
      width: 3,
      height: 4,
      painter: "KarelAppel",
      theme: "Abstract",
      year: 1956,
      masterpiece: false,
   },
   TheSingelBridgeAtThePaleisstraatInAmsterdam: {
      name: () => $t(L.GalleryPaintingTheSingelBridgeAtThePaleisstraatInAmsterdam),
      width: 6,
      height: 4,
      painter: "GeorgeHendrikBreitner",
      theme: "LandscapeCityscape",
      year: 1898,
      masterpiece: false,
   },
   WomanHoldingABalance: {
      name: () => $t(L.GalleryPaintingWomanHoldingABalance),
      width: 5,
      height: 6,
      painter: "JohannesVermeer",
      theme: "DomesticScene",
      year: 1664,
      masterpiece: false,
   },
} as const satisfies Record<string, IPainting>;

export type Painting = keyof typeof _Paintings;

export type PaintingPair = string;

export function makePaintingPair(a: Painting, b: Painting): PaintingPair {
   return [a, b].sort().join(":");
}

export function splitPaintingPair(pair: PaintingPair): [Painting, Painting] {
   return pair.split(":").map((id) => id as Painting) as [Painting, Painting];
}

export const Paintings = Object.fromEntries(
   Object.entries(_Paintings).sort((a, b) => a[1].height - b[1].height),
) as Record<Painting, IPainting>;

export interface IPaintingPlacement {
   x: number;
   y: number;
   width: number;
   height: number;
}

export function calculateEffects(placedPaintings: Map<Painting, IPaintingPlacement>) {
   const samePainterPairs = new Set<PaintingPair>();
   const sameCenturyPairs = new Set<PaintingPair>();
   const sameThemePairs = new Set<PaintingPair>();
   const sameSizePairs = new Set<PaintingPair>();
   const byPainters = new Map<Painter, number>();
   const byThemes = new Map<Theme, number>();
   let masterpieces = 0;
   placedPaintings.forEach(({ x, y, width, height }, _id) => {
      const id = _id as Painting;
      const me = Paintings[id];
      mapSafeAdd(byPainters, me.painter, 1);
      mapSafeAdd(byThemes, me.theme, 1);
      if (me.masterpiece) {
         ++masterpieces;
      }
      const adjacentRects = getAdjacentRects([id, { x, y, width, height }], placedPaintings);
      for (const [_otherId, otherRect] of adjacentRects) {
         const otherId = _otherId as Painting;
         const other = Paintings[otherId];
         if (me.painter === other.painter) {
            samePainterPairs.add(makePaintingPair(id, otherId));
         }
         if (Math.floor(me.year / 100) === Math.floor(other.year / 100)) {
            sameCenturyPairs.add(makePaintingPair(id, otherId));
         }
         if (me.theme === other.theme) {
            sameThemePairs.add(makePaintingPair(id, otherId));
         }
         if (me.width === other.width && me.height === other.height) {
            sameSizePairs.add(makePaintingPair(id, otherId));
         }
      }
   });
   return {
      samePainterPairs,
      sameCenturyPairs,
      sameThemePairs,
      sameSizePairs,
      byPainters,
      byThemes,
      masterpieces,
   };
}

interface IRect {
   x: number;
   y: number;
   width: number;
   height: number;
}

export function canFit<T extends string | number>(
   rect: IRect,
   existingRects: Map<T, IRect>,
   gridSize: number,
   excludeId?: T,
): boolean {
   if (rect.x < 0 || rect.x + rect.width > gridSize || rect.y < 0 || rect.y + rect.height > gridSize) {
      return false;
   }
   for (const [existingId, existingRect] of existingRects) {
      if (existingId === excludeId) {
         continue;
      }
      if (
         rect.x < existingRect.x + existingRect.width &&
         rect.x + rect.width > existingRect.x &&
         rect.y < existingRect.y + existingRect.height &&
         rect.y + rect.height > existingRect.y
      ) {
         return false;
      }
   }
   return true;
}

export function isTileUsed<T extends string | number>(
   tile: Tile,
   existingRects: Map<T, IRect>,
   excludeId?: T,
): boolean {
   const { x, y } = tileToPoint(tile);
   for (const [existingId, existingRect] of existingRects) {
      if (existingId === excludeId) {
         continue;
      }
      if (
         existingRect.x <= x &&
         existingRect.x + existingRect.width > x &&
         existingRect.y <= y &&
         existingRect.y + existingRect.height > y
      ) {
         return true;
      }
   }
   return false;
}

export function getAdjacentRects<T extends string | number>(
   rect: [T, IRect],
   existingRects: Map<T, IRect>,
): [T, IRect][] {
   const [currId, currRect] = rect;
   const result: [T, IRect][] = [];
   // Convert current rect to a set of tiles
   const currTiles = new Set<Tile>();
   for (let dx = 0; dx < currRect.width; dx++) {
      for (let dy = 0; dy < currRect.height; dy++) {
         currTiles.add(createTile(currRect.x + dx, currRect.y + dy));
      }
   }

   for (const [otherId, otherRect] of existingRects) {
      if (otherId === currId) continue;

      // For each edge tile of the other rect, check if it's adjacent
      let isAdjacent = false;
      outer: for (let dx = 0; dx < otherRect.width; dx++) {
         for (let dy = 0; dy < otherRect.height; dy++) {
            const ox = otherRect.x + dx;
            const oy = otherRect.y + dy;
            // Four sides: up, down, left, right
            const neighbors = [
               [ox + 1, oy],
               [ox - 1, oy],
               [ox, oy + 1],
               [ox, oy - 1],
            ];
            for (const [nx, ny] of neighbors) {
               if (currTiles.has(createTile(nx, ny))) {
                  isAdjacent = true;
                  break outer;
               }
            }
         }
      }
      if (isAdjacent) {
         result.push([otherId, otherRect]);
      }
   }
   return result;
}

export function getPaintingMultipliers(
   effects: ReturnType<typeof calculateEffects>,
   isFestival: boolean,
): Partial<Record<keyof GlobalMultipliers, number>> {
   let levelBoost = effects.sameSizePairs.size;
   let output = effects.samePainterPairs.size;
   const storage = effects.sameCenturyPairs.size;
   const worker = effects.sameThemePairs.size;
   if ((effects.byPainters.get("RembrandtVanRijn") ?? 0) >= 3) {
      output += isFestival ? 2 : 1;
   }
   if ((effects.byPainters.get("JohannesVermeer") ?? 0) >= 3) {
      output += isFestival ? 2 : 1;
   }
   if ((effects.byPainters.get("VincentVanGogh") ?? 0) >= 3) {
      output += isFestival ? 2 : 1;
   }
   if (effects.byPainters.size >= 5) {
      levelBoost += isFestival ? 2 : 1;
   }
   if (effects.byThemes.size >= 5) {
      levelBoost += isFestival ? 2 : 1;
   }
   if (effects.masterpieces >= 5) {
      levelBoost += isFestival ? 2 : 1;
   }
   return {
      output,
      levelBoost,
      storage,
      worker,
   };
}
