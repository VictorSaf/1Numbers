import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
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

const COLORS = [
  'hsl(45 80% 55%)',   // 1 - Gold
  'hsl(280 50% 50%)',  // 2 - Purple
  'hsl(200 70% 50%)',  // 3 - Blue
  'hsl(120 50% 45%)',  // 4 - Green
  'hsl(35 90% 55%)',   // 5 - Orange
  'hsl(340 70% 55%)',  // 6 - Pink
  'hsl(260 60% 55%)',  // 7 - Violet
  'hsl(180 60% 45%)',  // 8 - Teal
  'hsl(0 70% 55%)',    // 9 - Red
];

export const NumberDistributionChart = ({ name }: NumberDistributionChartProps) => {
  const data = calculateLetterDistribution(name);

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <XAxis 
            dataKey="number" 
            tick={{ fill: 'hsl(45 30% 95%)', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(260 30% 20%)' }}
          />
          <YAxis 
            tick={{ fill: 'hsl(240 10% 60%)', fontSize: 10 }}
            axisLine={{ stroke: 'hsl(260 30% 20%)' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(240 15% 12%)',
              border: '1px solid hsl(260 30% 20%)',
              borderRadius: '8px',
              color: 'hsl(45 30% 95%)'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'count') return [`${value} letters`, 'Count'];
              return [value, name];
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
