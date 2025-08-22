
import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { type EconomicIndicators, type SimulationResult } from '../types';
import { Card } from './ui/Card';

interface ResultsDisplayProps {
  result: SimulationResult | null;
}

const IndicatorStat: React.FC<{label: string; value: string | number}> = ({label, value}) => (
    <div className="text-center bg-gray-900/50 p-2 rounded-lg">
        <p className="text-gray-400 text-sm truncate">{label}</p>
        <p className="text-lg font-semibold text-cyan-400">{value}</p>
    </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  if (!result) {
    return (
      <Card className="w-full flex items-center justify-center min-h-[300px] lg:min-h-full">
        <p className="text-gray-500">Run the simulation to see the results.</p>
      </Card>
    );
  }

  const probability = Math.round(result.recessionProbability * 100);
  const data = [{ name: 'probability', value: probability }];
  
  const color = probability > 75 ? '#ef4444' : probability > 50 ? '#f97316' : probability > 25 ? '#eab308' : '#22c55e';

  const formatIndicator = (key: keyof EconomicIndicators, value: number) => {
    switch(key) {
        case 'yieldCurveSpread':
        case 'unemploymentRate':
        case 'inflationRate':
        case 'gdpPerCapitaGrowth':
        case 'leadingIndexChange':
            return `${value.toFixed(2)}%`;
        case 'pointCLI':
        case 'ismNewOrders':
        case 'ismSupplierDeliveries':
        default:
            return value.toFixed(2);
    }
  }

  return (
    <Card className="w-full">
      <h2 className="text-2xl font-semibold text-white mb-4 text-center">Simulation Results</h2>
      <div className="relative h-64 w-64 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="80%"
            outerRadius="100%"
            barSize={20}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              dataKey="value"
              angleAxisId={0}
              fill={color}
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold" style={{ color }}>{`${probability}%`}</span>
            <span className="text-gray-400 text-lg mt-1">Recession Risk</span>
        </div>
      </div>
      <div className="mt-6 border-t border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-center text-gray-300 mb-3">Average Simulated Indicators</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
           <IndicatorStat label="Yield Curve" value={formatIndicator('yieldCurveSpread', result.averageIndicators.yieldCurveSpread)} />
           <IndicatorStat label="Unemployment" value={formatIndicator('unemploymentRate', result.averageIndicators.unemploymentRate)} />
           <IndicatorStat label="Inflation" value={formatIndicator('inflationRate', result.averageIndicators.inflationRate)} />
           <IndicatorStat label="GDP Growth" value={formatIndicator('gdpPerCapitaGrowth', result.averageIndicators.gdpPerCapitaGrowth)} />
           <IndicatorStat label="CLI" value={formatIndicator('pointCLI', result.averageIndicators.pointCLI)} />
           <IndicatorStat label="New Orders" value={formatIndicator('ismNewOrders', result.averageIndicators.ismNewOrders)} />
           <IndicatorStat label="Deliveries" value={formatIndicator('ismSupplierDeliveries', result.averageIndicators.ismSupplierDeliveries)} />
           <IndicatorStat label="LEI Change" value={formatIndicator('leadingIndexChange', result.averageIndicators.leadingIndexChange)} />
        </div>
      </div>
    </Card>
  );
};

export default ResultsDisplay;
