import type { PartialSet } from "../utilities/TypeDefinitions";
import { L, t } from "../utilities/i18n";
import type { Building } from "./BuildingDefinitions";
import type { IUnlockableMultipliers } from "./ITechDefinition";
import type { Deposit } from "./MaterialDefinitions";
import type { Tech } from "./TechDefinitions";

export class CityDefinitions {
   Rome: ICityDefinition = {
      name: () => t(L.Roman),
      deposits: {
         Water: 0.02,
         Copper: 0.02,
         Iron: 0.02,
         Wood: 0.02,
         Stone: 0.02,
         Gold: 0.02,
         Coal: 0.02,
         Oil: 0.02,
         Aluminum: 0.02,
         NaturalGas: 0.02,
         Uranium: 0.02,
      },
      size: 40,
      buildingNames: {
         Headquarter: () => t(L.RomanForum),
      },
      uniqueBuildings: {
         CircusMaximus: "CivilService",
         Colosseum: "Theater",
      },
      uniqueMultipliers: {},
      naturalWonders: { Alps: true, GrottaAzzurra: true },
      requireGreatPeopleLevel: 0,
      requireSupporterPack: false,
      festivalDesc: () => t(L.SaturnaliaV2),
      uniqueEffects: () => [],
   };
   Athens: ICityDefinition = {
      name: () => t(L.Greek),
      deposits: {
         Water: 0.01,
         Copper: 0.03,
         Iron: 0.01,
         Wood: 0.01,
         Stone: 0.04,
         Gold: 0.01,
         Coal: 0.03,
         Oil: 0.02,
         Aluminum: 0.02,
         NaturalGas: 0.03,
         Uranium: 0.01,
      },
      size: 40,
      buildingNames: {
         Headquarter: () => t(L.Acropolis),
      },
      uniqueBuildings: { StatueOfZeus: "Theater", Parthenon: "Democracy" },
      uniqueMultipliers: {},
      naturalWonders: { Aphrodite: true, Poseidon: true },
      requireGreatPeopleLevel: 5,
      requireSupporterPack: false,
      festivalDesc: () => t(L.Panathenaea),
      uniqueEffects: () => [],
   };
   Memphis: ICityDefinition = {
      name: () => t(L.Egyptian),
      deposits: {
         Water: 0.01,
         Copper: 0.01,
         Iron: 0.025,
         Wood: 0.025,
         Stone: 0.025,
         Gold: 0.025,
         Coal: 0.025,
         Oil: 0.01,
         Aluminum: 0.025,
         NaturalGas: 0.015,
         Uranium: 0.025,
      },
      size: 50,
      buildingNames: {
         Headquarter: () => t(L.TempleOfPtah),
      },
      uniqueBuildings: {
         AbuSimbel: "Housing",
         GreatSphinx: "Arithmetic",
      },
      uniqueMultipliers: {},
      naturalWonders: { NileRiver: true, MountSinai: true },
      requireGreatPeopleLevel: 10,
      requireSupporterPack: false,
      festivalDesc: () => t(L.OpetV2),
      uniqueEffects: () => [],
   };
   Beijing: ICityDefinition = {
      name: () => t(L.Chinese),
      deposits: {
         Water: 0.01,
         Copper: 0.02,
         Iron: 0.03,
         Wood: 0.01,
         Stone: 0.02,
         Gold: 0.03,
         Coal: 0.01,
         Oil: 0.02,
         Aluminum: 0.03,
         NaturalGas: 0.01,
         Uranium: 0.03,
      },
      size: 50,
      buildingNames: {
         Headquarter: () => t(L.HallOfSupremeHarmony),
      },
      uniqueBuildings: {
         GreatWall: "LandTrade",
         YellowCraneTower: "Geography",
         PorcelainTower: "Banking",
      },
      uniqueMultipliers: {},
      naturalWonders: { MountTai: true, YangtzeRiver: true },
      requireGreatPeopleLevel: 15,
      requireSupporterPack: false,
      festivalDesc: () => t(L.LunarNewYear),
      uniqueEffects: () => [],
   };
   NewYork: ICityDefinition = {
      name: () => t(L.American),
      deposits: {
         Water: 0.03,
         Copper: 0.03,
         Iron: 0.03,
         Wood: 0.03,
         Stone: 0.03,
         Gold: 0.03,
         Coal: 0.03,
         Oil: 0.03,
         Aluminum: 0.03,
         NaturalGas: 0.03,
         Uranium: 0.03,
      },
      size: 30,
      buildingNames: {
         Headquarter: () => t(L.TheWhiteHouse),
      },
      uniqueBuildings: {
         Broadway: "Railway",
         WallStreet: "Capitalism",
         TheMet: "RapidFire",
         ResearchFund: "UnitedNations",
      },
      uniqueMultipliers: {
         Skyscraper: {
            buildingMultiplier: {
               ResearchFund: { output: 1 },
            },
         },
      },
      naturalWonders: { Shenandoah: true, NiagaraFalls: true },
      requireGreatPeopleLevel: 20,
      requireSupporterPack: true,
      festivalDesc: () => t(L.Thanksgiving),
      uniqueEffects: () => [],
   };
   Babylon: ICityDefinition = {
      name: () => t(L.Babylonian),
      deposits: {
         Water: 0.01,
         Copper: 0.025,
         Iron: 0.03,
         Wood: 0.025,
         Stone: 0.03,
         Gold: 0.01,
         Coal: 0.025,
         Oil: 0.03,
         Aluminum: 0.025,
         NaturalGas: 0.025,
         Uranium: 0.01,
      },
      size: 35,
      buildingNames: {
         Headquarter: () => t(L.Babylonian),
      },
      uniqueBuildings: {
         WallOfBabylon: "LandTrade",
         TowerOfBabel: "Religion",
         ZigguratOfUr: "Theater",
      },
      uniqueMultipliers: {},
      naturalWonders: { EuphratesRiver: true, ZagrosMountains: true },
      requireGreatPeopleLevel: 30,
      requireSupporterPack: true,
      festivalDesc: () => t(L.Akitu),
      uniqueEffects: () => [],
   };
   Kyoto: ICityDefinition = {
      name: () => t(L.Japanese),
      deposits: {
         Water: 0.03,
         Copper: 0.025,
         Iron: 0.025,
         Wood: 0.03,
         Stone: 0.03,
         Gold: 0.025,
         Coal: 0.01,
         Oil: 0.01,
         Aluminum: 0.025,
         NaturalGas: 0.01,
         Uranium: 0.025,
      },
      size: 35,
      buildingNames: {
         Headquarter: () => t(L.ImperialPalace),
      },
      uniqueBuildings: {
         ItsukushimaShrine: "Religion",
         GoldenPavilion: "Theocracy",
         OsakaCastle: "Electricity",
      },
      uniqueMultipliers: {},
      naturalWonders: { Kanagawa: true, MountFuji: true },
      requireGreatPeopleLevel: 40,
      requireSupporterPack: true,
      festivalDesc: () => t(L.AoiMatsuri),
      uniqueEffects: () => [],
   };
   German: ICityDefinition = {
      name: () => t(L.German),
      deposits: {
         Water: 0.025,
         Copper: 0.025,
         Iron: 0.025,
         Wood: 0.01,
         Stone: 0.03,
         Gold: 0.025,
         Coal: 0.035,
         Oil: 0.025,
         Aluminum: 0.03,
         NaturalGas: 0.02,
         Uranium: 0.015,
      },
      size: 40,
      buildingNames: {
         Headquarter: () => t(L.Reichstag),
      },
      uniqueBuildings: {
         CologneCathedral: "HolyEmpire",
         Elbphilharmonie: "Skyscraper",
      },
      uniqueMultipliers: {},
      naturalWonders: { Zugspitze: true, RhineGorge: true, BlackForest: true },
      requireGreatPeopleLevel: 50,
      requireSupporterPack: true,
      festivalDesc: () => t(L.Oktoberfest),
      uniqueEffects: () => [],
   };

