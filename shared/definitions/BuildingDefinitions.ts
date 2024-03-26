import type { PartialSet, PartialTabulate } from "../utilities/TypeDefinitions";
import { L, t } from "../utilities/i18n";
import type { Deposit, Resource } from "./ResourceDefinitions";

export enum BuildingSpecial {
   HQ = 0,
   WorldWonder = 1,
   NaturalWonder = 2,
}

export interface IBuildingDefinition {
   name: () => string;
   input: PartialTabulate<Resource>;
   construction?: PartialTabulate<Resource>;
   output: PartialTabulate<Resource>;
   vision?: number;
   deposit?: PartialSet<Deposit>;
   power?: true;
   max?: number;
   wikipedia?: string;
   desc?: () => string;
   special?: BuildingSpecial;
}

export const BUILDING_DEFAULT_VISION = 2;

export class BuildingDefinitions {
   // #region Workers ////////////////////////////////////////////////////////////////////////////////////////
   Hut: IBuildingDefinition = {
      name: () => t(L.Hut),
      input: {},
      output: { Worker: 1 },
      construction: { Wood: 1 },
   };
   House: IBuildingDefinition = {
      name: () => t(L.House),
      input: { Wheat: 1, Water: 1 },
      output: { Worker: 6 },
      construction: { Wood: 1, Stone: 1, Water: 1 },
   };
   Apartment: IBuildingDefinition = {
      name: () => t(L.Apartment),
      input: { Cheese: 1, Meat: 2, Bread: 1 },
      output: { Worker: 84 },
      construction: { Brick: 1, Cheese: 1, Meat: 1, Bread: 1 },
   };
   // #endregion /////////////////////////////////////////////////////////////////////////////////////////////

   // #region Resources //////////////////////////////////////////////////////////////////////////////////////
   WheatFarm: IBuildingDefinition = {
      name: () => t(L.WheatFarm),
      input: {},
      output: { Wheat: 1 },
      construction: { Wood: 1 },
   };
   StoneQuarry: IBuildingDefinition = {
      name: () => t(L.StoneQuarry),
      input: {},
      deposit: { Stone: true },
      output: { Stone: 1 },
      construction: { Wood: 1 },
   };
   LoggingCamp: IBuildingDefinition = {
      name: () => t(L.LoggingCamp),
      input: {},
      deposit: { Wood: true },
      output: { Wood: 1 },
      construction: { Stone: 1 },
   };
   Aqueduct: IBuildingDefinition = {
      name: () => t(L.Aqueduct),
      input: {},
      deposit: { Water: true },
      output: { Water: 1 },
      construction: { Stone: 1 },
   };
   IronMiningCamp: IBuildingDefinition = {
      name: () => t(L.IronMiningCamp),
      input: {},
      deposit: { Iron: true },
      output: { Iron: 1 },
      construction: { Brick: 1 },
   };
   CopperMiningCamp: IBuildingDefinition = {
      name: () => t(L.CopperMiningCamp),
      input: {},
      deposit: { Copper: true },
      output: { Copper: 1 },
      construction: { Stone: 1, Wood: 1 },
   };

   CoalMine: IBuildingDefinition = {
      name: () => t(L.CoalMine),
      input: {},
      deposit: { Coal: true },
      output: { Coal: 1 },
      construction: { Iron: 1, Brick: 1, Lumber: 1 },
   };

   Sandpit: IBuildingDefinition = {
      name: () => t(L.Sandpit),
      input: {},
      output: { Sand: 1 },
      construction: { Wood: 1 },
   };

   GoldMiningCamp: IBuildingDefinition = {
      name: () => t(L.GoldMiningCamp),
      input: {},
      deposit: { Gold: true },
      output: { Gold: 1 },
      construction: { Brick: 1, Copper: 1 },
   };

   UraniumMine: IBuildingDefinition = {
      name: () => t(L.UraniumMine),
      input: {},
      deposit: { Uranium: true },
      output: { Uranium: 1 },
      construction: { Concrete: 1, Tool: 1 },
   };

   UraniumEnrichmentPlant: IBuildingDefinition = {
      name: () => t(L.UraniumEnrichmentPlant),
      input: { Uranium: 10 },
      output: { NuclearFuelRod: 1 },
      construction: { Concrete: 4, Steel: 5 },
      power: true,
   };

   OilWell: IBuildingDefinition = {
      name: () => t(L.OilWell),
      input: {},
      deposit: { Oil: true },
      output: { Oil: 1 },
      construction: { Brick: 1, Tool: 1, Sand: 1 },
   };

   NaturalGasWell: IBuildingDefinition = {
      name: () => t(L.NaturalGasWell),
      input: {},
      deposit: { NaturalGas: true },
      output: { NaturalGas: 1 },
      construction: { Brick: 1, Tool: 1, Lumber: 1 },
   };

   AluminumSmelter: IBuildingDefinition = {
      name: () => t(L.AluminumSmelter),
      input: {},
      deposit: { Aluminum: true },
      output: { Aluminum: 1 },
      construction: { Tool: 1, Brick: 1, Lumber: 1 },
   };

   CoalPowerPlant: IBuildingDefinition = {
      name: () => t(L.CoalPowerPlant),
      input: { Coal: 1 },
      output: { Power: 1 },
      construction: { Lumber: 5, Brick: 4 },
   };

