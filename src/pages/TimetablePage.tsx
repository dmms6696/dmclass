import { Home } from 'lucide-react';
import type { ReactNode } from 'react';
import EmptyState from '../components/EmptyState';
import { useAutoHome } from '../hooks/useAutoHome';
import type { TimetableItem } from '../types/kiosk';

type Props = {
  timetable: TimetableItem[];
  onHome: () => void;
  statusMessage: string;
  actionIcon: ReactNode;
};

function periodLabel(period: string) {
  return /교시$/.test(period) ? period : `${period}교시`;
}

export default function TimetablePage({ timetable, onHome, statusMessage, actionIcon }: Props) {
  useAutoHome(onHome);

  return (
    <section className="sub-page simple-info-page timetable-page">
      <header className="sub-header">
        <div>
          <span>{actionIcon}</span>
          <h1>오늘의 시간표</h1>
        </div>
        <button className="home-button" type="button" onClick={onHome}>
          <Home aria-hidden="true" />
          홈으로
        </button>
      </header>

      <div className="daily-info-panel timetable-panel panel">
        {timetable.length === 0 ? (
          <EmptyState title="등록된 시간표가 없어요" description={statusMessage} />
        ) : (
          <ol className="timetable-list">
            {timetable.map((item, index) => (
              <li key={`${item.period}-${item.subject}-${index}`}>
                <span className="period-badge">{periodLabel(item.period)}</span>
                <strong>{item.subject}</strong>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
