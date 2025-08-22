
import React, { useRef } from 'react';
import { type EconomicIndicators } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface IndicatorInputProps {
  indicators: EconomicIndicators;
  onIndicatorChange: <K extends keyof EconomicIndicators>(key: K, value: number) => void;
  onCsvUpload: (file: File) => void;
  csvError: string;
  isRunning: boolean;
}

const IndicatorSlider: React.FC<{
    id: keyof EconomicIndicators;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    description: string;
    isRunning: boolean;
    onIndicatorChange: (key: keyof EconomicIndicators, value: number) => void;
}> = ({ id, label, value, min, max, step, description, isRunning, onIndicatorChange }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label htmlFor={id} className="font-medium text-gray-300">{label}</label>
            <span className="px-2 py-1 text-sm font-mono bg-gray-700 rounded-md text-cyan-400">
                {value.toFixed(id === 'pointCLI' ? 1 : 2)}
            </span>
        </div>
        <p className="text-xs text-gray-500 mb-2">{description}</p>
        <input
            type="range"
            id={id}
            name={id}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onIndicatorChange(id, parseFloat(e.target.value))}
            disabled={isRunning}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:accent-gray-600 disabled:cursor-not-allowed"
        />
    </div>
);


const IndicatorInput: React.FC<IndicatorInputProps> = ({ indicators, onIndicatorChange, onCsvUpload, csvError, isRunning }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const coreIndicators = [
    { key: 'yieldCurveSpread', label: 'Yield Curve Spread (%)', min: -2, max: 4, step: 0.01, description: '10-Yr minus 2-Yr Treasury yield. Inversion is a classic recession predictor.' },
    { key: 'unemploymentRate', label: 'Unemployment Rate (%)', min: 2, max: 12, step: 0.1, description: 'Percentage of the labor force that is jobless. A sharp increase is a warning sign.' },
    { key: 'inflationRate', label: 'Inflation Rate (CPI %)', min: -1, max: 10, step: 0.1, description: 'Year-over-year CPI change. High inflation can trigger policy tightening.' },
  ];
  
  const leadingIndicators = [
      { key: 'gdpPerCapitaGrowth', label: 'GDP per Capita Growth (%)', min: -5, max: 7, step: 0.1, description: 'Annualized growth in economic output per person.' },
      { key: 'pointCLI', label: 'Composite Leading Indicator', min: 95, max: 105, step: 0.1, description: 'Index designed to signal turning points in the business cycle. Above 100 suggests growth.' },
      { key: 'ismNewOrders', label: 'ISM New Orders Index', min: 30, max: 70, step: 0.5, description: 'Manufacturing new orders. Above 50 indicates expansion.'},
      { key: 'ismSupplierDeliveries', label: 'ISM Supplier Deliveries', min: 30, max: 70, step: 0.5, description: 'Speed of supplier deliveries. Higher values can mean strong demand or supply bottlenecks.'},
      { key: 'leadingIndexChange', label: 'Leading Index (MoM %)', min: -2, max: 2, step: 0.1, description: 'Month-over-month change in the LEI. Negative values signal a slowdown.'},
  ];

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onCsvUpload(file);
    }
  };

  return (
    <Card className="w-full">
      <h2 className="text-2xl font-semibold text-white mb-6">Economic Indicators</h2>
      
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-indigo-400 border-b border-gray-700 pb-2">Core Indicators</h3>
        {coreIndicators.map(({ key, ...rest }) => (
          <IndicatorSlider 
            key={key} 
            id={key as keyof EconomicIndicators}
            value={indicators[key as keyof EconomicIndicators]}
            onIndicatorChange={onIndicatorChange}
            isRunning={isRunning}
            {...rest}
          />
        ))}

        <h3 className="text-lg font-semibold text-indigo-400 border-b border-gray-700 pb-2 pt-4">Growth & Leading Indicators</h3>
        {leadingIndicators.map(({ key, ...rest }) => (
          <IndicatorSlider 
            key={key} 
            id={key as keyof EconomicIndicators}
            value={indicators[key as keyof EconomicIndicators]}
            onIndicatorChange={onIndicatorChange}
            isRunning={isRunning}
            {...rest}
          />
        ))}
      </div>

      <div className="mt-8 border-t border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Or Upload Data</h3>
          <p className="text-xs text-gray-500 mb-4">
            Upload a CSV file with a header row and one data row. Headers should match indicator IDs (e.g., `yieldCurveSpread`, `unemploymentRate`).
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".csv"
            disabled={isRunning}
          />
          <Button onClick={handleFileButtonClick} disabled={isRunning} variant="secondary">
            Upload CSV File
          </Button>
          {csvError && <p className="text-red-400 text-sm mt-3">{csvError}</p>}
      </div>
    </Card>
  );
};

export default IndicatorInput;
