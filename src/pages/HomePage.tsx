import { CalendarDays, Trophy } from 'lucide-react';
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
  onRanking: () => void;
};

export default function HomePage({ kiosk, onCalendar, onRanking }: Props) {
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

  return (
    <section className="home-page">
      <DateTimeHeader />

      {kiosk.isLoading && !kiosk.data ? (
        <div className="loading-panel panel">
          <strong>정보를 불러오는 중이에요...</strong>
          <span>잠시만 기다려 주세요.</span>
        </div>
      ) : (
        <>
          <DDayCard dday={upcomingDday} />
          <NoticeCard notices={kiosk.data?.notices ?? []} />
        </>
      )}

      <nav className="home-actions" aria-label="키오스크 메뉴">
        <HomeMenuButton
          icon={<CalendarDays aria-hidden="true" />}
          title="학사 일정"
          subtitle="확인"
          onClick={onCalendar}
        />
        <HomeMenuButton
          icon={<Trophy aria-hidden="true" />}
          title="포인트 순위"
          subtitle="확인"
          onClick={onRanking}
        />
      </nav>

      {!kiosk.isLoading && kiosk.statusMessage && <p className="home-status">{kiosk.statusMessage}</p>}
    </section>
  );
}
