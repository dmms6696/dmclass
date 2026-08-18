import { CalendarDays, Clock, Home, UtensilsCrossed } from 'lucide-react';
import { useEffect, useState } from 'react';
import OfflineBadge from './components/OfflineBadge';
import { useKioskData } from './hooks/useKioskData';
import AcademicCalendarPage from './pages/AcademicCalendarPage';
import HomePage from './pages/HomePage';
import MealPage from './pages/MealPage';
import TimetablePage from './pages/TimetablePage';

type Route = 'home' | 'calendar' | 'timetable' | 'meal';

function routeFromHash(): Route {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'calendar' || hash === 'timetable' || hash === 'meal') {
    return hash;
  }
  return 'home';
}

function setRoute(route: Route) {
  window.location.hash = route === 'home' ? '' : route;
}

export default function App() {
  const [route, setCurrentRoute] = useState<Route>(routeFromHash);
  const kiosk = useKioskData();

  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(routeFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const goHome = () => setRoute('home');
  const goCalendar = () => setRoute('calendar');

  return (
    <main className="app-shell" aria-live="polite">
      <div className="portrait-warning">
        <Home aria-hidden="true" />
        <strong>세로 방향으로 돌려 주세요.</strong>
        <span>아이패드 세로 화면에 맞춰 사용할 때 가장 잘 보여요.</span>
      </div>

      <OfflineBadge
        isOffline={kiosk.isOffline || kiosk.usingCache}
        lastUpdated={kiosk.lastUpdated}
        message={kiosk.usingCache ? '마지막 저장 정보 사용 중' : undefined}
      />

      {route === 'home' && <HomePage kiosk={kiosk} onCalendar={goCalendar} />}

      {route === 'calendar' && (
        <AcademicCalendarPage
          events={kiosk.data?.academicEvents ?? []}
          onHome={goHome}
          statusMessage={kiosk.statusMessage}
          actionIcon={<CalendarDays aria-hidden="true" />}
        />
      )}

      {route === 'timetable' && (
        <TimetablePage
          timetable={kiosk.data?.timetable ?? []}
          onHome={goHome}
          statusMessage={kiosk.statusMessage}
          actionIcon={<Clock aria-hidden="true" />}
        />
      )}

      {route === 'meal' && (
        <MealPage
          meal={kiosk.data?.todayMeal ?? null}
          onHome={goHome}
          statusMessage={kiosk.statusMessage}
          actionIcon={<UtensilsCrossed aria-hidden="true" />}
        />
      )}
    </main>
  );
}
