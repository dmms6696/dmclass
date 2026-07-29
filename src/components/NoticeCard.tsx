import { Megaphone, Sparkles } from 'lucide-react';
import type { Notice } from '../types/kiosk';
import EmptyState from './EmptyState';

type Props = {
  notices: Notice[];
};

export default function NoticeCard({ notices }: Props) {
  return (
    <section className="notice-card panel" aria-label="오늘의 알림">
      <div className="section-title">
        <Megaphone aria-hidden="true" />
        <h2>오늘의 알림</h2>
      </div>

      {notices.length === 0 ? (
        <EmptyState title="오늘은 특별한 알림이 없어요 ✨" description="편안한 하루를 보내요." />
      ) : (
        <ul className="notice-list" aria-label="오늘의 알림 목록" tabIndex={0}>
          {notices.map((notice, index) => (
            <li key={`${notice.message}-${index}`} className={notice.important ? 'important' : ''}>
              <span className="notice-dot">
                {notice.important ? <Sparkles aria-hidden="true" /> : '·'}
              </span>
              <p>{notice.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