   GasPowerPlant: IBuildingDefinition = {
      name: () => t(L.GasPowerPlant),
      input: { NaturalGas: 2 },
      output: { Power: 3 },
      construction: { Concrete: 2 },
   };

   HydroDam: IBuildingDefinition = {
      name: () => t(L.HydroDam),
      input: {},
      deposit: { Water: true },
      output: { Water: 1, Power: 2 },
      construction: { Dynamite: 1, Concrete: 1 },
   };
   // #endregion /////////////////////////////////////////////////////////////////////////////////////////////

   // #region Military ///////////////////////////////////////////////////////////////////////////////////////
   SwordForge: IBuildingDefinition = {
      name: () => t(L.SwordForge),
      input: { Tool: 2 },
      output: { Sword: 1 },
      construction: { Tool: 1, Brick: 1, Copper: 2 },
   };
   Armory: IBuildingDefinition = {
      name: () => t(L.Armory),
      input: { Tool: 2 },
      output: { Armor: 1 },
      construction: { Tool: 1, Brick: 1, Iron: 1, Wood: 1 },
   };
   ChariotWorkshop: IBuildingDefinition = {
      name: () => t(L.ChariotWorkshop),
      input: { Horse: 2, Lumber: 2, Copper: 1 },
      output: { Chariot: 1 },
      construction: { Horse: 1, Copper: 1, Lumber: 2, Brick: 2 },
   };
   KnightCamp: IBuildingDefinition = {
      name: () => t(L.KnightCamp),
      input: { Horse: 1, Armor: 1, Sword: 1 },
      output: { Knight: 1 },
   };
   CannonWorkshop: IBuildingDefinition = {
      name: () => t(L.CannonWorkshop),
      input: { Iron: 2, Wood: 1, Tool: 1 },
      output: { Cannon: 1 },
      construction: { Iron: 1, Wood: 1, Tool: 1, Brick: 1, Stone: 1 },
   };
   GunpowderMill: IBuildingDefinition = {
      name: () => t(L.GunpowderMill),
      input: { Wood: 1, Coal: 1 },
      output: { Gunpowder: 1 },
      construction: { Stone: 1, Coal: 1 },
   };
   DynamiteWorkshop: IBuildingDefinition = {
      name: () => t(L.DynamiteWorkshop),
      input: { Wheat: 1, Gunpowder: 1, Coal: 1 },
      output: { Dynamite: 1 },
      construction: { Stone: 2, Gunpowder: 1, Coal: 1 },
   };
   SiegeWorkshop: IBuildingDefinition = {
      name: () => t(L.SiegeWorkshop),
      input: { Lumber: 2, Iron: 2, Tool: 1 },
      output: { SiegeRam: 1 },
      construction: { Lumber: 2, Iron: 1, Brick: 1, Tool: 1, Stone: 1 },
   };
   CaravelBuilder: IBuildingDefinition = {
      name: () => t(L.CaravelBuilder),
      input: { Lumber: 5, Cloth: 2, Tool: 2 },
      output: { Caravel: 1 },
      construction: { Lumber: 5, Marble: 1, Brick: 2, Tool: 2 },
   };
   GalleonBuilder: IBuildingDefinition = {
      name: () => t(L.GalleonBuilder),
      input: { Caravel: 1, Sword: 1, SiegeRam: 1, Armor: 1 },
      output: { Galleon: 1 },
   };
   FrigateBuilder: IBuildingDefinition = {
      name: () => t(L.FrigateBuilder),
      input: { Galleon: 1, Knight: 1, Cannon: 1, Lens: 1 },
      output: { Frigate: 1 },
   };
   RifleFactory: IBuildingDefinition = {
      name: () => t(L.RifleFactory),
      input: { Gunpowder: 5, Tool: 5 },
      output: { Rifle: 1 },
   };
   GatlingGunFactory: IBuildingDefinition = {
      name: () => t(L.GatlingGunFactory),
      input: { Rifle: 1, Gunpowder: 5 },
      output: { GatlingGun: 1 },
   };
   ArtilleryFactory: IBuildingDefinition = {
      name: () => t(L.ArtilleryFactory),
      input: { GatlingGun: 1, Dynamite: 1, Aluminum: 5 },
      output: { Artillery: 1 },
   };
   IroncladBuilder: IBuildingDefinition = {
      name: () => t(L.IroncladBuilder),
      input: { GatlingGun: 1, Rifle: 1, Frigate: 1 },
      output: { Ironclad: 1 },
   };
   BattleshipBuilder: IBuildingDefinition = {
      name: () => t(L.BattleshipBuilder),
      input: { Ironclad: 1, Artillery: 1, Cable: 5, Steel: 5, Aluminum: 5 },
      output: { Battleship: 1 },
      power: true,
   };
   TankFactory: IBuildingDefinition = {
      name: () => t(L.TankFactory),
      input: { Engine: 1, Steel: 10, Cannon: 1, GatlingGun: 1 },
      output: { Tank: 1 },
   };
   BiplaneFactory: IBuildingDefinition = {
      name: () => t(L.BiplaneFactory),
      input: { Engine: 1, Steel: 1, Lens: 1, Petrol: 5 },
      output: { Biplane: 1 },
   };
   RocketFactory: IBuildingDefinition = {
      name: () => t(L.RocketFactory),
      input: { Engine: 1, Artillery: 1, Steel: 5, Cable: 5, Petrol: 10 },
      output: { Rocket: 1 },
      power: true,
   };
   AtomicFacility: IBuildingDefinition = {
      name: () => t(L.AtomicFacility),
      input: { Dynamite: 10, Uranium: 10 },
      output: { AtomicBomb: 1 },
      power: true,
   };
   // #endregion /////////////////////////////////////////////////////////////////////////////////////////////