   English: ICityDefinition = {
      name: () => t(L.English),
      deposits: {
         Water: 0.02,
         Copper: 0.03,
         Iron: 0.025,
         Wood: 0.03,
         Stone: 0.03,
         Gold: 0.02,
         Coal: 0.02,
         Oil: 0.02,
         Aluminum: 0.03,
         NaturalGas: 0.03,
         Uranium: 0.02,
      },
      size: 40,
      buildingNames: {
         Headquarter: () => t(L.Westminster),
      },
      uniqueBuildings: {
         BritishMuseum: "Combustion",
         CambridgeUniversity: "Enlightenment",
         TowerBridge: "Electricity",
         EastIndiaCompany: "PrivateOwnership",
      },
      uniqueMultipliers: {},
      naturalWonders: {
         CerneAbbasGiant: true,
      },
      requireGreatPeopleLevel: 60,
      requireSupporterPack: true,
      festivalDesc: () => t(L.GuyFawkesNightV2),
      uniqueEffects: () => [],
   };

   French: ICityDefinition = {
      name: () => t(L.French),
      deposits: {
         Water: 0.03,
         Copper: 0.02,
         Iron: 0.025,
         Wood: 0.02,
         Stone: 0.02,
         Gold: 0.01,
         Coal: 0.03,
         Oil: 0.04,
         Aluminum: 0.02,
         NaturalGas: 0.03,
         Uranium: 0.03,
      },
      size: 50,
      buildingNames: {
         Headquarter: () => t(L.ElyseePalace),
      },
      uniqueBuildings: {
         ArcDeTriomphe: "Electricity",
         MontSaintMichel: "Revolution",
         Louvre: "Railway",
         CentrePompidou: "Software",
      },
      uniqueMultipliers: {},
      naturalWonders: {
         DuneOfPilat: true,
      },
      requireGreatPeopleLevel: 70,
      requireSupporterPack: true,
      festivalDesc: () => t(L.BastilleDay),
      uniqueEffects: () => [],
   };

