import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { chartTheme, SERIES } from './chartTheme';
import { classifyFullName } from '@/lib/numerology-plus/core';
import { inclusionTable } from '@/lib/numerology-plus/pythagorean';

interface NumberDistributionChartProps {
  name: string;
}

// Frequencies come from the engine. The table that used to live here dropped
// diacritics instead of transliterating them, so for a name like Stefan Muresan
// this chart drew bars for eleven letters while the rest of the page counted
// thirteen -- two different answers to the same question, side by side.
const calculateLetterDistribution = (name: string) => {
  const distribution = inclusionTable(name);
  const total = classifyFullName(name).length;

  return Object.entries(distribution).map(([number, count]) => ({
    number: parseInt(number),
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));
};

export const NumberDistributionChart = ({ name }: NumberDistributionChartProps) => {
  const data = calculateLetterDistribution(name);

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <XAxis 
            dataKey="number" 
            tick={{ fill: chartTheme.label, fontSize: 12 }}
            axisLine={{ stroke: chartTheme.line }}
          />
          <YAxis 
            tick={{ fill: chartTheme.labelMuted, fontSize: 10 }}
            axisLine={{ stroke: chartTheme.line }}
          />
          <Tooltip 
            contentStyle={chartTheme.tooltip}
            formatter={(value: number, name: string) => {
              if (name === 'count') return [`${value} letters`, 'Count'];
              return [value, name];
            }}
          />
          {/* One colour: the number is on the x-axis, so a hue per bar
              repeats what the reader can already see. */}
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill={SERIES[0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
