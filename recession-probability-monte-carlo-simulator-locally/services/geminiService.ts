import { GoogleGenAI } from "@google/genai";
import { type SimulationResult } from '../types';

const API_KEY = process.env.API_KEY;

/**
 * Checks if the Gemini API key is available in the environment variables.
 * @returns {boolean} True if the API key is set, false otherwise.
 */
export const isApiKeyConfigured = (): boolean => {
  return typeof API_KEY === 'string' && API_KEY.trim() !== '';
};

export const getRecessionContext = async (result: SimulationResult): Promise<string> => {
  if (!isApiKeyConfigured()) {
    return "AI analysis feature is disabled. An API key is required to get AI-powered context.";
  }
  
  const ai = new GoogleGenAI({ apiKey: API_KEY as string });
  const { recessionProbability, averageIndicators } = result;

  const prompt = `
    Analyze the following economic scenario based on a Monte Carlo simulation and provide a qualitative context.
    The simulation produced the following results:
    - Estimated Recession Probability: ${(recessionProbability * 100).toFixed(1)}%
    
    Average Simulated Indicators:
    - Yield Curve Spread (10yr-2yr Treasury): ${averageIndicators.yieldCurveSpread.toFixed(2)}%
    - Unemployment Rate: ${averageIndicators.unemploymentRate.toFixed(2)}%
    - Inflation Rate (CPI): ${averageIndicators.inflationRate.toFixed(2)}%
    - GDP per Capita Growth: ${averageIndicators.gdpPerCapitaGrowth.toFixed(2)}%
    - Composite Leading Indicator (CLI): ${averageIndicators.pointCLI.toFixed(2)}
    - ISM New Orders Index: ${averageIndicators.ismNewOrders.toFixed(2)}
    - ISM Supplier Deliveries Index: ${averageIndicators.ismSupplierDeliveries.toFixed(2)}
    - Leading Economic Index (MoM Change): ${averageIndicators.leadingIndexChange.toFixed(2)}%

    Based on these indicators, please provide a brief analysis covering the following points in markdown format:
    1.  **Scenario Analysis:** Briefly describe the overall economic picture these numbers paint. Is it a healthy economy, one on the brink, or one in a clear downturn?
    2.  **Primary Drivers:** Identify which indicator(s) are most likely contributing to the recession risk. For example, is this a potential recession driven by an inverted yield curve (investor sentiment), high unemployment (labor market weakness), high inflation (monetary policy tightening), or weak leading indicators?
    3.  **Potential Characteristics:** Describe what a recession with these characteristics might feel like for the average person (e.g., impact on jobs, cost of living, borrowing costs).

    Keep the analysis concise, clear, and easy for a non-economist to understand. Use markdown for formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "There was an error generating the analysis. This could be due to a configuration issue or network problem. Please check the console for details.";
  }
};