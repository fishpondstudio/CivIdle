import type { PartialSet } from "../utilities/TypeDefinitions";
import { L, t } from "../utilities/i18n";

export interface IResourceDefinition {
   name: () => string;
}

export class ResourceDefinitions {
   Worker: IResourceDefinition = { name: () => t(L.Worker) };
   Power: IResourceDefinition = { name: () => t(L.Power) };
   Science: IResourceDefinition = { name: () => t(L.Science) };
   Warp: IResourceDefinition = { name: () => t(L.Warp) };
   Wheat: IResourceDefinition = { name: () => t(L.Wheat) };
   Meat: IResourceDefinition = { name: () => t(L.Meat) };
   Wood: IResourceDefinition = { name: () => t(L.Wood) };
   Lumber: IResourceDefinition = { name: () => t(L.Lumber) };
   Stone: IResourceDefinition = { name: () => t(L.Stone) };
   Brick: IResourceDefinition = { name: () => t(L.Brick) };
   Horse: IResourceDefinition = { name: () => t(L.Horse) };
   Marble: IResourceDefinition = { name: () => t(L.Marble) };
   Water: IResourceDefinition = { name: () => t(L.Water) };
   Copper: IResourceDefinition = { name: () => t(L.Copper) };
   Iron: IResourceDefinition = { name: () => t(L.Iron) };
   Gold: IResourceDefinition = { name: () => t(L.Gold) };
   Alcohol: IResourceDefinition = { name: () => t(L.Alcohol) };
   Tool: IResourceDefinition = { name: () => t(L.Tool) };
   Sword: IResourceDefinition = { name: () => t(L.Sword) };
   Armor: IResourceDefinition = { name: () => t(L.Armor) };
   Chariot: IResourceDefinition = { name: () => t(L.Chariot) };
   Knight: IResourceDefinition = { name: () => t(L.Knight) };
   Paper: IResourceDefinition = { name: () => t(L.Paper) };
   Cheese: IResourceDefinition = { name: () => t(L.Cheese) };
   Milk: IResourceDefinition = { name: () => t(L.Milk) };
   Pizza: IResourceDefinition = { name: () => t(L.Pizza) };
   Bread: IResourceDefinition = { name: () => t(L.Bread) };
   SiegeRam: IResourceDefinition = { name: () => t(L.SiegeRam) };
   Caravel: IResourceDefinition = { name: () => t(L.Caravel) };
   Galleon: IResourceDefinition = { name: () => t(L.Galleon) };
   Frigate: IResourceDefinition = { name: () => t(L.Frigate) };
   Cotton: IResourceDefinition = { name: () => t(L.Cotton) };
   Garment: IResourceDefinition = { name: () => t(L.Garment) };
   Furniture: IResourceDefinition = { name: () => t(L.Furniture) };
   Opera: IResourceDefinition = { name: () => t(L.Opera) };
   Poem: IResourceDefinition = { name: () => t(L.Poem) };
   Painting: IResourceDefinition = { name: () => t(L.Painting) };
   Music: IResourceDefinition = { name: () => t(L.Music) };
   Cloth: IResourceDefinition = { name: () => t(L.Cloth) };
   Newspaper: IResourceDefinition = { name: () => t(L.Newspaper) };
   Magazine: IResourceDefinition = { name: () => t(L.Magazine) };
   Flour: IResourceDefinition = { name: () => t(L.Flour) };
   Book: IResourceDefinition = { name: () => t(L.Book) };
   Faith: IResourceDefinition = { name: () => t(L.Faith) };
   Coin: IResourceDefinition = { name: () => t(L.Coin) };
   Banknote: IResourceDefinition = { name: () => t(L.Banknote) };
   Bond: IResourceDefinition = { name: () => t(L.Bond) };
   Cannon: IResourceDefinition = { name: () => t(L.Cannon) };
   Dynamite: IResourceDefinition = { name: () => t(L.Dynamite) };
   Gunpowder: IResourceDefinition = { name: () => t(L.Gunpowder) };
   Coal: IResourceDefinition = { name: () => t(L.Coal) };
   Sand: IResourceDefinition = { name: () => t(L.Sand) };
   Glass: IResourceDefinition = { name: () => t(L.Glass) };
   Lens: IResourceDefinition = { name: () => t(L.Lens) };
   Philosophy: IResourceDefinition = { name: () => t(L.Philosophy) };
   Culture: IResourceDefinition = { name: () => t(L.Culture) };
   Law: IResourceDefinition = { name: () => t(L.Law) };
   Steel: IResourceDefinition = { name: () => t(L.Steel) };
   Engine: IResourceDefinition = { name: () => t(L.Engine) };
   Train: IResourceDefinition = { name: () => t(L.Train) };
   Rifle: IResourceDefinition = { name: () => t(L.Rifle) };
   GatlingGun: IResourceDefinition = { name: () => t(L.GatlingGun) };
   Ironclad: IResourceDefinition = { name: () => t(L.Ironclad) };
   Battleship: IResourceDefinition = { name: () => t(L.Battleship) };
   Artillery: IResourceDefinition = { name: () => t(L.Artillery) };
   Biplane: IResourceDefinition = { name: () => t(L.Biplane) };
   Sports: IResourceDefinition = { name: () => t(L.Sports) };
   Stock: IResourceDefinition = { name: () => t(L.Stock) };
   Tank: IResourceDefinition = { name: () => t(L.Tank) };
   Politics: IResourceDefinition = { name: () => t(L.Politics) };
   Oil: IResourceDefinition = { name: () => t(L.Oil) };
   NaturalGas: IResourceDefinition = { name: () => t(L.NaturalGas) };
   Aluminum: IResourceDefinition = { name: () => t(L.Aluminum) };
   Petrol: IResourceDefinition = { name: () => t(L.Petrol) };
   Concrete: IResourceDefinition = { name: () => t(L.Concrete) };
   Explorer: IResourceDefinition = { name: () => t(L.Explorer) };
   Plastics: IResourceDefinition = { name: () => t(L.Plastics) };
   Uranium: IResourceDefinition = { name: () => t(L.Uranium) };
   Car: IResourceDefinition = { name: () => t(L.Car) };
   Movie: IResourceDefinition = { name: () => t(L.Movie) };
   Radio: IResourceDefinition = { name: () => t(L.Radio) };
   Rocket: IResourceDefinition = { name: () => t(L.Rocket) };
   NuclearFuelRod: IResourceDefinition = { name: () => t(L.NuclearFuelRod) };
   AtomicBomb: IResourceDefinition = { name: () => t(L.AtomicBomb) };
   Diplomacy: IResourceDefinition = { name: () => t(L.Diplomacy) };
   Cable: IResourceDefinition = { name: () => t(L.Cable) };
   Satellite: IResourceDefinition = { name: () => t(L.Satellite) };
   Airplane: IResourceDefinition = { name: () => t(L.Airplane) };
   Spacecraft: IResourceDefinition = { name: () => t(L.Spacecraft) };
   Silicon: IResourceDefinition = { name: () => t(L.Silicon) };
   Forex: IResourceDefinition = { name: () => t(L.Forex) };
   FighterJet: IResourceDefinition = { name: () => t(L.FighterJet) };
   NuclearMissile: IResourceDefinition = { name: () => t(L.NuclearMissile) };
   AircraftCarrier: IResourceDefinition = { name: () => t(L.AircraftCarrier) };
   Semiconductor: IResourceDefinition = { name: () => t(L.Semiconductor) };
   TV: IResourceDefinition = { name: () => t(L.Television) };
   Computer: IResourceDefinition = { name: () => t(L.Computer) };
   OpticalFiber: IResourceDefinition = { name: () => t(L.OpticalFiber) };
   Submarine: IResourceDefinition = { name: () => t(L.Submarine) };
   NuclearSubmarine: IResourceDefinition = { name: () => t(L.NuclearSubmarine) };
   Teleport: IResourceDefinition = { name: () => t(L.NuclearSubmarine) };
   Maglev: IResourceDefinition = { name: () => t(L.Maglev) };
   Internet: IResourceDefinition = { name: () => t(L.Internet) };
   Software: IResourceDefinition = { name: () => t(L.Software) };
   MutualFund: IResourceDefinition = { name: () => t(L.MutualFund) };
   HedgeFund: IResourceDefinition = { name: () => t(L.HedgeFund) };
   Supercomputer: IResourceDefinition = { name: () => t(L.Supercomputer) };
   CivTok: IResourceDefinition = { name: () => t(L.CivTok) };
   CivOasis: IResourceDefinition = { name: () => t(L.CivOasis) };
   Bitcoin: IResourceDefinition = { name: () => t(L.Bitcoin) };
   CivGPT: IResourceDefinition = { name: () => t(L.CivGPT) };
   Robocar: IResourceDefinition = { name: () => t(L.Robocar) };
   PlanetaryRover: IResourceDefinition = { name: () => t(L.PlanetaryRover) };
   Peace: IResourceDefinition = { name: () => t(L.Peace) };
   Festival: IResourceDefinition = { name: () => t(L.Festival) };
   Cycle: IResourceDefinition = { name: () => t(L.Cycle) };
   TradeValue: IResourceDefinition = { name: () => t(L.TradeValue) };
}

export type Resource = keyof ResourceDefinitions;

export const NoPrice: PartialSet<Resource> = {
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

export const NoStorage: PartialSet<Resource> = {
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
} as const satisfies PartialSet<Resource>;

export type Deposit = keyof typeof IsDeposit;