   Ottoman: ICityDefinition = {
      name: () => t(L.Ottoman),
      deposits: {
         Water: 0.02,
         Copper: 0.03,
         Iron: 0.03,
         Wood: 0.02,
         Stone: 0.02,
         Gold: 0.03,
         Coal: 0.01,
         Oil: 0.02,
         Aluminum: 0.04,
         NaturalGas: 0.01,
         Uranium: 0.04,
      },
      size: 50,
      buildingNames: {
         Headquarter: () => t(L.DolmabahcePalace),
      },
      uniqueBuildings: {
         Penthouse: "FinancialLeverage",
         BlueMosque: "Exploration",
         TopkapiPalace: "Aviation",
      },
      uniqueMultipliers: {},
      naturalWonders: { Cappadocia: true, MountArarat: true, Pamukkale: true },
      requireGreatPeopleLevel: 80,
      requireSupporterPack: true,
      festivalDesc: () => t(L.Culus),
      uniqueEffects: () => [],
   };

   Brazilian: ICityDefinition = {
      name: () => t(L.Brazilian),
      deposits: {
         Water: 0.04,
         Copper: 0.01,
         Iron: 0.04,
         Wood: 0.04,
         Stone: 0.01,
         Gold: 0.01,
         Coal: 0.01,
         Oil: 0.04,
         Aluminum: 0.04,
         NaturalGas: 0.01,
         Uranium: 0.025,
      },
      size: 50,
      buildingNames: {
         Headquarter: () => t(L.Brasilia),
      },
      uniqueBuildings: { ItaipuDam: "Hydroelectricity", CathedralOfBrasilia: "Aviation" },
      uniqueMultipliers: {},
      naturalWonders: {
         Capybara: true,
         GiantOtter: true,
         Hoatzin: true,
         RoyalFlycatcher: true,
         GlassFrog: true,
         PygmyMarmoset: true,
      },
      requireGreatPeopleLevel: 90,
      requireSupporterPack: true,
      festivalDesc: () => t(L.Carnival),
      uniqueEffects: () => [],
   };

   Indian: ICityDefinition = {
      name: () => t(L.Indian),
      deposits: {
         Water: 0.03,
         Copper: 0.02,
         Iron: 0.03,
         Wood: 0.02,
         Stone: 0.025,
         Gold: 0.025,
         Coal: 0.04,
         Oil: 0.01,
         Aluminum: 0.025,
         NaturalGas: 0.04,
         Uranium: 0.01,
      },
      size: 40,
      buildingNames: {
         Headquarter: () => t(L.RashtrapatiBhavan),
      },
      uniqueBuildings: { RedFort: "RapidFire", SanchiStupa: "Physics", QutbMinar: "Banking" },
      uniqueMultipliers: {},
      naturalWonders: { GangesRiver: true, Sundarbans: true },
      requireGreatPeopleLevel: 100,
      requireSupporterPack: true,
      festivalDesc: () => t(L.DiwaliV2),
      uniqueEffects: () => [],
   };

   Australian: ICityDefinition = {
      name: () => t(L.Australian),
      deposits: {
         Water: 0.01,
         Copper: 0.01,
         Iron: 0.05,
         Wood: 0.04,
         Stone: 0.02,
         Gold: 0.02,
         Coal: 0.01,
         Oil: 0.03,
         Aluminum: 0.01,
         NaturalGas: 0.01,
         Uranium: 0.01,
      },
      size: 45,
      buildingNames: {
         Headquarter: () => t(L.CanberraParliamentHouse),
      },
      uniqueBuildings: {
         FusionFuelPlant: "Software",
         FusionPowerPlant: "Genetics",
         SydneyOperaHouse: "Television",
         SydneyHarbourBridge: "Hydroelectricity",
         GreatOceanRoad: "Rocketry",
      },
      uniqueMultipliers: {},
      naturalWonders: { GreatBarrierReef: true, Uluru: true },
      requireGreatPeopleLevel: 110,
      requireSupporterPack: true,
      festivalDesc: () => t(L.Moomba),
      uniqueEffects: () => ["A random <b>Natural Wonder</b> from other civilizations is spawned on the map"],
   };
}

export type City = keyof CityDefinitions;

interface ICityDefinition {
   deposits: Record<Deposit, number>;
   size: number;
   name: () => string;
   naturalWonders: PartialSet<Building>;
   buildingNames: Partial<Record<Building, () => string>>;
   uniqueBuildings: Partial<Record<Building, Tech>>;
   uniqueMultipliers: Partial<Record<Tech, IUnlockableMultipliers>>;
   uniqueEffects: () => string[];
   requireGreatPeopleLevel: number;
   requireSupporterPack: boolean;
   festivalDesc: () => string;
}
