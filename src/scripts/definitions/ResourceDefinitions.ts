import { L, t } from "../utilities/i18n";

export interface IResourceDefinition {
   name: () => string;
   canStore: boolean;
   canPrice: boolean;
}

export class ResourceDefinitions {
   Worker: IResourceDefinition = { name: () => t(L.Worker), canStore: false, canPrice: false };
   Wheat: IResourceDefinition = { name: () => t(L.Wheat), canStore: true, canPrice: true };
   Meat: IResourceDefinition = { name: () => t(L.Meat), canStore: true, canPrice: true };
   Fish: IResourceDefinition = { name: () => t(L.Fish), canStore: true, canPrice: true };
   Wood: IResourceDefinition = { name: () => t(L.Wood), canStore: true, canPrice: true };
   Lumber: IResourceDefinition = { name: () => t(L.Lumber), canStore: true, canPrice: true };
   Stone: IResourceDefinition = { name: () => t(L.Stone), canStore: true, canPrice: true };
   Brick: IResourceDefinition = { name: () => t(L.Brick), canStore: true, canPrice: true };
   Horse: IResourceDefinition = { name: () => t(L.Horse), canStore: true, canPrice: true };
   Marble: IResourceDefinition = { name: () => t(L.Marble), canStore: true, canPrice: true };
   Water: IResourceDefinition = { name: () => t(L.Water), canStore: true, canPrice: true };
   Copper: IResourceDefinition = { name: () => t(L.Copper), canStore: true, canPrice: true };
   Iron: IResourceDefinition = { name: () => t(L.Iron), canStore: true, canPrice: true };
   Gold: IResourceDefinition = { name: () => t(L.Gold), canStore: true, canPrice: true };
   Alcohol: IResourceDefinition = { name: () => t(L.Alcohol), canStore: true, canPrice: true };
   Tool: IResourceDefinition = { name: () => t(L.Tool), canStore: true, canPrice: true };
   Sword: IResourceDefinition = { name: () => t(L.Sword), canStore: true, canPrice: true };
   Armor: IResourceDefinition = { name: () => t(L.Armor), canStore: true, canPrice: true };
   Chariot: IResourceDefinition = { name: () => t(L.Chariot), canStore: true, canPrice: true };
   Knight: IResourceDefinition = { name: () => t(L.Knight), canStore: true, canPrice: true };
   Olive: IResourceDefinition = { name: () => t(L.Olive), canStore: true, canPrice: true };
   Grape: IResourceDefinition = { name: () => t(L.Grape), canStore: true, canPrice: true };
   Wine: IResourceDefinition = { name: () => t(L.Wine), canStore: true, canPrice: true };
   Paper: IResourceDefinition = { name: () => t(L.Paper), canStore: true, canPrice: true };
   OliveOil: IResourceDefinition = { name: () => t(L.OliveOil), canStore: true, canPrice: true };
   Cheese: IResourceDefinition = { name: () => t(L.Cheese), canStore: true, canPrice: true };
   Legion: IResourceDefinition = { name: () => t(L.Legion), canStore: true, canPrice: true };
   Milk: IResourceDefinition = { name: () => t(L.Milk), canStore: true, canPrice: true };
   Pizza: IResourceDefinition = { name: () => t(L.Pizza), canStore: true, canPrice: true };
   SiegeRam: IResourceDefinition = { name: () => t(L.SiegeRam), canStore: true, canPrice: true };
   Caravel: IResourceDefinition = { name: () => t(L.Caravel), canStore: true, canPrice: true };
   Galleon: IResourceDefinition = { name: () => t(L.Galleon), canStore: true, canPrice: true };
   Cotton: IResourceDefinition = { name: () => t(L.Cotton), canStore: true, canPrice: true };
   Garment: IResourceDefinition = { name: () => t(L.Garment), canStore: true, canPrice: true };
   // Garum: IResourceDefinition = { name: () => t(L.Garum), canStore: true, canPrice: true };
   Furniture: IResourceDefinition = { name: () => t(L.Furniture), canStore: true, canPrice: true };
   Opera: IResourceDefinition = { name: () => t(L.Opera), canStore: true, canPrice: true };
   Poem: IResourceDefinition = { name: () => t(L.Poem), canStore: true, canPrice: true };
   Music: IResourceDefinition = { name: () => t(L.Music), canStore: true, canPrice: true };
   Cloth: IResourceDefinition = { name: () => t(L.Cloth), canStore: true, canPrice: true };
   Newspaper: IResourceDefinition = { name: () => t(L.Newspaper), canStore: true, canPrice: true };
   Flour: IResourceDefinition = { name: () => t(L.Flour), canStore: true, canPrice: true };
   Science: IResourceDefinition = { name: () => t(L.Science), canStore: true, canPrice: false };
   Faith: IResourceDefinition = { name: () => t(L.Faith), canStore: true, canPrice: false };
}

export type Resource = keyof ResourceDefinitions;

export const DepositResources = {
   Water: true,
   Copper: true,
   Iron: true,
   Wood: true,
   Stone: true,
   Gold: true,
} as const satisfies Partial<Record<Resource, true>>;

export type Deposit = keyof typeof DepositResources;
