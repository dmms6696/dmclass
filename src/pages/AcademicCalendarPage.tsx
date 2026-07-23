import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import { useAutoHome } from '../hooks/useAutoHome';
import { useClock } from '../hooks/useClock';
import type { AcademicEvent } from '../types/kiosk';
import { monthMatrix, parseDateKey } from '../utils/date';

type Props = {
  events: AcademicEvent[];
  onHome: () => void;
  statusMessage: string;
  actionIcon: ReactNode;
};

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const CATEGORY_CLASS: Record<string, string> = {
  시험: 'exam',
  행사: 'event',
  방학: 'vacation',
  학교생활: 'school',
  기타: 'etc',
};

export default function AcademicCalendarPage({ events, onHome, statusMessage, actionIcon }: Props) {
  useAutoHome(onHome);
  const { dateKey } = useClock();
  const today = parseDateKey(dateKey)!;
  const [view, setView] = useState({ year: today.year, month: today.month });
  const [selectedDate, setSelectedDate] = useState(dateKey);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, AcademicEvent[]>();
    events.forEach((event) => {
      const next = map.get(event.date) ?? [];
      next.push(event);
      next.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ko'));
      map.set(event.date, next);
    });
    return map;
  }, [events]);

  const cells = monthMatrix(view.year, view.month);
  const selectedEvents = eventsByDate.get(selectedDate) ?? [];

  const moveMonth = (delta: number) => {
    setView((current) => {
      const nextMonth = current.month + delta;
      if (nextMonth < 1) {
        return { year: current.year - 1, month: 12 };
      }
      if (nextMonth > 12) {
        return { year: current.year + 1, month: 1 };
      }
      return { ...current, month: nextMonth };
    });
  };

  const goToday = () => {
    setView({ year: today.year, month: today.month });
    setSelectedDate(dateKey);
  };

  return (
    <section className="sub-page calendar-page">
      <header className="sub-header">
        <div>
          <span>{actionIcon}</span>
          <h1>학사 일정</h1>
        </div>
        <button className="home-button" type="button" onClick={onHome}>
          <Home aria-hidden="true" />
          홈으로
        </button>
      </header>

      <div className="calendar-toolbar">
        <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">
          <ChevronLeft aria-hidden="true" />
        </button>
        <strong>{view.year}년 {view.month}월</strong>
        <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달">
          <ChevronRight aria-hidden="true" />
        </button>
        <button className="today-button" type="button" onClick={goToday}>오늘</button>
      </div>

      <div className="calendar-layout">
        <div className="calendar-grid panel">
          {WEEK_LABELS.map((label) => (
            <span className="weekday" key={label}>{label}</span>
          ))}
          {cells.map((cell) => {
            const dayEvents = eventsByDate.get(cell.dateKey) ?? [];
            const isToday = cell.dateKey === dateKey;
            const isSelected = cell.dateKey === selectedDate;

            return (
              <button
                key={cell.dateKey}
                className={`day-cell ${cell.inMonth ? '' : 'muted'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                type="button"
                onClick={() => setSelectedDate(cell.dateKey)}
              >
                <span>{cell.day}</span>
                <div className="event-dots" aria-hidden="true">
                  {dayEvents.slice(0, 3).map((event) => (
                    <i key={`${event.date}-${event.title}`} className={CATEGORY_CLASS[event.category] ?? 'etc'} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <aside className="event-list panel">
          <h2>{selectedDate.replaceAll('-', '.')} 일정</h2>
          {selectedEvents.length === 0 ? (
            <EmptyState title="이 날은 등록된 일정이 없어요" description={statusMessage} />
          ) : (
            <ul>
              {selectedEvents.map((event) => (
                <li key={`${event.date}-${event.title}-${event.order}`} className={CATEGORY_CLASS[event.category] ?? 'etc'}>
                  <strong>{event.title}</strong>
                  <span>{event.category}</span>
                  {event.details && <p>{event.details}</p>}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}
