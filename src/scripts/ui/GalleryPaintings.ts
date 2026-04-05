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
   RembrandtVanRijn: () => "Rembrandt van Rijn",
   JohannesVermeer: () => "Johannes Vermeer",
   VincentVanGogh: () => "Vincent van Gogh",
   JanSteen: () => "Jan Steen",
   PietMondrian: () => "Piet Mondrian",
   FransHals: () => "Frans Hals",
   JacobVanRuisdael: () => "Jacob van Ruisdael",
   PieterBruegelTheElder: () => "Pieter Bruegel the Elder",
   GeorgeHendrikBreitner: () => "George Hendrik Breitner",
   RachelRuysch: () => "Rachel Ruysch",
   PieterDeHooch: () => "Pieter de Hooch",
   KarelAppel: () => "Karel Appel",
} as const satisfies Record<string, () => string>;

export type Painter = keyof typeof Painters;

export const Themes = {
   Portrait: () => "Portrait",
   LandscapeCityscape: () => "Landscape/Cityscape",
   DomesticScene: () => "Domestic Scene",
   StillLife: () => "Still Life",
   Abstract: () => "Abstract",
} as const satisfies Record<string, () => string>;

export type Theme = keyof typeof Themes;

export const _Paintings = {
   Sunflowers: {
      name: () => "Sunflowers",
      width: 3,
      height: 4,
      image: Sunflowers,
      painter: "VincentVanGogh",
      theme: "StillLife",
      year: 1888,
      masterpiece: false,
   },
   CafeTerraceAtNight: {
      name: () => "Cafe Terrace at Night",
      width: 4,
      height: 5,
      image: CafeTerraceAtNight,
      painter: "VincentVanGogh",
      theme: "LandscapeCityscape",
      year: 1888,
      masterpiece: false,
   },
   TheStarryNight: {
      name: () => "The Starry Night",
      width: 5,
      height: 4,
      image: TheStarryNight,
      painter: "VincentVanGogh",
      theme: "LandscapeCityscape",
      year: 1889,
      masterpiece: true,
   },
   WheatFieldWithCrows: {
      name: () => "Wheat Field with Crows",
      width: 8,
      height: 4,
      image: WheatFieldWithCrows,
      painter: "VincentVanGogh",
      theme: "LandscapeCityscape",
      year: 1890,
      masterpiece: false,
   },
   GirlWithAPearlEarring: {
      name: () => "Girl with a Pearl Earring",
      width: 5,
      height: 6,
      image: GirlWithAPearlEarring,
      painter: "JohannesVermeer",
      theme: "Portrait",
      year: 1665,
      masterpiece: true,
   },
   TheMilkmaid: {
      name: () => "The Milkmaid",
      width: 5,
      height: 6,
      image: TheMilkmaid,
      painter: "JohannesVermeer",
      theme: "DomesticScene",
      year: 1658,
      masterpiece: false,
   },
   TheArtOfPainting: {
      name: () => "The Art of Painting",
      width: 4,
      height: 5,
      image: TheArtOfPainting,
      painter: "JohannesVermeer",
      theme: "DomesticScene",
      year: 1666,
      masterpiece: false,
   },
   TheAnatomyLessonOfDrNicolaesTulp: {
      name: () => "The Anatomy Lesson of Dr Nicolaes Tulp",
      width: 6,
      height: 4,
      image: TheAnatomyLessonOfDrNicolaesTulp,
      painter: "RembrandtVanRijn",
      theme: "Portrait",
      year: 1632,
      masterpiece: false,
   },
   TheJewishBride: {
      name: () => "The Jewish Bride",
      width: 7,
      height: 5,
      image: TheJewishBride,
      painter: "RembrandtVanRijn",
      theme: "Portrait",
      year: 1667,
      masterpiece: false,
   },
   TheNightWatch: {
      name: () => "The Night Watch",
      width: 8,
      height: 6,
      image: TheNightWatch,
      painter: "RembrandtVanRijn",
      theme: "Portrait",
      year: 1642,
      masterpiece: true,
   },
   TheFeastOfSaintNicholas: {
      name: () => "The Feast of Saint Nicholas",
      width: 5,
      height: 6,
      image: TheFeastOfSaintNicholas,
      painter: "JanSteen",
      theme: "DomesticScene",
      year: 1665,
      masterpiece: true,
   },
   TheMerryFamily: {
      name: () => "The Merry Family",
      width: 5,
      height: 4,
      image: TheMerryFamily,
      painter: "JanSteen",
      theme: "DomesticScene",
      year: 1668,
      masterpiece: false,
   },
   CompositionWithRedBlueAndYellow: {
      name: () => "Composition with Red, Blue, and Yellow",
      width: 4,
      height: 4,
      image: CompositionWithRedBlueAndYellow,
      painter: "PietMondrian",
      theme: "Abstract",
      year: 1930,
      masterpiece: true,
   },
   BroadwayBoogieWoogie: {
      name: () => "Broadway Boogie Woogie",
      width: 4,
      height: 4,
      image: BroadwayBoogieWoogie,
      painter: "PietMondrian",
      theme: "Abstract",
      year: 1943,
      masterpiece: false,
   },
   GrayTree: {
      name: () => "Gray Tree",
      width: 4,
      height: 3,
      image: GrayTree,
      painter: "PietMondrian",
      theme: "Abstract",
      year: 1911,
      masterpiece: false,
   },
   TheLaughingCavalier: {
      name: () => "The Laughing Cavalier",
      width: 4,
      height: 5,
      image: TheLaughingCavalier,
      painter: "FransHals",
      theme: "Portrait",
      year: 1624,
      masterpiece: true,
   },
   TheBanquetOfTheOfficersOfTheStGeorgeMilitiaCompany: {
      name: () => "The Banquet of the Officers of the St George Militia Company",
      width: 8,
      height: 4,
      image: TheBanquetOfTheOfficersOfTheStGeorgeMilitiaCompany,
      painter: "FransHals",
      theme: "Portrait",
      year: 1616,
      masterpiece: false,
   },
   ViewOfHaarlemWithBleachingFields: {
      name: () => "View of Haarlem with Bleaching Fields",
      width: 4,
      height: 5,
      image: ViewOfHaarlemWithBleachingFields,
      painter: "JacobVanRuisdael",
      theme: "LandscapeCityscape",
      year: 1670,
      masterpiece: false,
   },
   WindmillAtWijkBijDuurstede: {
      name: () => "Windmill at Wijk bij Duurstede",
      width: 5,
      height: 4,
      image: WindmillAtWijkBijDuurstede,
      painter: "JacobVanRuisdael",
      theme: "LandscapeCityscape",
      year: 1670,
      masterpiece: false,
   },
   TheHuntersInTheSnow: {
      name: () => "The Hunters in the Snow",
      width: 6,
      height: 4,
      image: TheHuntersInTheSnow,
      painter: "PieterBruegelTheElder",
      theme: "LandscapeCityscape",
      year: 1565,
      masterpiece: false,
   },
   TheLittleStreet: {
      name: () => "The Little Street",
      width: 4,
      height: 5,
      image: TheLittleStreet,
      painter: "JohannesVermeer",
      theme: "LandscapeCityscape",
      year: 1657,
      masterpiece: false,
   },
   SelfPortrait: {
      name: () => "Self Portrait (1889)",
      width: 5,
      height: 6,
      image: SelfPortrait,
      painter: "VincentVanGogh",
      theme: "Portrait",
      year: 1889,
      masterpiece: false,
   },
   ThePotatoEaters: {
      name: () => "The Potato Eaters",
      width: 6,
      height: 4,
      image: ThePotatoEaters,
      painter: "VincentVanGogh",
      theme: "DomesticScene",
      year: 1885,
      masterpiece: false,
   },
   GirlInAWhiteKimono: {
      name: () => "Girl in a White Kimono",
      width: 4,
      height: 4,
      image: GirlInAWhiteKimono,
      painter: "GeorgeHendrikBreitner",
      theme: "DomesticScene",
      year: 1894,
      masterpiece: true,
   },
   StillLifeWithFlowersOnAMarbleSlab: {
      name: () => "Still Life with Flowers on a Marble Slab",
      width: 4,
      height: 5,
      image: StillLifeWithFlowersOnAMarbleSlab,
      painter: "RachelRuysch",
      theme: "StillLife",
      year: 1716,
      masterpiece: false,
   },
   TheCourtyardOfAHouseInDelft: {
      name: () => "The Courtyard of a House in Delft",
      width: 4,
      height: 5,
      image: TheCourtyardOfAHouseInDelft,
      painter: "PieterDeHooch",
      theme: "DomesticScene",
      year: 1658,
      masterpiece: true,
   },
   AMothersDuty: {
      name: () => "A Mother's Duty",
      width: 6,
      height: 5,
      image: AMothersDuty,
      painter: "PieterDeHooch",
      theme: "DomesticScene",
      year: 1658,
      masterpiece: false,
   },
   TheCryingCrocodileTriesToCatchTheSun: {
      name: () => "The Crying Crocodile Tries to Catch the Sun",
      width: 3,
      height: 4,
      image: TheCryingCrocodileTriesToCatchTheSun,
      painter: "KarelAppel",
      theme: "Abstract",
      year: 1956,
      masterpiece: false,
   },
   TheSingelBridgeAtThePaleisstraatInAmsterdam: {
      name: () => "The Singel Bridge at the Paleisstraat in Amsterdam",
      width: 6,
      height: 4,
      image: TheSingelBridgeAtThePaleisstraatInAmsterdam,
      painter: "GeorgeHendrikBreitner",
      theme: "LandscapeCityscape",
      year: 1898,
      masterpiece: false,
   },
   WomanHoldingABalance: {
      name: () => "Woman Holding a Balance",
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
