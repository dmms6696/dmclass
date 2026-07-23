import { describe, expect, it } from 'vitest';
import { daysBetweenKoreaDates, formatDdayLabel, monthMatrix } from '../utils/date';

describe('date utilities', () => {
  it('calculates d-day labels by date key without timezone drift', () => {
    expect(daysBetweenKoreaDates('2026-08-24', '2026-10-15')).toBe(52);
    expect(formatDdayLabel('2026-08-24', '2026-08-24')).toBe('D-DAY');
    expect(formatDdayLabel('2026-08-24', '2026-08-25')).toBe('D+1');
    expect(formatDdayLabel('2026-08-24', '2026-08-23')).toBe('D-1');
  });

  it('builds a fixed six-week month matrix', () => {
    const cells = monthMatrix(2026, 8);
    expect(cells).toHaveLength(42);
    expect(cells.some((cell) => cell.dateKey === '2026-08-24' && cell.inMonth)).toBe(true);
  });
});
