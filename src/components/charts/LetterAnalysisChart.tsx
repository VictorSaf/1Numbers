import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { chartTheme, SERIES } from './chartTheme';
import { analyzeIndividualLetters } from '@/lib/nameAnalysis';

interface LetterAnalysisChartProps {
  name: string;
}

const calculateLetterDistribution = (name: string) => {
  const letters = analyzeIndividualLetters(name);
  const distribution: Record<number, { count: number; vowels: number; consonants: number }> = {
    1: { count: 0, vowels: 0, consonants: 0 },
    2: { count: 0, vowels: 0, consonants: 0 },
    3: { count: 0, vowels: 0, consonants: 0 },
    4: { count: 0, vowels: 0, consonants: 0 },
    5: { count: 0, vowels: 0, consonants: 0 },
    6: { count: 0, vowels: 0, consonants: 0 },
    7: { count: 0, vowels: 0, consonants: 0 },
    8: { count: 0, vowels: 0, consonants: 0 },
    9: { count: 0, vowels: 0, consonants: 0 },
  };

  for (const letter of letters) {
    if (letter.value > 0 && letter.value <= 9) {
      distribution[letter.value].count++;
      if (letter.isVowel) {
        distribution[letter.value].vowels++;
      }
      if (letter.isConsonant) {
        distribution[letter.value].consonants++;
      }
    }
  }

  return Object.entries(distribution).map(([number, data]) => ({
    number: parseInt(number),
    total: data.count,
    vowels: data.vowels,
    consonants: data.consonants,
    percentage: letters.length > 0 ? Math.round((data.count / letters.length) * 100) : 0
  }));
};

export const LetterAnalysisChart = ({ name }: LetterAnalysisChartProps) => {
  const data = calculateLetterDistribution(name);

  return (
    <div className="w-full h-[300px]">
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
              if (name === 'total') return [`${value} litere`, 'Total'];
              if (name === 'vowels') return [`${value} vocale`, 'Vocale'];
              if (name === 'consonants') return [`${value} consoane`, 'Consoane'];
              return [value, name];
            }}
          />
          <Legend 
            wrapperStyle={{ color: chartTheme.label }}
            iconType="circle"
          />
          {/* Colour distinguishes the three series, which is what the legend
              names. It used to also vary per number, which the x-axis already
              says -- one encoding, not two. */}
          <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]} fill={SERIES[0]} />
          <Bar dataKey="vowels" name="Vocale" radius={[4, 4, 0, 0]} fill={SERIES[1]} />
          <Bar dataKey="consonants" name="Consoane" radius={[4, 4, 0, 0]} fill={SERIES[2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

