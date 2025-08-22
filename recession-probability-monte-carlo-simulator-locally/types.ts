
export interface EconomicIndicators {
  yieldCurveSpread: number; // e.g., 10yr - 2yr yield, can be negative
  unemploymentRate: number; // %
  inflationRate: number;    // CPI %
  gdpPerCapitaGrowth: number; // % annual growth
  pointCLI: number; // Composite Leading Indicator index value
  ismNewOrders: number; // ISM Manufacturing: New Orders Index
  ismSupplierDeliveries: number; // ISM Manufacturing: Supplier Deliveries Index
  leadingIndexChange: number; // Leading Economic Index month-over-month change %
}

export interface SimulationParams {
  indicators: EconomicIndicators;
  trials: number;
}

export interface SimulationResult {
  recessionProbability: number;
  averageIndicators: EconomicIndicators;
}
