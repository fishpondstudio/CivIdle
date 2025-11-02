import type { PartialSet } from "../utilities/TypeDefinitions";
import { L, t } from "../utilities/i18n";

export interface IMaterialDefinition {
   name: () => string;
}

export class MaterialDefinitions {
   Worker: IMaterialDefinition = { name: () => t(L.Worker) };
   Power: IMaterialDefinition = { name: () => t(L.Power) };
   Science: IMaterialDefinition = { name: () => t(L.Science) };
   Warp: IMaterialDefinition = { name: () => t(L.Warp) };
   Wheat: IMaterialDefinition = { name: () => t(L.Wheat) };
   Meat: IMaterialDefinition = { name: () => t(L.Meat) };
   Wood: IMaterialDefinition = { name: () => t(L.Wood) };
   Lumber: IMaterialDefinition = { name: () => t(L.Lumber) };
   Stone: IMaterialDefinition = { name: () => t(L.Stone) };
   Brick: IMaterialDefinition = { name: () => t(L.Brick) };
   Horse: IMaterialDefinition = { name: () => t(L.Horse) };
   Marble: IMaterialDefinition = { name: () => t(L.Marble) };
   Water: IMaterialDefinition = { name: () => t(L.Water) };
   Copper: IMaterialDefinition = { name: () => t(L.Copper) };
   Iron: IMaterialDefinition = { name: () => t(L.Iron) };
   Gold: IMaterialDefinition = { name: () => t(L.Gold) };
   Alcohol: IMaterialDefinition = { name: () => t(L.Alcohol) };
   Tool: IMaterialDefinition = { name: () => t(L.Tool) };
   Sword: IMaterialDefinition = { name: () => t(L.Sword) };
   Armor: IMaterialDefinition = { name: () => t(L.Armor) };
   Chariot: IMaterialDefinition = { name: () => t(L.Chariot) };
   Knight: IMaterialDefinition = { name: () => t(L.Knight) };
   Paper: IMaterialDefinition = { name: () => t(L.Paper) };
   Cheese: IMaterialDefinition = { name: () => t(L.Cheese) };
   Milk: IMaterialDefinition = { name: () => t(L.Milk) };
   Pizza: IMaterialDefinition = { name: () => t(L.Pizza) };
   Bread: IMaterialDefinition = { name: () => t(L.Bread) };
   SiegeRam: IMaterialDefinition = { name: () => t(L.SiegeRam) };
   Caravel: IMaterialDefinition = { name: () => t(L.Caravel) };
   Galleon: IMaterialDefinition = { name: () => t(L.Galleon) };
   Frigate: IMaterialDefinition = { name: () => t(L.Frigate) };
   Cotton: IMaterialDefinition = { name: () => t(L.Cotton) };
   Garment: IMaterialDefinition = { name: () => t(L.Garment) };
   Furniture: IMaterialDefinition = { name: () => t(L.Furniture) };
   Opera: IMaterialDefinition = { name: () => t(L.Opera) };
   Poem: IMaterialDefinition = { name: () => t(L.Poem) };
   Painting: IMaterialDefinition = { name: () => t(L.Painting) };
   Music: IMaterialDefinition = { name: () => t(L.Music) };
   Cloth: IMaterialDefinition = { name: () => t(L.Cloth) };
   Newspaper: IMaterialDefinition = { name: () => t(L.Newspaper) };
   Magazine: IMaterialDefinition = { name: () => t(L.Magazine) };
   Flour: IMaterialDefinition = { name: () => t(L.Flour) };
   Book: IMaterialDefinition = { name: () => t(L.Book) };
   Faith: IMaterialDefinition = { name: () => t(L.Faith) };
   Coin: IMaterialDefinition = { name: () => t(L.Coin) };
   Banknote: IMaterialDefinition = { name: () => t(L.Banknote) };
   Bond: IMaterialDefinition = { name: () => t(L.Bond) };
   Cannon: IMaterialDefinition = { name: () => t(L.Cannon) };
   Dynamite: IMaterialDefinition = { name: () => t(L.Dynamite) };
   Gunpowder: IMaterialDefinition = { name: () => t(L.Gunpowder) };
   Coal: IMaterialDefinition = { name: () => t(L.Coal) };
   Sand: IMaterialDefinition = { name: () => t(L.Sand) };
   Glass: IMaterialDefinition = { name: () => t(L.Glass) };
   Lens: IMaterialDefinition = { name: () => t(L.Lens) };
   Philosophy: IMaterialDefinition = { name: () => t(L.Philosophy) };
   Culture: IMaterialDefinition = { name: () => t(L.Culture) };
   Law: IMaterialDefinition = { name: () => t(L.Law) };
   Steel: IMaterialDefinition = { name: () => t(L.Steel) };
   Engine: IMaterialDefinition = { name: () => t(L.Engine) };
   Train: IMaterialDefinition = { name: () => t(L.Train) };
   Rifle: IMaterialDefinition = { name: () => t(L.Rifle) };
   GatlingGun: IMaterialDefinition = { name: () => t(L.GatlingGun) };
   Ironclad: IMaterialDefinition = { name: () => t(L.Ironclad) };
   Battleship: IMaterialDefinition = { name: () => t(L.Battleship) };
   Artillery: IMaterialDefinition = { name: () => t(L.Artillery) };
   Biplane: IMaterialDefinition = { name: () => t(L.Biplane) };
   Sports: IMaterialDefinition = { name: () => t(L.Sports) };
   Stock: IMaterialDefinition = { name: () => t(L.Stock) };
   Tank: IMaterialDefinition = { name: () => t(L.Tank) };
   Politics: IMaterialDefinition = { name: () => t(L.Politics) };
   Oil: IMaterialDefinition = { name: () => t(L.Oil) };
   NaturalGas: IMaterialDefinition = { name: () => t(L.NaturalGas) };
   Aluminum: IMaterialDefinition = { name: () => t(L.Aluminum) };
   Petrol: IMaterialDefinition = { name: () => t(L.Petrol) };
   Concrete: IMaterialDefinition = { name: () => t(L.Concrete) };
   Explorer: IMaterialDefinition = { name: () => t(L.Explorer) };
   Plastics: IMaterialDefinition = { name: () => t(L.Plastics) };
   Uranium: IMaterialDefinition = { name: () => t(L.Uranium) };
   Car: IMaterialDefinition = { name: () => t(L.Car) };
   Movie: IMaterialDefinition = { name: () => t(L.Movie) };
   Radio: IMaterialDefinition = { name: () => t(L.Radio) };
   Rocket: IMaterialDefinition = { name: () => t(L.Rocket) };
   NuclearFuelRod: IMaterialDefinition = { name: () => t(L.NuclearFuelRod) };
   AtomicBomb: IMaterialDefinition = { name: () => t(L.AtomicBomb) };
   Diplomacy: IMaterialDefinition = { name: () => t(L.Diplomacy) };
   Cable: IMaterialDefinition = { name: () => t(L.Cable) };
   Satellite: IMaterialDefinition = { name: () => t(L.Satellite) };
   Airplane: IMaterialDefinition = { name: () => t(L.Airplane) };
   Spacecraft: IMaterialDefinition = { name: () => t(L.Spacecraft) };
   Silicon: IMaterialDefinition = { name: () => t(L.Silicon) };
   Forex: IMaterialDefinition = { name: () => t(L.Forex) };
   FighterJet: IMaterialDefinition = { name: () => t(L.FighterJet) };
   NuclearMissile: IMaterialDefinition = { name: () => t(L.NuclearMissile) };
   AircraftCarrier: IMaterialDefinition = { name: () => t(L.AircraftCarrier) };
   Semiconductor: IMaterialDefinition = { name: () => t(L.Semiconductor) };
   TV: IMaterialDefinition = { name: () => t(L.Television) };
   Computer: IMaterialDefinition = { name: () => t(L.Computer) };
   OpticalFiber: IMaterialDefinition = { name: () => t(L.OpticalFiber) };
   Submarine: IMaterialDefinition = { name: () => t(L.Submarine) };
   NuclearSubmarine: IMaterialDefinition = { name: () => t(L.NuclearSubmarine) };
   Teleport: IMaterialDefinition = { name: () => t(L.NuclearSubmarine) };
   Maglev: IMaterialDefinition = { name: () => t(L.Maglev) };
   Internet: IMaterialDefinition = { name: () => t(L.Internet) };
   Software: IMaterialDefinition = { name: () => t(L.Software) };
   MutualFund: IMaterialDefinition = { name: () => t(L.MutualFund) };
   HedgeFund: IMaterialDefinition = { name: () => t(L.HedgeFund) };
   Supercomputer: IMaterialDefinition = { name: () => t(L.Supercomputer) };
   CivTok: IMaterialDefinition = { name: () => t(L.CivTok) };
   CivOasis: IMaterialDefinition = { name: () => t(L.CivOasis) };
   Bitcoin: IMaterialDefinition = { name: () => t(L.Bitcoin) };
   CivGPT: IMaterialDefinition = { name: () => t(L.CivGPT) };
   Robocar: IMaterialDefinition = { name: () => t(L.Robocar) };
   PlanetaryRover: IMaterialDefinition = { name: () => t(L.PlanetaryRover) };
   Peace: IMaterialDefinition = { name: () => t(L.Peace) };
   Festival: IMaterialDefinition = { name: () => t(L.Festival) };
   Cycle: IMaterialDefinition = { name: () => t(L.Cycle) };
   TradeValue: IMaterialDefinition = { name: () => t(L.TradeValue) };
   Koti: IMaterialDefinition = { name: () => t(L.Koti) };
   Rebar: IMaterialDefinition = { name: () => t(L.Rebar) };
   ReinforcedConcrete: IMaterialDefinition = { name: () => t(L.ReinforcedConcrete) };
   FusionFuel: IMaterialDefinition = { name: () => t(L.FusionFuel) };
}

export type Material = keyof MaterialDefinitions;

export const NoPrice: PartialSet<Material> = {
   Worker: true,
   Power: true,
   Science: true,
   Festival: true,
   Warp: true,
   Explorer: true,
   Teleport: true,
   Cycle: true,
   TradeValue: true,
} as const;

export const NoStorage: PartialSet<Material> = {
   Worker: true,
   Power: true,
   Science: true,
   Warp: true,
   Festival: true,
   Cycle: true,
   TradeValue: true,
} as const;

export const IsDeposit = {
   Water: true,
   Copper: true,
   Iron: true,
   Wood: true,
   Stone: true,
   Gold: true,
   Coal: true,
   Oil: true,
   Aluminum: true,
   NaturalGas: true,
   Uranium: true,
} as const satisfies PartialSet<Material>;

export type Deposit = keyof typeof IsDeposit;
