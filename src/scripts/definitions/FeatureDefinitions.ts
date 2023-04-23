export const Features = {
   BuildingProductionPriority: true,
   BuildingStockpileMode: true,
} as const;

export type Feature = keyof typeof Features;
