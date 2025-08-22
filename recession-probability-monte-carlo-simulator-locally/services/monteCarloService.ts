
import { type EconomicIndicators, type SimulationParams, type SimulationResult } from '../types';

// These coefficients are for illustrative purposes to create a plausible logistic regression model.
// P(Recession) = 1 / (1 + exp(-z)) where z is the linear combination below.
const COEFFICIENTS = {
  INTERCEPT: -2.5, // Adjusted intercept to balance new variables
  YIELD_CURVE: -1.7,  // A negative (inverted) yield curve strongly increases recession odds.
  UNEMPLOYMENT: 2.6,  // A rising unemployment rate strongly increases odds.
  INFLATION: 0.3,     // High inflation moderately increases odds.
  GDP_GROWTH: -0.8,   // Strong GDP growth decreases odds.
  POINT_CLI: -0.1,    // A high CLI value decreases odds.
  ISM_NEW_ORDERS: -0.15, // Strong new orders decrease odds.
  ISM_SUPPLIER_DELIVERIES: -0.05, // Faster deliveries (lower index) can signal weakness, so a negative coefficient on a high value is appropriate.
  LEADING_INDEX: -1.2, // A positive change in the LEI decreases odds.
};

// Standard deviation for randomization in each trial, representing market volatility.
const VOLATILITY = {
  YIELD_CURVE: 0.5,
  UNEMPLOYMENT: 0.2,
  INFLATION: 0.75,
  GDP_GROWTH: 0.5,
  POINT_CLI: 0.8,
  ISM_NEW_ORDERS: 2.0,
  ISM_SUPPLIER_DELIVERIES: 2.5,
  LEADING_INDEX: 0.4,
};

// Generates a random number from a normal distribution. (Box-Muller transform)
const randomNormal = (mean: number, stdDev: number): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
};


export const runMonteCarloSimulation = (params: SimulationParams): SimulationResult => {
  const { indicators, trials } = params;
  let recessionCount = 0;
  
  const totalIndicators: EconomicIndicators = {
    yieldCurveSpread: 0,
    unemploymentRate: 0,
    inflationRate: 0,
    gdpPerCapitaGrowth: 0,
    pointCLI: 0,
    ismNewOrders: 0,
    ismSupplierDeliveries: 0,
    leadingIndexChange: 0,
  };

  for (let i = 0; i < trials; i++) {
    // 1. Introduce randomness to each indicator for this trial
    const trialYieldCurve = randomNormal(indicators.yieldCurveSpread, VOLATILITY.YIELD_CURVE);
    const trialUnemployment = randomNormal(indicators.unemploymentRate, VOLATILITY.UNEMPLOYMENT);
    const trialInflation = randomNormal(indicators.inflationRate, VOLATILITY.INFLATION);
    const trialGdpGrowth = randomNormal(indicators.gdpPerCapitaGrowth, VOLATILITY.GDP_GROWTH);
    const trialPointCli = randomNormal(indicators.pointCLI, VOLATILITY.POINT_CLI);
    const trialIsmNewOrders = randomNormal(indicators.ismNewOrders, VOLATILITY.ISM_NEW_ORDERS);
    const trialIsmSupplierDeliveries = randomNormal(indicators.ismSupplierDeliveries, VOLATILITY.ISM_SUPPLIER_DELIVERIES);
    const trialLeadingIndex = randomNormal(indicators.leadingIndexChange, VOLATILITY.LEADING_INDEX);

    // Accumulate for averaging later
    totalIndicators.yieldCurveSpread += trialYieldCurve;
    totalIndicators.unemploymentRate += trialUnemployment;
    totalIndicators.inflationRate += trialInflation;
    totalIndicators.gdpPerCapitaGrowth += trialGdpGrowth;
    totalIndicators.pointCLI += trialPointCli;
    totalIndicators.ismNewOrders += trialIsmNewOrders;
    totalIndicators.ismSupplierDeliveries += trialIsmSupplierDeliveries;
    totalIndicators.leadingIndexChange += trialLeadingIndex;

    // 2. Calculate the 'z' value for the logistic function
    const z = COEFFICIENTS.INTERCEPT +
              (COEFFICIENTS.YIELD_CURVE * trialYieldCurve) +
              (COEFFICIENTS.UNEMPLOYMENT * trialUnemployment) +
              (COEFFICIENTS.INFLATION * trialInflation) +
              (COEFFICIENTS.GDP_GROWTH * trialGdpGrowth) +
              (COEFFICIENTS.POINT_CLI * trialPointCli) +
              (COEFFICIENTS.ISM_NEW_ORDERS * trialIsmNewOrders) +
              (COEFFICIENTS.ISM_SUPPLIER_DELIVERIES * trialIsmSupplierDeliveries) +
              (COEFFICIENTS.LEADING_INDEX * trialLeadingIndex);

    // 3. Calculate the probability of recession for this trial
    const probability = 1 / (1 + Math.exp(-z));

    // 4. Determine if this trial results in a recession
    if (Math.random() < probability) {
      recessionCount++;
    }
  }

  const recessionProbability = recessionCount / trials;

  const averageIndicators: EconomicIndicators = {
    yieldCurveSpread: totalIndicators.yieldCurveSpread / trials,
    unemploymentRate: totalIndicators.unemploymentRate / trials,
    inflationRate: totalIndicators.inflationRate / trials,
    gdpPerCapitaGrowth: totalIndicators.gdpPerCapitaGrowth / trials,
    pointCLI: totalIndicators.pointCLI / trials,
    ismNewOrders: totalIndicators.ismNewOrders / trials,
    ismSupplierDeliveries: totalIndicators.ismSupplierDeliveries / trials,
    leadingIndexChange: totalIndicators.leadingIndexChange / trials,
  };

  return { recessionProbability, averageIndicators };
};
