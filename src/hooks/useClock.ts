import { useEffect, useState } from 'react';
import { formatKoreanDate, formatKoreanTime, getKoreaDateKey } from '../utils/date';

export function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return {
    now,
    dateText: formatKoreanDate(now),
    timeText: formatKoreanTime(now),
    dateKey: getKoreaDateKey(now),
  };
}
