import AMothersDuty from "../../images/Paintings/AMothersDuty.webp";
import BroadwayBoogieWoogie from "../../images/Paintings/BroadwayBoogieWoogie.webp";
import CafeTerraceAtNight from "../../images/Paintings/CafeTerraceAtNight.webp";
import CompositionWithRedBlueAndYellow from "../../images/Paintings/CompositionWithRedBlueAndYellow.webp";
import GirlInAWhiteKimono from "../../images/Paintings/GirlInAWhiteKimono.webp";
import GirlWithAPearlEarring from "../../images/Paintings/GirlWithAPearlEarring.webp";
import GrayTree from "../../images/Paintings/GrayTree.webp";
import SelfPortrait from "../../images/Paintings/SelfPortrait.webp";
import StillLifeWithFlowersOnAMarbleSlab from "../../images/Paintings/StillLifeWithFlowersOnAMarbleSlab.webp";
import Sunflowers from "../../images/Paintings/Sunflowers.webp";
import TheAnatomyLessonOfDrNicolaesTulp from "../../images/Paintings/TheAnatomyLessonOfDrNicolaesTulp.webp";
import TheArtOfPainting from "../../images/Paintings/TheArtOfPainting.webp";
import TheBanquetOfTheOfficersOfTheStGeorgeMilitiaCompany from "../../images/Paintings/TheBanquetOfTheOfficersOfTheStGeorgeMilitiaCompany.webp";
import TheCourtyardOfAHouseInDelft from "../../images/Paintings/TheCourtyardOfAHouseInDelft.webp";
import TheCryingCrocodileTriesToCatchTheSun from "../../images/Paintings/TheCryingCrocodileTriesToCatchTheSun.webp";
import TheFeastOfSaintNicholas from "../../images/Paintings/TheFeastOfSaintNicholas.webp";
import TheHuntersInTheSnow from "../../images/Paintings/TheHuntersInTheSnow.webp";
import TheJewishBride from "../../images/Paintings/TheJewishBride.webp";
import TheLaughingCavalier from "../../images/Paintings/TheLaughingCavalier.webp";
import TheLittleStreet from "../../images/Paintings/TheLittleStreet.webp";
import TheMerryFamily from "../../images/Paintings/TheMerryFamily.webp";
import TheMilkmaid from "../../images/Paintings/TheMilkmaid.webp";
import TheNightWatch from "../../images/Paintings/TheNightWatch.webp";
import ThePotatoEaters from "../../images/Paintings/ThePotatoEaters.webp";
import TheSingelBridgeAtThePaleisstraatInAmsterdam from "../../images/Paintings/TheSingelBridgeAtThePaleisstraatInAmsterdam.webp";
import TheStarryNight from "../../images/Paintings/TheStarryNight.webp";
import ViewOfHaarlemWithBleachingFields from "../../images/Paintings/ViewOfHaarlemWithBleachingFields.webp";
import WheatFieldWithCrows from "../../images/Paintings/WheatFieldWithCrows.webp";
import WindmillAtWijkBijDuurstede from "../../images/Paintings/WindmillAtWijkBijDuurstede.webp";
import WomanHoldingABalance from "../../images/Paintings/WomanHoldingABalance.webp";
import { $t, L } from "../../../shared/utilities/i18n";

