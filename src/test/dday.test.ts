import { describe, expect, it } from 'vitest';
import type { AcademicEvent } from '../types/kiosk';
import { selectUpcomingAcademicEventDday } from '../utils/dday';

describe('upcoming academic event d-day', () => {
  it('selects the nearest non-past event and uses order for same-day events', () => {
    const events: AcademicEvent[] = [
      { date: '2026-07-22', title: '지난 행사', category: '행사', order: 1 },
      { date: '2026-08-24', title: '2학기 개학식', category: '행사', details: '정상 등교', order: 1 },
      { date: '2026-08-01', title: '두 번째 일정', category: '학교생활', order: 2 },
      { date: '2026-08-01', title: '첫 번째 일정', category: '시험', details: '준비물 지참', order: 1 },
    ];

    expect(selectUpcomingAcademicEventDday(events, '2026-07-23')).toEqual({
      title: '첫 번째 일정',
      targetDate: '2026-08-01',
      label: 'D-9',
      icon: '📝',
      memo: '준비물 지참',
    });
  });

  it('returns null when every event is in the past', () => {
    expect(
      selectUpcomingAcademicEventDday(
        [{ date: '2026-07-22', title: '지난 일정', category: '행사', order: 1 }],
        '2026-07-23',
      ),
    ).toBeNull();
  });
});