   // #region Culture ////////////////////////////////////////////////////////////////////////////////////////
   WritersGuild: IBuildingDefinition = {
      name: () => t(L.WritersGuild),
      input: { Paper: 2 },
      output: { Poem: 1 },
      construction: { Brick: 2 },
   };
   PaintersGuild: IBuildingDefinition = {
      name: () => t(L.PaintersGuild),
      input: { Paper: 2 },
      output: { Painting: 1 },
      construction: { Lumber: 1, Brick: 1 },
   };
   MusiciansGuild: IBuildingDefinition = {
      name: () => t(L.MusiciansGuild),
      input: { Alcohol: 2 },
      output: { Music: 1 },
      construction: { Lumber: 2, Brick: 1 },
   };
   ActorsGuild: IBuildingDefinition = {
      name: () => t(L.ActorsGuild),
      input: { Music: 1, Poem: 1 },
      output: { Opera: 2 },
   };
   Shrine: IBuildingDefinition = {
      name: () => t(L.Shrine),
      input: { Horse: 1, Alcohol: 1 },
      output: { Faith: 1 },
      construction: { Brick: 1, Lumber: 1, Alcohol: 1 },
   };
   Church: IBuildingDefinition = {
      name: () => t(L.Church),
      input: { Music: 1, Poem: 1 },
      output: { Faith: 3 },
   };
   Mosque: IBuildingDefinition = {
      name: () => t(L.Mosque),
      input: { Cheese: 1, Marble: 1 },
      output: { Faith: 3 },
   };
   Cathedral: IBuildingDefinition = {
      name: () => t(L.Cathedral),
      input: { Sword: 1, Armor: 1 },
      output: { Faith: 6 },
   };
   // Science is valued at 0.2
   School: IBuildingDefinition = {
      name: () => t(L.School),
      input: { Faith: 1, Poem: 1 },
      output: { Science: 470 },
   };
   Library: IBuildingDefinition = {
      name: () => t(L.Library),
      input: { Paper: 1 },
      output: { Science: 35 },
      construction: { Brick: 1 },
   };
   University: IBuildingDefinition = {
      name: () => t(L.University),
      input: { Poem: 1, Painting: 1, Faith: 1 },
      output: { Philosophy: 1, Science: 250 },
   };
   PublishingHouse: IBuildingDefinition = {
      name: () => t(L.PublishingHouse),
      input: { Philosophy: 2, Book: 10 },
      output: { Newspaper: 1, Science: 1000 },
   };
   MagazinePublisher: IBuildingDefinition = {
      name: () => t(L.MagazinePublisher),
      input: { Sports: 2, Book: 10 },
      output: { Magazine: 1, Science: 1000 },
   };
   ResearchLab: IBuildingDefinition = {
      name: () => t(L.ResearchLab),
      input: { Culture: 2, Philosophy: 2 },
      output: { Science: 4800 },
   };
   Museum: IBuildingDefinition = {
      name: () => t(L.Museum),
      input: { Music: 1, Painting: 1, Faith: 1 },
      output: { Culture: 1 },
   };
   Courthouse: IBuildingDefinition = {
      name: () => t(L.Courthouse),
      input: { Philosophy: 1, Faith: 1, Culture: 1 },
      output: { Law: 1 },
   };
   Stadium: IBuildingDefinition = {
      name: () => t(L.Stadium),
      input: { Culture: 1, Opera: 1, Philosophy: 1 },
      output: { Sports: 1 },
   };
   Parliament: IBuildingDefinition = {
      name: () => t(L.Parliament),
      input: { Culture: 2, Philosophy: 2, Law: 2 },
      output: { Politics: 1 },
   };
   MovieStudio: IBuildingDefinition = {
      name: () => t(L.MovieStudio),
      input: { Sports: 5, Lens: 5, Garment: 5 },
      output: { Movie: 1 },
      power: true,
   };
   RadioStation: IBuildingDefinition = {
      name: () => t(L.RadioStation),
      input: { Magazine: 5, Newspaper: 5, Culture: 5 },
      output: { Radio: 1 },
      power: true,
   };
   Embassy: IBuildingDefinition = {
      name: () => t(L.Embassy),
      input: { Law: 5, Politics: 5, Philosophy: 5 },
      output: { Diplomacy: 1 },
   };
   // #endregion /////////////////////////////////////////////////////////////////////////////////////////////

