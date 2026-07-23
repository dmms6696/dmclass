export type RawRankItem = {
  number: number;
  name: string;
  active: string;
  totalPoints: number;
  rank?: number | null;
};

export type RankedItem = {
  rank: number;
  number: number;
  name: string;
  totalPoints: number;
};

export function normalizeRanking(items: RawRankItem[]): RankedItem[] {
  const activeItems = items
    .filter((item) => item.active.trim().toUpperCase() === 'Y')
    .map((item) => ({
      ...item,
      totalPoints: Number.isFinite(item.totalPoints) ? item.totalPoints : 0,
      rank: Number.isFinite(item.rank ?? Number.NaN) ? Number(item.rank) : null,
    }));

  const hasValidRanks = activeItems.every((item) => item.rank !== null && Number(item.rank) > 0);
  if (hasValidRanks) {
    return activeItems
      .map((item) => ({ rank: Number(item.rank), number: item.number, name: item.name, totalPoints: item.totalPoints }))
      .sort((a, b) => a.rank - b.rank || b.totalPoints - a.totalPoints || a.number - b.number);
  }

  const sorted = [...activeItems].sort((a, b) => b.totalPoints - a.totalPoints || a.number - b.number);
  let previousPoints: number | null = null;
  let currentRank = 0;

  return sorted.map((item, index) => {
    if (previousPoints !== item.totalPoints) {
      currentRank = index + 1;
      previousPoints = item.totalPoints;
    }
    return { rank: currentRank, number: item.number, name: item.name, totalPoints: item.totalPoints };
  });
}
