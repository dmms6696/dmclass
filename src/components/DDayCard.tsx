import type { DDay } from '../types/kiosk';
import EmptyState from './EmptyState';

type Props = {
  dday: DDay | null | undefined;
};

export default function DDayCard({ dday }: Props) {
  if (!dday) {
    return (
      <section className="dday-card panel">
        <EmptyState title="다가오는 학사 일정이 없어요" description="학사일정 시트에 오늘 이후 일정을 등록해 주세요." />
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
