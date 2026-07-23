import type { DDay } from '../types/kiosk';
import EmptyState from './EmptyState';

type Props = {
  dday: DDay | null | undefined;
};

export default function DDayCard({ dday }: Props) {
  if (!dday) {
    return (
      <section className="dday-card panel">
        <EmptyState title="등록된 디데이가 없어요" description="디데이 시트에서 사용할 행을 Y로 바꿔 주세요." />
      </section>
    );
  }

  return (
    <section className="dday-card panel" aria-label="디데이">
      <div className="dday-icon" aria-hidden="true">{dday.icon || '⭐'}</div>
      <div className="dday-copy">
        <span>D-DAY</span>
        <h1>{dday.title}까지 {dday.label}</h1>
        {dday.memo && <p>{dday.memo}</p>}
      </div>
    </section>
  );
}