   // #region Food & Light Industry //////////////////////////////////////////////////////////////////////////
   CottonPlantation: IBuildingDefinition = {
      name: () => t(L.CottonPlantation),
      input: {},
      output: { Cotton: 1 },
      construction: { Wood: 1 },
   };
   CottonMill: IBuildingDefinition = {
      name: () => t(L.CottonMill),
      input: { Cotton: 2 },
      output: { Cloth: 1 },
      construction: { Brick: 1, Lumber: 1 },
   };
   GarmentWorkshop: IBuildingDefinition = {
      name: () => t(L.GarmentWorkshop),
      input: { Cloth: 2 },
      output: { Garment: 1 },
   };
   FurnitureWorkshop: IBuildingDefinition = {
      name: () => t(L.FurnitureWorkshop),
      input: { Lumber: 2, Copper: 1 },
      output: { Furniture: 1 },
   };
   PrintingHouse: IBuildingDefinition = {
      name: () => t(L.PrintingHouse),
      input: { Paper: 5, Poem: 1 },
      output: { Book: 1 },
   };
   FlourMill: IBuildingDefinition = {
      name: () => t(L.FlourMill),
      input: { Wheat: 2 },
      output: { Flour: 1 },
      construction: { Brick: 1 },
   };
   LivestockFarm: IBuildingDefinition = {
      name: () => t(L.LivestockFarm),
      input: { Wheat: 2 },
      output: { Meat: 1, Milk: 1 },
      construction: { Lumber: 1 },
   };
   Stable: IBuildingDefinition = {
      name: () => t(L.Stable),
      input: { Wheat: 2 },
      output: { Horse: 1 },
      construction: { Lumber: 1 },
   };
   Bakery: IBuildingDefinition = {
      name: () => t(L.Bakery),
      input: { Water: 1, Flour: 1 },
      output: { Bread: 1 },
      construction: { Brick: 1, Lumber: 1, Stone: 1 },
   };
   CheeseMaker: IBuildingDefinition = {
      name: () => t(L.CheeseMaker),
      input: { Milk: 2 },
      output: { Cheese: 1 },
      construction: { Brick: 1, Lumber: 1 },
   };
   Brewery: IBuildingDefinition = {
      name: () => t(L.Brewery),
      input: { Wheat: 1, Water: 1 },
      output: { Alcohol: 1 },
      construction: { Copper: 1 },
   };
   PaperMaker: IBuildingDefinition = {
      name: () => t(L.PaperMaker),
      input: { Wood: 1, Water: 1 },
      output: { Paper: 1 },
      construction: { Wood: 1, Stone: 1 },
   };
   Pizzeria: IBuildingDefinition = {
      name: () => t(L.Pizzeria),
      input: { Cheese: 1, Meat: 1, Flour: 2, Water: 2 },
      output: { Pizza: 1 },
   };
   PlasticsFactory: IBuildingDefinition = {
      name: () => t(L.PlasticsFactory),
      input: { Oil: 2 },
      output: { Plastics: 1 },
   };
   // #endregion /////////////////////////////////////////////////////////////////////////////////////////////

   // #region Heavy Industry /////////////////////////////////////////////////////////////////////////////////
   LumberMill: IBuildingDefinition = {
      name: () => t(L.LumberMill),
      input: { Wood: 2 },
      output: { Lumber: 1 },
      construction: { Stone: 2 },
   };
   Glassworks: IBuildingDefinition = {
      name: () => t(L.Glassworks),
      input: { Sand: 2 },
      output: { Glass: 1 },
      construction: { Brick: 1, Wood: 2 },
   };
   LensWorkshop: IBuildingDefinition = {
      name: () => t(L.LensWorkshop),
      input: { Glass: 2 },
      output: { Lens: 1 },
   };
   Blacksmith: IBuildingDefinition = {
      name: () => t(L.Blacksmith),
      input: { Copper: 1, Wood: 1 },
      output: { Tool: 1 },
      construction: { Brick: 1 },
   };
   IronForge: IBuildingDefinition = {
      name: () => t(L.IronForge),
      input: { Iron: 1 },
      output: { Tool: 1 },
      construction: { Brick: 1 },
   };
   Brickworks: IBuildingDefinition = {
      name: () => t(L.Brickworks),
      input: { Stone: 2 },
      output: { Brick: 1 },
      construction: { Wood: 2 },
   };
   Marbleworks: IBuildingDefinition = {
      name: () => t(L.Marbleworks),
      input: { Stone: 2, Tool: 1 },
      output: { Marble: 1 },
   };
   ConcretePlant: IBuildingDefinition = {
      name: () => t(L.ConcretePlant),
      input: { Brick: 1, Sand: 2, Tool: 1 },
      output: { Concrete: 1 },
   };
   SteelMill: IBuildingDefinition = {
      name: () => t(L.SteelMill),
      input: { Iron: 1, Coal: 1 },
      output: { Steel: 1 },
      construction: { Brick: 1, Coal: 1 },
   };
   CableFactory: IBuildingDefinition = {
      name: () => t(L.CableFactory),
      input: { Copper: 5 },
      output: { Cable: 1 },
   };
   Steamworks: IBuildingDefinition = {
      name: () => t(L.Steamworks),
      input: { Iron: 1, Coal: 1, Tool: 1 },
      output: { Engine: 1 },
   };
   LocomotiveFactory: IBuildingDefinition = {
      name: () => t(L.LocomotiveFactory),
      input: { Engine: 1, Steel: 10 },
      output: { Train: 1 },
   };
   CarFactory: IBuildingDefinition = {
      name: () => t(L.CarFactory),
      input: { Engine: 1, Steel: 1, Furniture: 1, Cable: 1, Plastics: 1, Petrol: 5 },
      output: { Car: 1 },
      power: true,
   };
   OilRefinery: IBuildingDefinition = {
      name: () => t(L.OilRefinery),
      input: { Oil: 2 },
      output: { Petrol: 1 },
      construction: { Steel: 1 },
   };
   // #endregion /////////////////////////////////////////////////////////////////////////////////////////////

