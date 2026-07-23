import { Clock } from 'lucide-react';
import { useClock } from '../hooks/useClock';

export default function DateTimeHeader() {
  const { dateText, timeText } = useClock();

  return (
    <header className="date-time-header">
      <div>
        <span className="header-kicker">우리 반 한눈에</span>
        <strong>{dateText}</strong>
      </div>
      <time dateTime={timeText}>
        <Clock aria-hidden="true" />
        {timeText}
      </time>
    </header>
  );
}
