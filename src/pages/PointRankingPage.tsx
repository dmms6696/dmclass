import { Crown, Home, Medal } from 'lucide-react';
import type { ReactNode } from 'react';
import EmptyState from '../components/EmptyState';
import { useAutoHome } from '../hooks/useAutoHome';
import type { PointRank } from '../types/kiosk';

type Props = {
  ranking: PointRank[];
  onHome: () => void;
  statusMessage: string;
  actionIcon: ReactNode;
};

export default function PointRankingPage({ ranking, onHome, statusMessage, actionIcon }: Props) {
  useAutoHome(onHome);
  const topThree = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <section className="sub-page ranking-page">
      <header className="sub-header">
        <div>
          <span>{actionIcon}</span>
          <h1>포인트 순위</h1>
        </div>
        <button className="home-button" type="button" onClick={onHome}>
          <Home aria-hidden="true" />
          홈으로
        </button>
      </header>

      {ranking.length === 0 ? (
        <div className="panel ranking-empty">
          <EmptyState title="표시할 포인트 데이터가 없어요" description={statusMessage} />
        </div>
      ) : (
        <>
          <div className="podium" aria-label="1위부터 3위">
            {topThree.map((student, index) => (
              <article className={`podium-card rank-${index + 1}`} key={`${student.rank}-${student.displayName}`}>
                <span className="medal-icon">
                  {index === 0 ? <Crown aria-hidden="true" /> : <Medal aria-hidden="true" />}
                </span>
                <strong>{student.rank}위</strong>
                <h2>{student.displayName}</h2>
                <p>{student.totalPoints}점</p>
              </article>
            ))}
          </div>

          <div className="rank-list panel">
            {rest.length === 0 ? (
              <EmptyState title="4위 이하 학생은 아직 없어요" />
            ) : (
              <ol>
                {rest.map((student) => (
                  <li key={`${student.rank}-${student.displayName}-${student.totalPoints}`}>
                    <span className="rank-number">{student.rank}위</span>
                    <strong>{student.displayName}</strong>
                    <span>{student.totalPoints}점</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </section>
  );
}