   // #region Financial & Trade //////////////////////////////////////////////////////////////////////////////
   CoinMint: IBuildingDefinition = {
      name: () => t(L.CoinMint),
      input: { Gold: 3 },
      output: { Coin: 1 },
      construction: { Gold: 2, Lumber: 1, Copper: 1 },
   };
   Bank: IBuildingDefinition = {
      name: () => t(L.Bank),
      input: { Coin: 3 },
      output: { Banknote: 1 },
   };
   BondMarket: IBuildingDefinition = {
      name: () => t(L.BondMarket),
      input: { Banknote: 3 },
      output: { Bond: 1 },
   };
   StockExchange: IBuildingDefinition = {
      name: () => t(L.StockExchange),
      input: { Bond: 3 },
      output: { Stock: 1 },
   };
   Caravansary: IBuildingDefinition = {
      name: () => t(L.Caravansary),
      desc: () => t(L.CaravansaryDesc),
      input: {},
      output: {},
      construction: { Brick: 1, Horse: 1, Tool: 1 },
   };
   Market: IBuildingDefinition = {
      name: () => t(L.Market),
      input: {},
      output: {},
      desc: () => t(L.MarketDesc),
      construction: { Brick: 2, Copper: 2, Lumber: 2 },
   };
   Warehouse: IBuildingDefinition = {
      name: () => t(L.Warehouse),
      input: {},
      output: {},
      desc: () => t(L.WarehouseDesc),
      construction: { Lumber: 1, Brick: 1, Horse: 1 },
   };
   // #endregion /////////////////////////////////////////////////////////////////////////////////////////////

