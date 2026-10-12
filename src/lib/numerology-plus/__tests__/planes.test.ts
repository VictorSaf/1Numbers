import { describe, it, expect } from 'vitest';
import { planesOfExpression, expression } from '../pythagorean';

/**
 * The sanity check the spec calls for: every letter of the name lands in exactly
 * one cell, so the cells must add up to the Expression total. If the letter
 * tables ever drift -- and they are a reconstruction, not a published source --
 * this is what catches it.
 */
const NAMES = ['Victor Ion Safta', 'Maria Elena Popescu', 'Ștefan Mureșan', 'Mary Johnson', 'Ana Popescu'];

describe('planes of expression', () => {
  it.each(NAMES)('cells sum to Expression.raw: %s', (name) => {
    const p = planesOfExpression(name);
    const cells = Object.values(p.grid).flatMap((row) => Object.values(row));
    const total = cells.reduce((a, c) => a + c.sum, 0);
    expect(total).toBe(expression(name).raw);
  });

  it.each(NAMES)('every letter is counted exactly once: %s', (name) => {
    const p = planesOfExpression(name);
    const counted = Object.values(p.grid).flatMap((r) => Object.values(r)).reduce((a, c) => a + c.count, 0);
    // The tables cover all 26 letters, so nothing may fall through.
    expect(counted).toBe(name.replace(/[^A-Za-zĂÂÎȘȚăâîșț]/g, '').length);
  });

  it('is a 4 x 3 grid', () => {
    const p = planesOfExpression('Victor Ion Safta');
    expect(Object.keys(p.grid)).toEqual(['physical', 'mental', 'emotional', 'intuitive']);
    for (const row of Object.values(p.grid)) {
      expect(Object.keys(row)).toEqual(['creative', 'vacillating', 'grounded']);
    }
  });

  it('row and column totals agree with the cells', () => {
    const p = planesOfExpression('Maria Elena Popescu');
    for (const [plane, row] of Object.entries(p.grid)) {
      const sum = Object.values(row).reduce((a, c) => a + c.sum, 0);
      expect(p.planeTotals[plane as keyof typeof p.planeTotals].sum).toBe(sum);
    }
  });
});
