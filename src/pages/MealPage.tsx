import { Home } from 'lucide-react';
import type { ReactNode } from 'react';
import EmptyState from '../components/EmptyState';
import { useAutoHome } from '../hooks/useAutoHome';
import type { TodayMeal } from '../types/kiosk';

type Props = {
  meal: TodayMeal | null;
  onHome: () => void;
  statusMessage: string;
  actionIcon: ReactNode;
};

export default function MealPage({ meal, onHome, statusMessage, actionIcon }: Props) {
  useAutoHome(onHome);

  return (
    <section className="sub-page simple-info-page meal-page">
      <header className="sub-header">
        <div>
          <span>{actionIcon}</span>
          <h1>오늘의 급식</h1>
        </div>
        <button className="home-button" type="button" onClick={onHome}>
          <Home aria-hidden="true" />
          홈으로
        </button>
      </header>

      <div className="daily-info-panel meal-panel panel">
        {!meal || meal.menu.length === 0 ? (
          <EmptyState title="오늘 등록된 급식이 없어요" description={statusMessage} />
        ) : (
          <>
            <p className="meal-date">{meal.dateLabel || meal.date.replaceAll('-', '.')}</p>
            <ul className="meal-menu">
              {meal.menu.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
