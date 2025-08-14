
import React, { useState, useCallback } from 'react';
import { type EconomicIndicators, type SimulationResult } from './types';
import { runMonteCarloSimulation } from './services/monteCarloService';
import { getRecessionContext } from './services/geminiService';
import Header from './components/Header';
import IndicatorInput from './components/IndicatorInput';
import ResultsDisplay from './components/ResultsDisplay';
import { ContextAnalysis } from './components/ContextAnalysis';
import { Button } from './components/ui/Button';

// SVG Icon Component defined within App.tsx to avoid extra dependencies
const ArrowRight: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const App: React.FC = () => {
  const [indicators, setIndicators] = useState<EconomicIndicators>({
    yieldCurveSpread: 0.5,
    unemploymentRate: 4.0,
    inflationRate: 2.5,
    gdpPerCapitaGrowth: 2.0,
    pointCLI: 100.2,
    ismNewOrders: 52.0,
    ismSupplierDeliveries: 51.0,
    leadingIndexChange: 0.2,
  });
  
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [csvError, setCsvError] = useState<string>('');

  const handleIndicatorChange = useCallback(<K extends keyof EconomicIndicators>(key: K, value: number) => {
    setIndicators(prev => ({ ...prev, [key]: value }));
    setCsvError(''); // Clear error on manual change
  }, []);
  
  const handleCsvUpload = useCallback((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
          const text = event.target?.result as string;
          if (!text) {
              setCsvError("Could not read the file.");
              return;
          }

          try {
              const lines = text.trim().split(/\r?\n/);
              if (lines.length < 2) {
                  throw new Error("CSV must have a header row and at least one data row.");
              }
              
              const headers = lines[0].split(',').map(h => h.trim());
              const values = lines[1].split(',').map(v => v.trim());

              const newIndicators = { ...indicators }; // Start with defaults
              let indicatorsFound = 0;

              headers.forEach((header, index) => {
                  if (header in newIndicators) {
                      const value = parseFloat(values[index]);
                      if (isNaN(value)) {
                          throw new Error(`Invalid non-numeric value for '${header}'.`);
                      }
                      (newIndicators as any)[header] = value;
                      indicatorsFound++;
                  }
              });

              if (indicatorsFound === 0) {
                throw new Error("No matching indicator columns found in CSV header.");
              }

              setIndicators(newIndicators);
              setCsvError(''); // Clear any previous errors
          } catch (error) {
              if (error instanceof Error) {
                  setCsvError(`CSV Parse Error: ${error.message}`);
              } else {
                  setCsvError("An unknown error occurred while parsing the CSV.");
              }
          }
      };
      reader.onerror = () => {
          setCsvError("Failed to read the file.");
      };
      reader.readAsText(file);
  }, [indicators]);

  const handleRunSimulation = useCallback(() => {
    setIsSimulating(true);
    setSimulationResult(null); // Clear previous results
    setAnalysis(''); // Clear previous analysis
    setCsvError(''); // Clear error
    
    // Simulate a delay to show loading state, as the calculation is very fast
    setTimeout(() => {
      const result = runMonteCarloSimulation({ indicators, trials: 20000 });
      setSimulationResult(result);
      setIsSimulating(false);
    }, 500);
  }, [indicators]);

  const handleGetContext = useCallback(async () => {
    if (!simulationResult) return;
    
    setIsAnalyzing(true);
    setAnalysis(''); // Clear previous analysis
    const context = await getRecessionContext(simulationResult);
    setAnalysis(context);
    setIsAnalyzing(false);
  }, [simulationResult]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 md:p-8">
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10" 
        style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}
      ></div>
      <div className="relative max-w-7xl mx-auto">
        <Header />
        
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8">
            <IndicatorInput 
              indicators={indicators} 
              onIndicatorChange={handleIndicatorChange}
              onCsvUpload={handleCsvUpload}
              csvError={csvError}
              isRunning={isSimulating}
            />
             <div className="flex justify-center">
                <Button onClick={handleRunSimulation} disabled={isSimulating}>
                  {isSimulating ? 'Simulating...' : 'Run Simulation'}
                  {!isSimulating && <ArrowRight className="inline ml-2 h-5 w-5" />}
                </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-8">
            <ResultsDisplay result={simulationResult} />
          </div>
        </main>
        
        <section className="mt-8">
           <ContextAnalysis 
              analysis={analysis} 
              onGetContext={handleGetContext} 
              isLoading={isAnalyzing}
              hasResult={!!simulationResult}
           />
        </section>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>This simulation is for illustrative and educational purposes only and does not constitute financial advice.</p>
          <p>Model coefficients are not empirically derived from historical data.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