export interface IPainting {
   width: number;
   height: number;
   image: string;
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
      image: Sunflowers,
      painter: "VincentVanGogh",
      theme: "StillLife",
      year: 1888,
      masterpiece: false,
   },
   CafeTerraceAtNight: {
      name: () => $t(L.GalleryPaintingCafeTerraceAtNight),
      width: 4,
      height: 5,
      image: CafeTerraceAtNight,
      painter: "VincentVanGogh",
      theme: "LandscapeCityscape",
      year: 1888,
      masterpiece: false,
   },
   TheStarryNight: {
      name: () => $t(L.GalleryPaintingTheStarryNight),
      width: 5,
      height: 4,
      image: TheStarryNight,
      painter: "VincentVanGogh",
      theme: "LandscapeCityscape",
      year: 1889,
      masterpiece: true,
   },
   WheatFieldWithCrows: {
      name: () => $t(L.GalleryPaintingWheatFieldWithCrows),
      width: 8,
      height: 4,
      image: WheatFieldWithCrows,
      painter: "VincentVanGogh",
      theme: "LandscapeCityscape",
      year: 1890,
      masterpiece: false,
   },
   GirlWithAPearlEarring: {
      name: () => $t(L.GalleryPaintingGirlWithAPearlEarring),
      width: 5,
      height: 6,
      image: GirlWithAPearlEarring,
      painter: "JohannesVermeer",
      theme: "Portrait",
      year: 1665,
      masterpiece: true,
   },
   TheMilkmaid: {
      name: () => $t(L.GalleryPaintingTheMilkmaid),
      width: 5,
      height: 6,
      image: TheMilkmaid,
      painter: "JohannesVermeer",
      theme: "DomesticScene",
      year: 1658,
      masterpiece: false,
   },
   TheArtOfPainting: {
      name: () => $t(L.GalleryPaintingTheArtOfPainting),
      width: 4,
      height: 5,
      image: TheArtOfPainting,
      painter: "JohannesVermeer",
      theme: "DomesticScene",
      year: 1666,
      masterpiece: false,
   },
   TheAnatomyLessonOfDrNicolaesTulp: {
      name: () => $t(L.GalleryPaintingTheAnatomyLessonOfDrNicolaesTulp),
      width: 6,
      height: 4,
      image: TheAnatomyLessonOfDrNicolaesTulp,
      painter: "RembrandtVanRijn",
      theme: "Portrait",
      year: 1632,
      masterpiece: false,
   },
   TheJewishBride: {
      name: () => $t(L.GalleryPaintingTheJewishBride),
      width: 7,
      height: 5,
      image: TheJewishBride,
      painter: "RembrandtVanRijn",
      theme: "Portrait",
      year: 1667,
      masterpiece: false,
   },
   TheNightWatch: {
      name: () => $t(L.GalleryPaintingTheNightWatch),
      width: 8,
      height: 6,
      image: TheNightWatch,
      painter: "RembrandtVanRijn",
      theme: "Portrait",
      year: 1642,
      masterpiece: true,
   },
   TheFeastOfSaintNicholas: {
      name: () => $t(L.GalleryPaintingTheFeastOfSaintNicholas),
      width: 5,
      height: 6,
      image: TheFeastOfSaintNicholas,
      painter: "JanSteen",
      theme: "DomesticScene",
      year: 1665,
      masterpiece: true,
   },
   TheMerryFamily: {
      name: () => $t(L.GalleryPaintingTheMerryFamily),
      width: 5,
      height: 4,
      image: TheMerryFamily,
      painter: "JanSteen",
      theme: "DomesticScene",
      year: 1668,
      masterpiece: false,
   },
   CompositionWithRedBlueAndYellow: {
      name: () => $t(L.GalleryPaintingCompositionWithRedBlueAndYellow),
      width: 4,
      height: 4,
      image: CompositionWithRedBlueAndYellow,
      painter: "PietMondrian",
      theme: "Abstract",
      year: 1930,
      masterpiece: true,
   },
   BroadwayBoogieWoogie: {
      name: () => $t(L.GalleryPaintingBroadwayBoogieWoogie),
      width: 4,
      height: 4,
      image: BroadwayBoogieWoogie,
      painter: "PietMondrian",
      theme: "Abstract",
      year: 1943,
      masterpiece: false,
   },
   GrayTree: {
      name: () => $t(L.GalleryPaintingGrayTree),
      width: 4,
      height: 3,
      image: GrayTree,
      painter: "PietMondrian",
      theme: "Abstract",
      year: 1911,
      masterpiece: false,
   },
   TheLaughingCavalier: {
      name: () => $t(L.GalleryPaintingTheLaughingCavalier),
      width: 4,
      height: 5,
      image: TheLaughingCavalier,
      painter: "FransHals",
      theme: "Portrait",
      year: 1624,
      masterpiece: true,
   },
   TheBanquetOfTheOfficersOfTheStGeorgeMilitiaCompany: {
      name: () => $t(L.GalleryPaintingTheBanquetOfTheOfficersOfTheStGeorgeMilitiaCompany),
      width: 8,
      height: 4,
      image: TheBanquetOfTheOfficersOfTheStGeorgeMilitiaCompany,
      painter: "FransHals",
      theme: "Portrait",
      year: 1616,
      masterpiece: false,
   },
   ViewOfHaarlemWithBleachingFields: {
      name: () => $t(L.GalleryPaintingViewOfHaarlemWithBleachingFields),
      width: 4,
      height: 5,
      image: ViewOfHaarlemWithBleachingFields,
      painter: "JacobVanRuisdael",
      theme: "LandscapeCityscape",
      year: 1670,
      masterpiece: false,
   },
   WindmillAtWijkBijDuurstede: {
      name: () => $t(L.GalleryPaintingWindmillAtWijkBijDuurstede),
      width: 5,
      height: 4,
      image: WindmillAtWijkBijDuurstede,
      painter: "JacobVanRuisdael",
      theme: "LandscapeCityscape",
      year: 1670,
      masterpiece: false,
   },
   TheHuntersInTheSnow: {
      name: () => $t(L.GalleryPaintingTheHuntersInTheSnow),
      width: 6,
      height: 4,
      image: TheHuntersInTheSnow,
      painter: "PieterBruegelTheElder",
      theme: "LandscapeCityscape",
      year: 1565,
      masterpiece: false,
   },
   TheLittleStreet: {
      name: () => $t(L.GalleryPaintingTheLittleStreet),
      width: 4,
      height: 5,
      image: TheLittleStreet,
      painter: "JohannesVermeer",
      theme: "LandscapeCityscape",
      year: 1657,
      masterpiece: false,
   },
   SelfPortrait: {
      name: () => $t(L.GalleryPaintingSelfPortrait1889),
      width: 5,
      height: 6,
      image: SelfPortrait,
      painter: "VincentVanGogh",
      theme: "Portrait",
      year: 1889,
      masterpiece: false,
   },
   ThePotatoEaters: {
      name: () => $t(L.GalleryPaintingThePotatoEaters),
      width: 6,
      height: 4,
      image: ThePotatoEaters,
      painter: "VincentVanGogh",
      theme: "DomesticScene",
      year: 1885,
      masterpiece: false,
   },
   GirlInAWhiteKimono: {
      name: () => $t(L.GalleryPaintingGirlInAWhiteKimono),
      width: 4,
      height: 4,
      image: GirlInAWhiteKimono,
      painter: "GeorgeHendrikBreitner",
      theme: "DomesticScene",
      year: 1894,
      masterpiece: true,
   },
   StillLifeWithFlowersOnAMarbleSlab: {
      name: () => $t(L.GalleryPaintingStillLifeWithFlowersOnAMarbleSlab),
      width: 4,
      height: 5,
      image: StillLifeWithFlowersOnAMarbleSlab,
      painter: "RachelRuysch",
      theme: "StillLife",
      year: 1716,
      masterpiece: false,
   },
   TheCourtyardOfAHouseInDelft: {
      name: () => $t(L.GalleryPaintingTheCourtyardOfAHouseInDelft),
      width: 4,
      height: 5,
      image: TheCourtyardOfAHouseInDelft,
      painter: "PieterDeHooch",
      theme: "DomesticScene",
      year: 1658,
      masterpiece: true,
   },
   AMothersDuty: {
      name: () => $t(L.GalleryPaintingAMothersDuty),
      width: 6,
      height: 5,
      image: AMothersDuty,
      painter: "PieterDeHooch",
      theme: "DomesticScene",
      year: 1658,
      masterpiece: false,
   },
   TheCryingCrocodileTriesToCatchTheSun: {
      name: () => $t(L.GalleryPaintingTheCryingCrocodileTriesToCatchTheSun),
      width: 3,
      height: 4,
      image: TheCryingCrocodileTriesToCatchTheSun,
      painter: "KarelAppel",
      theme: "Abstract",
      year: 1956,
      masterpiece: false,
   },
   TheSingelBridgeAtThePaleisstraatInAmsterdam: {
      name: () => $t(L.GalleryPaintingTheSingelBridgeAtThePaleisstraatInAmsterdam),
      width: 6,
      height: 4,
      image: TheSingelBridgeAtThePaleisstraatInAmsterdam,
      painter: "GeorgeHendrikBreitner",
      theme: "LandscapeCityscape",
      year: 1898,
      masterpiece: false,
   },
   WomanHoldingABalance: {
      name: () => $t(L.GalleryPaintingWomanHoldingABalance),
      width: 5,
      height: 6,
      image: WomanHoldingABalance,
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
