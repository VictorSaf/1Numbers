/**
 * Journal system for Numerology Compass
 * Handles journal entries, prediction history, and statistics
 */

export interface JournalEntry {
  id: string;
  userId: string;
  entryType: 'journal' | 'prediction';
  title: string;
  content?: string;
  date: string;
  numerologyData?: Record<string, unknown>;
  tags?: string[];
  mood?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalStatistics {
  totalEntries: number;
  entriesByType: Record<string, number>;
  entriesByMood: Array<{ mood: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
  entriesPerMonth: Array<{ month: string; count: number }>;
}

export interface PredictionEntry extends JournalEntry {
  entryType: 'prediction';
  numerologyData: {
    personalDay?: number;
    personalMonth?: number;
    personalYear?: number;
    prediction?: string;
    actualOutcome?: string;
    accuracy?: number;
  };
}

/**
 * Analyze prediction accuracy
 */
export const analyzePredictionAccuracy = (predictions: PredictionEntry[]): {
  totalPredictions: number;
  ratedPredictions: number;
  averageAccuracy: number;
  accuracyDistribution: Array<{ range: string; count: number }>;
  mostAccuratePeriod: string | null;
} => {
  const rated = predictions.filter(p => 
    p.numerologyData?.accuracy !== undefined && p.numerologyData.accuracy !== null
  );

  const totalPredictions = predictions.length;
  const ratedPredictions = rated.length;

  const averageAccuracy = rated.length > 0
    ? rated.reduce((sum, p) => sum + (p.numerologyData?.accuracy || 0), 0) / rated.length
    : 0;

  // Accuracy distribution
  const distribution: Record<string, number> = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
  };

  rated.forEach(p => {
    const accuracy = p.numerologyData?.accuracy || 0;
    if (accuracy <= 20) distribution['0-20']++;
    else if (accuracy <= 40) distribution['21-40']++;
    else if (accuracy <= 60) distribution['41-60']++;
    else if (accuracy <= 80) distribution['61-80']++;
    else distribution['81-100']++;
  });

  const accuracyDistribution = Object.entries(distribution).map(([range, count]) => ({
    range,
    count,
  }));

  // Most accurate period (month)
  const monthlyAccuracy: Record<string, number[]> = {};
  rated.forEach(p => {
    const month = p.date.substring(0, 7);
    if (!monthlyAccuracy[month]) {
      monthlyAccuracy[month] = [];
    }
    monthlyAccuracy[month].push(p.numerologyData?.accuracy || 0);
  });

  const mostAccuratePeriod = Object.keys(monthlyAccuracy).length > 0
    ? Object.entries(monthlyAccuracy)
        .map(([month, accuracies]) => ({
          month,
          average: accuracies.reduce((a, b) => a + b, 0) / accuracies.length,
        }))
        .reduce((a, b) => a.average > b.average ? a : b).month
    : null;

  return {
    totalPredictions,
    ratedPredictions,
    averageAccuracy: Math.round(averageAccuracy * 10) / 10,
    accuracyDistribution,
    mostAccuratePeriod,
  };
};
