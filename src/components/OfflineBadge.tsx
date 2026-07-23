import { WifiOff } from 'lucide-react';
import { formatKoreanTime } from '../utils/date';

type Props = {
  isOffline: boolean;
  lastUpdated: string | null;
  message?: string;
};

export default function OfflineBadge({ isOffline, lastUpdated, message }: Props) {
  if (!isOffline && !message) {
    return null;
  }

  const date = lastUpdated ? new Date(lastUpdated) : null;

  return (
    <div className="offline-badge" role="status">
      <WifiOff aria-hidden="true" />
      <span>{isOffline ? '오프라인' : message}</span>
      {date && <span>마지막 업데이트 {formatKoreanTime(date)}</span>}
    </div>
  );
}
