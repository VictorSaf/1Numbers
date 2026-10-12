/**
 * Chart colours, from the tokens.
 *
 * The five charts each carried their own literal HSL values -- `hsl(45 30% 95%)`
 * for label text, `hsl(240 15% 12%)` for a tooltip -- which are the old mystic
 * palette. Stage 9f8f30b moved everything else onto tokens and these were
 * missed, so under `dawn` and `high-contrast` the charts stayed coloured for a
 * dark theme: pale text on a pale card.
 *
 * `var()` resolves inside SVG presentation attributes, so Recharts can be handed
 * these strings directly and the theme keeps working.
 */
export const chartTheme = {
  /** Axis and legend labels. */
  label: 'hsl(var(--foreground))',
  /** Secondary ticks -- counts, percentages. */
  labelMuted: 'hsl(var(--muted-foreground))',
  /** Axis lines and grids. */
  line: 'hsl(var(--border))',
  tooltip: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--foreground))',
  },
} as const;

/**
 * Series colours, in order.
 *
 * Six, because that is how many the palette defines in every theme. A chart
 * that needs more than six categories is telling you the category belongs on an
 * axis, not in a hue -- which is the case for all of these: the number is
 * already on the x-axis, so a ninth colour would encode nothing the reader
 * cannot already see.
 */
export const SERIES = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
] as const;
