import { CalendarDays, Clock, UtensilsCrossed } from 'lucide-react';
import DateTimeHeader from '../components/DateTimeHeader';
import DDayCard from '../components/DDayCard';
import HomeMenuButton from '../components/HomeMenuButton';
import NoticeCard from '../components/NoticeCard';
import type { KioskData } from '../types/kiosk';
import { selectUpcomingAcademicEventDday } from '../utils/dday';

type KioskState = {
  data: KioskData | null;
  isLoading: boolean;
  apiConfigured: boolean;
  statusMessage: string;
};

type Props = {
  kiosk: KioskState;
  onCalendar: () => void;
};

function periodLabel(period: string) {
  return /교시$/.test(period) ? period : `${period}교시`;
}

export default function HomePage({ kiosk, onCalendar }: Props) {
  if (!kiosk.apiConfigured) {
    return (
      <section className="setup-screen">
        <div className="setup-panel">
          <span className="setup-icon">🔗</span>
          <h1>연동 주소가 아직 설정되지 않았어요.</h1>
          <p>
            Apps Script 웹앱 배포 URL을 <code>VITE_KIOSK_API_URL</code> 값으로 넣으면 학급 정보가 표시됩니다.
          </p>
          <p>GitHub Pages에서는 저장소 Variables 또는 Secrets에 같은 이름으로 등록해 주세요.</p>
        </div>
      </section>
    );
  }

  const upcomingDday = selectUpcomingAcademicEventDday(kiosk.data?.academicEvents ?? []);
  const timetable = kiosk.data?.timetable ?? [];
  const todayMeal = kiosk.data?.todayMeal ?? null;

  return (
    <section className="home-page home-dashboard">
      <DateTimeHeader />

      {kiosk.isLoading && !kiosk.data ? (
        <div className="loading-panel panel home-loading">
          <strong>정보를 불러오는 중이에요...</strong>
          <span>잠시만 기다려 주세요.</span>
        </div>
      ) : (
        <>
          <div className="home-info-grid home-info-grid-readable">
            <section className="home-summary-panel timetable-summary panel" aria-label="오늘의 시간표">
              <div className="section-title">
                <Clock aria-hidden="true" />
                <h2>오늘의 시간표</h2>
              </div>
              {timetable.length === 0 ? (
                <div className="home-mini-empty">등록된 시간표가 없어요.</div>
              ) : (
                <ol className="home-timetable-list">
                  {timetable.map((item, index) => (
                    <li key={`${item.period}-${item.subject}-${index}`}>
                      <span>{periodLabel(item.period)}</span>
                      <strong>{item.subject}</strong>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="home-summary-panel meal-summary panel" aria-label="오늘의 급식">
              <div className="section-title">
                <UtensilsCrossed aria-hidden="true" />
                <h2>오늘의 급식</h2>
              </div>
              {!todayMeal || todayMeal.menu.length === 0 ? (
                <div className="home-mini-empty">오늘 등록된 급식이 없어요.</div>
              ) : (
                <>
                  <p className="home-meal-date">{todayMeal.dateLabel || todayMeal.date.replaceAll('-', '.')}</p>
                  <ul className="home-meal-list">
                    {todayMeal.menu.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <NoticeCard notices={kiosk.data?.notices ?? []} />
          </div>

          <div className="home-bottom-grid">
            <HomeMenuButton
              icon={<CalendarDays aria-hidden="true" />}
              title="학사 일정"
              subtitle="전체 일정 보기"
              onClick={onCalendar}
            />
            <DDayCard dday={upcomingDday} />
          </div>
        </>
      )}

      {!kiosk.isLoading && kiosk.statusMessage && <p className="home-status">{kiosk.statusMessage}</p>}
    </section>
  );
}
