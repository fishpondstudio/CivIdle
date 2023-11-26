export const Features = {
   BuildingProductionPriority: true,
   BuildingStockpileMode: true,
   WarehouseUpgrade: true,
} as const;

export type Feature = keyof typeof Features;
