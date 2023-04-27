import { L, t } from "../utilities/i18n";

export interface IResourceDefinition {
   name: () => string;
   canStore: boolean;
   canPrice: boolean;
}

export class ResourceDefinitions {
   Worker: IResourceDefinition = { name: () => t(L.Worker), canStore: false, canPrice: false };
   Crop: IResourceDefinition = { name: () => t(L.Crop), canStore: true, canPrice: true };
   Meat: IResourceDefinition = { name: () => t(L.Meat), canStore: true, canPrice: true };
   Wood: IResourceDefinition = { name: () => t(L.Wood), canStore: true, canPrice: true };
   Stone: IResourceDefinition = { name: () => t(L.Stone), canStore: true, canPrice: true };
   Brick: IResourceDefinition = { name: () => t(L.Brick), canStore: true, canPrice: true };
   Water: IResourceDefinition = { name: () => t(L.Water), canStore: true, canPrice: true };
   Copper: IResourceDefinition = { name: () => t(L.Copper), canStore: true, canPrice: true };
   Iron: IResourceDefinition = { name: () => t(L.Iron), canStore: true, canPrice: true };
   Alcohol: IResourceDefinition = { name: () => t(L.Alcohol), canStore: true, canPrice: true };
   Tool: IResourceDefinition = { name: () => t(L.Tool), canStore: true, canPrice: true };
   Weapon: IResourceDefinition = { name: () => t(L.Weapon), canStore: true, canPrice: true };
   Legion: IResourceDefinition = { name: () => t(L.Legion), canStore: true, canPrice: true };
   Science: IResourceDefinition = { name: () => t(L.Science), canStore: true, canPrice: false };
   Cash: IResourceDefinition = { name: () => t(L.Cash), canStore: true, canPrice: false };
}

export type Resource = keyof ResourceDefinitions;

export const DepositResources = {
   Water: true,
   Copper: true,
   Iron: true,
   Wood: true,
   Stone: true,
} as const;

export type Deposit = keyof typeof DepositResources;
