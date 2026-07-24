import type { AcademicEvent, DDay } from '../types/kiosk';
import { formatDdayLabel, getKoreaDateKey } from './date';

function iconForCategory(category: string) {
  if (category.includes('시험')) {
    return '📝';
  }
  if (category.includes('행사')) {
    return '🎉';
  }
  if (category.includes('방학') || category.includes('휴업')) {
    return '☀️';
  }
  if (category.includes('학교')) {
    return '🏫';
  }
  return '📅';
}

export function selectUpcomingAcademicEventDday(
  events: AcademicEvent[],
  today = getKoreaDateKey(),
): DDay | null {
  const selected = events
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order || a.title.localeCompare(b.title))[0];

  if (!selected) {
    return null;
  }

  return {
    title: selected.title,
    targetDate: selected.date,
    label: formatDdayLabel(selected.date, today),
    icon: iconForCategory(selected.category),
    memo: selected.details || selected.category,
  };
}
