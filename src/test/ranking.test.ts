import { describe, expect, it } from 'vitest';
import { normalizeRanking } from '../utils/ranking';

describe('ranking utilities', () => {
  it('recalculates ranks with shared rank for ties', () => {
    const ranking = normalizeRanking([
      { number: 3, name: '박민수', active: 'Y', totalPoints: 20 },
      { number: 1, name: '김도현', active: 'Y', totalPoints: 44 },
      { number: 2, name: '정하린', active: 'Y', totalPoints: 44 },
      { number: 4, name: '이서준', active: 'N', totalPoints: 100 },
    ]);

    expect(ranking).toEqual([
      { rank: 1, number: 1, name: '김도현', totalPoints: 44 },
      { rank: 1, number: 2, name: '정하린', totalPoints: 44 },
      { rank: 3, number: 3, name: '박민수', totalPoints: 20 },
    ]);
  });
});
