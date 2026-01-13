/**
 * Design System Tokens
 * TypeScript constants for design system values
 */

// Numerology number meanings and colors
export const numberMeanings = {
  1: { name: 'Leadership', theme: 'Gold' },
  2: { name: 'Partnership', theme: 'Blue' },
  3: { name: 'Creativity', theme: 'Purple' },
  4: { name: 'Stability', theme: 'Green' },
  5: { name: 'Freedom', theme: 'Orange' },
  6: { name: 'Harmony', theme: 'Pink' },
  7: { name: 'Wisdom', theme: 'Indigo' },
  8: { name: 'Power', theme: 'Dark Gold' },
  9: { name: 'Completion', theme: 'Red' },
  11: { name: 'Intuition', theme: 'Violet' },
  22: { name: 'Master Builder', theme: 'Bright Gold' },
  33: { name: 'Master Teacher', theme: 'Magenta' },
} as const;

// Animation delay presets (in ms)
export const animationDelays = {
  0: 0,
  50: 50,
  100: 100,
  150: 150,
  200: 200,
  250: 250,
  300: 300,
  350: 350,
  400: 400,
  450: 450,
  500: 500,
  600: 600,
  700: 700,
  800: 800,
  850: 850,
  950: 950,
  1000: 1000,
  1050: 1050,
  1100: 1100,
  1200: 1200,
} as const;

// Map delay value to CSS class
export const getDelayClass = (delay: number): string => {
  const validDelays = Object.keys(animationDelays).map(Number);
  const closest = validDelays.reduce((prev, curr) =>
    Math.abs(curr - delay) < Math.abs(prev - delay) ? curr : prev
  );
  return `ds-delay-${closest}`;
};

// Size tokens
export const sizes = {
  number: {
    sm: 48,
    md: 64,
    lg: 80,
    xl: 112,
  },
  icon: {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  },
} as const;

// Spacing tokens (in rem)
export const spacing = {
  xs: 0.25,
  sm: 0.5,
  md: 1,
  lg: 1.5,
  xl: 2,
  '2xl': 3,
  '3xl': 4,
} as const;

// Border radius tokens (in rem)
export const borderRadius = {
  sm: 0.375,
  md: 0.5,
  lg: 0.75,
  xl: 1,
  '2xl': 1.5,
  full: 9999,
} as const;

// Check if number is a master number
export const isMasterNumber = (num: number): boolean => {
  return [11, 22, 33].includes(num);
};

// Get badge class for a number
export const getNumberBadgeClass = (num: number): string => {
  if (isMasterNumber(num)) {
    return `ds-badge--number-${num}`;
  }
  // Reduce to single digit for regular numbers
  const singleDigit = num > 9 ? (num % 9 || 9) : num;
  return `ds-badge--number-${singleDigit}`;
};

// Type exports
export type NumberMeaning = keyof typeof numberMeanings;
export type AnimationDelay = keyof typeof animationDelays;
export type Size = 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