   // #region Functional Wonders /////////////////////////////////////////////////////////////////////////////
   Headquarter: IBuildingDefinition = {
      name: () => t(L.Headquarter),
      input: {},
      output: { Worker: 10 },
      vision: 3,
      max: 0,
      special: BuildingSpecial.HQ,
   };
   Statistics: IBuildingDefinition = {
      name: () => t(L.StatisticsOffice),
      desc: () => t(L.StatisticsOfficeDesc),
      input: {},
      output: {},
      construction: { Brick: 100, Wood: 100, Lumber: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
   };
   Petra: IBuildingDefinition = {
      name: () => t(L.Petra),
      desc: () => t(L.PetraDesc),
      input: {},
      output: {},
      max: 1,
      construction: { Gold: 500 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Petra",
   };
   // #endregion

   // #region Natural Wonders ////////////////////////////////////////////////////////////////////////////////
   Alps: IBuildingDefinition = {
      name: () => t(L.Alps),
      desc: () => t(L.AlpsDesc),
      input: {},
      output: {},
      construction: {},
      max: 0,
      wikipedia: "Alps",
      special: BuildingSpecial.NaturalWonder,
   };
   GrottaAzzurra: IBuildingDefinition = {
      name: () => t(L.GrottaAzzurra),
      desc: () => t(L.GrottaAzzurraDesc),
      input: {},
      output: {},
      construction: {},
      max: 0,
      wikipedia: "Blue_Grotto_(Capri)",
      special: BuildingSpecial.NaturalWonder,
   };
   Aphrodite: IBuildingDefinition = {
      name: () => t(L.Aphrodite),
      desc: () => t(L.AphroditeDesc),
      input: {},
      output: {},
      construction: {},
      max: 0,
      wikipedia: "Aphrodite",
      special: BuildingSpecial.NaturalWonder,
   };
   Poseidon: IBuildingDefinition = {
      name: () => t(L.Poseidon),
      desc: () => t(L.PoseidonDesc),
      input: {},
      output: {},
      construction: {},
      max: 0,
      wikipedia: "Poseidon",
      special: BuildingSpecial.NaturalWonder,
   };
   NileRiver: IBuildingDefinition = {
      name: () => t(L.NileRiver),
      desc: () => t(L.NileRiverDesc),
      input: {},
      output: {},
      construction: {},
      max: 0,
      wikipedia: "Nile",
      special: BuildingSpecial.NaturalWonder,
   };
   MountSinai: IBuildingDefinition = {
      name: () => t(L.MountSinai),
      desc: () => t(L.MountSinaiDesc),
      input: {},
      output: {},
      construction: {},
      max: 0,
      wikipedia: "Mount_Sinai",
      special: BuildingSpecial.NaturalWonder,
   };
   // #endregion /////////////////////////////////////////////////////////////////////////////////////////////

   // #region World Wonders //////////////////////////////////////////////////////////////////////////////////
   Stonehenge: IBuildingDefinition = {
      name: () => t(L.Stonehenge),
      desc: () => t(L.StonehengeDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Stonehenge",
      construction: { Stone: 300 },
   };
   HatshepsutTemple: IBuildingDefinition = {
      name: () => t(L.HatshepsutTemple),
      desc: () => t(L.HatshepsutTempleDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Mortuary_Temple_of_Hatshepsut",
      construction: { Stone: 100, Wood: 100, Copper: 100 },
   };
   LighthouseOfAlexandria: IBuildingDefinition = {
      name: () => t(L.LighthouseOfAlexandria),
      desc: () => t(L.LighthouseOfAlexandriaDesc),
      input: {},
      output: {},
      max: 1,
      construction: { Iron: 100, Marble: 100, Tool: 100 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Lighthouse_of_Alexandria",
   };
   PyramidOfGiza: IBuildingDefinition = {
      name: () => t(L.PyramidOfGiza),
      desc: () => t(L.PyramidOfGizaDesc),
      input: {},
      output: {},
      construction: { Brick: 300 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Great_Pyramid_of_Giza",
   };
   ColossusOfRhodes: IBuildingDefinition = {
      name: () => t(L.ColossusOfRhodes),
      desc: () => t(L.ColossusOfRhodesDesc),
      input: {},
      output: {},
      construction: { Stone: 300 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Colossus_of_Rhodes",
   };
   GreatMosqueOfSamarra: IBuildingDefinition = {
      name: () => t(L.GreatMosqueOfSamarra),
      desc: () => t(L.GreatMosqueOfSamarraDescV2),
      input: {},
      output: {},
      construction: { Sand: 100, Brick: 100, Cotton: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Great_Mosque_of_Samarra",
   };
   HangingGarden: IBuildingDefinition = {
      name: () => t(L.HangingGarden),
      desc: () => t(L.HangingGardenDesc),
      input: {},
      output: {},
      construction: { Stone: 100, Water: 100, Copper: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Hanging_Gardens_of_Babylon",
   };
   TempleOfHeaven: IBuildingDefinition = {
      name: () => t(L.TempleOfHeaven),
      desc: () => t(L.TempleOfHeavenDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      construction: { Iron: 100, Bread: 100, Cheese: 100 },
      wikipedia: "Temple_of_Heaven",
   };
   Parthenon: IBuildingDefinition = {
      name: () => t(L.Parthenon),
      desc: () => t(L.ParthenonDescV2),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      construction: { Marble: 100, Painting: 100, Music: 100 },
      wikipedia: "Parthenon",
   };
   TempleOfArtemis: IBuildingDefinition = {
      name: () => t(L.TempleOfArtemis),
      desc: () => t(L.TempleOfArtemisDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      construction: { Armor: 100, Sword: 100, Marble: 100 },
      wikipedia: "Temple_of_Artemis",
   };
   LuxorTemple: IBuildingDefinition = {
      name: () => t(L.LuxorTemple),
      desc: () => t(L.LuxorTempleDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      construction: { Tool: 100, Cloth: 100, Furniture: 100 },
      wikipedia: "Luxor_Temple",
   };
   ChichenItza: IBuildingDefinition = {
      name: () => t(L.ChichenItza),
      desc: () => t(L.ChichenItzaDesc),
      input: {},
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      construction: { Stone: 100, Armor: 100, SiegeRam: 100 },
      wikipedia: "Chichen_Itza",
   };
   MausoleumAtHalicarnassus: IBuildingDefinition = {
      name: () => t(L.MausoleumAtHalicarnassus),
      desc: () => t(L.MausoleumAtHalicarnassusDesc),
      input: {},
      output: {},
      max: 1,
      construction: { Marble: 100, Lumber: 100, Tool: 100 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Mausoleum_at_Halicarnassus",
   };
   HagiaSophia: IBuildingDefinition = {
      name: () => t(L.HagiaSophia),
      desc: () => t(L.HagiaSophiaDesc),
      input: { Faith: 10 },
      construction: { Faith: 150, Marble: 150, Knight: 150 },
      output: {},
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Hagia_Sophia",
   };
   AngkorWat: IBuildingDefinition = {
      name: () => t(L.AngkorWat),
      desc: () => t(L.AngkorWatDesc),
      input: {},
      output: {},
      construction: { Faith: 100, Tool: 100, Marble: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Angkor_Wat",
   };
   TerracottaArmy: IBuildingDefinition = {
      name: () => t(L.TerracottaArmy),
      desc: () => t(L.TerracottaArmyDesc),
      input: {},
      output: {},
      max: 1,
      construction: { Chariot: 100, Iron: 100, Stone: 100 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Terracotta_Army",
   };
   Persepolis: IBuildingDefinition = {
      name: () => t(L.Persepolis),
      desc: () => t(L.PersepolisDesc),
      input: {},
      output: {},
      max: 1,
      construction: { Stone: 100, Wood: 100, Copper: 100 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Persepolis",
   };
   OxfordUniversity: IBuildingDefinition = {
      name: () => t(L.OxfordUniversity),
      desc: () => t(L.OxfordUniversityDescV2),
      input: {},
      output: {},
      max: 1,
      construction: { Faith: 100, Philosophy: 100, Poem: 100 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "University_of_Oxford",
   };
   StPetersBasilica: IBuildingDefinition = {
      name: () => t(L.StPetersBasilica),
      desc: () => t(L.StPetersBasilicaDesc),
      input: {},
      output: {},
      max: 1,
      construction: { Faith: 500 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "St._Peter%27s_Basilica",
   };
   SaintBasilsCathedral: IBuildingDefinition = {
      name: () => t(L.SaintBasilsCathedral),
      desc: () => t(L.SaintBasilsCathedralDescV2),
      input: {},
      output: {},
      max: 1,
      construction: { Furniture: 100, Gunpowder: 100, Lens: 100 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Saint_Basil%27s_Cathedral",
   };
   ForbiddenCity: IBuildingDefinition = {
      name: () => t(L.ForbiddenCity),
      desc: () => t(L.ForbiddenCityDesc),
      input: {},
      output: {},
      max: 1,
      construction: { Banknote: 100, Marble: 100, Book: 100 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Forbidden_City",
   };
   HimejiCastle: IBuildingDefinition = {
      name: () => t(L.HimejiCastle),
      desc: () => t(L.HimejiCastleDesc),
      input: {},
      output: {},
      max: 1,
      construction: { Caravel: 100, Galleon: 100, Frigate: 100 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Himeji_Castle",
   };
   TajMahal: IBuildingDefinition = {
      name: () => t(L.TajMahal),
      desc: () => t(L.TajMahalDescV2),
      input: {},
      output: {},
      construction: { Faith: 100, Marble: 100, Garment: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Taj_Mahal",
   };
   Colosseum: IBuildingDefinition = {
      name: () => t(L.Colosseum),
      desc: () => t(L.ColosseumDesc),
      input: { Chariot: 10 },
      output: {},
      construction: { Brick: 100, Chariot: 100, Alcohol: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Colosseum",
   };
   MogaoCaves: IBuildingDefinition = {
      name: () => t(L.MogaoCaves),
      desc: () => t(L.MogaoCavesDescV2),
      input: {},
      output: {},
      construction: { Faith: 100, Marble: 100, Painting: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Mogao_Caves",
   };
   StatueOfZeus: IBuildingDefinition = {
      name: () => t(L.StatueOfZeus),
      desc: () => t(L.StatueOfZeusDesc),
      input: {},
      output: {},
      construction: { Marble: 100, Brick: 100, Music: 100 },
      max: 1,
      wikipedia: "Statue_of_Zeus_at_Olympia",
      special: BuildingSpecial.WorldWonder,
   };
   CircusMaximus: IBuildingDefinition = {
      name: () => t(L.CircusMaximus),
      desc: () => t(L.CircusMaximusDescV2),
      input: {},
      output: {},
      construction: { Music: 100, Poem: 100, Painting: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Circus_Maximus",
   };
   EiffelTower: IBuildingDefinition = {
      name: () => t(L.EiffelTower),
      desc: () => t(L.EiffelTowerDesc),
      input: {},
      output: {},
      construction: { Steel: 300 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Eiffel_Tower",
   };
   Rijksmuseum: IBuildingDefinition = {
      name: () => t(L.Rijksmuseum),
      desc: () => t(L.RijksmuseumDesc),
      input: {},
      output: {},
      construction: { Newspaper: 100, Culture: 100, Concrete: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Rijksmuseum",
   };
   SummerPalace: IBuildingDefinition = {
      name: () => t(L.SummerPalace),
      desc: () => t(L.SummerPalaceDesc),
      input: {},
      output: {},
      construction: { Gunpowder: 100, Rifle: 100, GatlingGun: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Summer_Palace",
   };
   StatueOfLiberty: IBuildingDefinition = {
      name: () => t(L.StatueOfLiberty),
      desc: () => t(L.StatueOfLibertyDesc),
      input: {},
      output: {},
      construction: { Philosophy: 100, Politics: 100, Law: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Statue_of_Liberty",
   };
   Neuschwanstein: IBuildingDefinition = {
      name: () => t(L.Neuschwanstein),
      desc: () => t(L.NeuschwansteinDesc),
      input: {},
      output: {},
      construction: { Rifle: 100, Bond: 100, Cannon: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Neuschwanstein_Castle",
   };
   BrandenburgGate: IBuildingDefinition = {
      name: () => t(L.BrandenburgGate),
      desc: () => t(L.BrandenburgGateDesc),
      input: {},
      output: {},
      construction: { Train: 100, Politics: 100, Concrete: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Brandenburg_Gate",
   };
   GrandBazaar: IBuildingDefinition = {
      name: () => t(L.GrandBazaar),
      desc: () => t(L.GrandBazaarDesc),
      input: {},
      output: {},
      max: 1,
      construction: { Coin: 100, Garment: 100, Furniture: 100 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Grand_Bazaar,_Istanbul",
   };
   AbuSimbel: IBuildingDefinition = {
      name: () => t(L.AbuSimbel),
      desc: () => t(L.AbuSimbelDesc),
      input: {},
      output: {},
      max: 1,
      construction: { Stone: 100, Brick: 100, Lumber: 100 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Abu_Simbel",
   };
   GreatSphinx: IBuildingDefinition = {
      name: () => t(L.GreatSphinx),
      desc: () => t(L.GreatSphinxDesc),
      input: {},
      output: {},
      max: 1,
      construction: { Stone: 100, Brick: 100, Lumber: 100 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Great_Sphinx_of_Giza",
   };
   Hollywood: IBuildingDefinition = {
      name: () => t(L.Hollywood),
      desc: () => t(L.HollywoodDesc),
      input: {},
      output: {},
      max: 1,
      construction: { Magazine: 100, Movie: 100, Newspaper: 100 },
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Hollywood,_Los_Angeles",
   };
   GoldenGateBridge: IBuildingDefinition = {
      name: () => t(L.GoldenGateBridge),
      desc: () => t(L.GoldenGateBridgeDesc),
      input: {},
      output: {},
      construction: { Steel: 100, Movie: 100, Radio: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Golden_Gate_Bridge",
   };
   CristoRedentor: IBuildingDefinition = {
      name: () => t(L.CristoRedentor),
      desc: () => t(L.CristoRedentorDesc),
      input: {},
      output: {},
      construction: { Concrete: 100, Sports: 100, Politics: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Christ_the_Redeemer_(statue)",
   };
   UnitedNations: IBuildingDefinition = {
      name: () => t(L.UnitedNations),
      desc: () => t(L.UnitedNationsDesc),
      input: {},
      output: {},
      construction: { Politics: 100, Law: 100, Diplomacy: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "United_Nations",
   };
   ManhattanProject: IBuildingDefinition = {
      name: () => t(L.ManhattanProject),
      desc: () => t(L.ManhattanProjectDesc),
      input: {},
      output: {},
      construction: { Uranium: 500 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Manhattan_Project",
   };
   SagradaFamilia: IBuildingDefinition = {
      name: () => t(L.SagradaFamilia),
      desc: () => t(L.SagradaFamiliaDesc),
      input: {},
      output: {},
      construction: { Tank: 100, Biplane: 100, Train: 100 },
      max: 1,
      special: BuildingSpecial.WorldWonder,
      wikipedia: "Sagrada_Família",
   };
   // ArcDeTriomphe: IBuildingDefinition = {
   //    name: () => t(L.ArcDeTriomphe),
   //    desc: () => t(L.ArcDeTriompheDesc),
   //    input: {},
   //    output: {},
   //    construction: { Culture: 100, Brick: 100, Marble: 100 },
   //    max: 1,
   //    special: BuildingSpecial.WorldWonder,
   //    wikipedia: "Arc_de_Triomphe",
   // };
   // #endregion /////////////////////////////////////////////////////////////////////////////////////////////

   // Winery: IBuildingDefinition = {
   //    name: () => t(L.Winery),
   //    input: { Grape: 1, Water: 1 },
   //    output: { Wine: 1 },
   //    construction: { Stone: 1, Marble: 1 },
   // };

   // Pantheon: IBuildingDefinition = {
   //    name: () => t(L.Pantheon),
   //    desc: () => t(L.PantheonDesc),
   //    input: {},
   //    output: {},
   //    construction: { Marble: 100, Sword: 100, Copper: 100 },
   //    max: 1,
   //    special: BuildingSpecial.WorldWonder,
   //    wikipedia: "Pantheon,_Rome",
   // };

   // GreatDagonPagoda: IBuildingDefinition = {
   //    name: () => t(L.GreatDagonPagoda),
   //    desc: () => t(L.GreatDagonPagodaDesc),
   //    input: {},
   //    output: {},
   //    construction: { Brick: 100, Marble: 100, Alcohol: 100 },
   //    max: 1,
   //    wikipedia: "Shwedagon_Pagoda",
   // };

   // Borobudur: IBuildingDefinition = {
   //    name: () => t(L.Borobudur),
   //    desc: () => t(L.BorobudurDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Borobudur",
   // };

   // ItsukushimaShrine: IBuildingDefinition = {
   //    name: () => t(L.ItsukushimaShrine),
   //    desc: () => t(L.ItsukushimaShrineDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Itsukushima_Shrine",
   // };

   // Moai: IBuildingDefinition = {
   //    name: () => t(L.Moai),
   //    desc: () => t(L.MoaiDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Moai",
   // };

   // BranCastle: IBuildingDefinition = {
   //    name: () => t(L.BranCastle),
   //    desc: () => t(L.BranCastleDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Bran_Castle",
   // };

   // ChoghaZanbil: IBuildingDefinition = {
   //    name: () => t(L.ChoghaZanbil),
   //    desc: () => t(L.ChoghaZanbilDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Chogha_Zanbil",
   // };

   // SydneyOperaHouse: IBuildingDefinition = {
   //    name: () => t(L.SydneyOperaHouse),
   //    desc: () => t(L.SydneyOperaHouseDesc),
   //    input: {},
   //    output: {},
   //    max: 1,
   //    wikipedia: "Sydney_Opera_House",
   // };

   // FishPond: IBuildingDefinition = {
   //    name: () => t(L.FishPond),
   //    input: {},
   //    deposit: { Water: true },
   //    output: { Fish: 1 },
   //    construction: { Brick: 1 },
   // };

   // OlivePlantation: IBuildingDefinition = {
   //    name: () => t(L.OlivePlantation),
   //    input: {},
   //    output: { Olive: 1 },
   //    construction: { Wood: 1 },
   // };

   // Vineyard: IBuildingDefinition = {
   //    name: () => t(L.Vineyard),
   //    input: {},
   //    output: { Grape: 1 },
   //    construction: { Wood: 1 },
   // };

   // OilPress: IBuildingDefinition = {
   //    name: () => t(L.OilPress),
   //    input: { Olive: 2 },
   //    output: { OliveOil: 1 },
   //    construction: { Brick: 1 },
   // };
}
export type Building = keyof BuildingDefinitions;
