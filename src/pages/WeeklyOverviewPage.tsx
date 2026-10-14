import { Clock, Home, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import EmptyState from '../components/EmptyState';
import { useAutoHome } from '../hooks/useAutoHome';
import type { KioskData } from '../types/kiosk';

export default function WeeklyOverviewPage({ mode, data, onHome }: {
  mode: 'basic-timetable' | 'meal-image'; data: KioskData | null; onHome: () => void;
}) {
  useAutoHome(onHome);
  const [failedUrl, setFailedUrl] = useState('');
  const [zoom, setZoom] = useState(false);
  const weekly = mode === 'basic-timetable';
  const rows = data?.basicTimetable ?? [];
  const image = data?.mealImage;
  return (
    <section className="sub-page simple-info-page overview-page">
      <header className="sub-header">
        <div><span>{weekly ? <Clock /> : <UtensilsCrossed />}</span><h1>{weekly ? '월~금 기초시간표' : '월간 식단표'}</h1></div>
        <button className="home-button" type="button" onClick={onHome}><Home aria-hidden="true" />홈으로</button>
      </header>
      <div className="panel overview-panel">
        {weekly ? (rows.length ? (
          <div className="weekly-table-scroll"><table className="weekly-table">
            <caption>월요일부터 금요일까지 전체 기초시간표</caption>
            <thead><tr>{['교시', '월', '화', '수', '목', '금'].map(day => <th key={day} scope="col">{day}</th>)}</tr></thead>
            <tbody>{rows.map((row, i) => <tr key={`${row.period}-${i}`}><th scope="row">{/교시$/.test(row.period) ? row.period : `${row.period}교시`}</th>{row.subjects.map((subject, j) => <td key={j}>{subject || '—'}</td>)}</tr>)}</tbody>
          </table></div>
        ) : <EmptyState title="등록된 기초시간표가 없어요" description="월~금 전체 시간표를 준비 중이에요." />) : (
          !image ? <EmptyState title="등록된 월간 식단표가 없어요" description="이번 달 식단표를 준비 중이에요." /> : failedUrl === image.url ? (
            <EmptyState title="식단표 이미지를 불러오지 못했어요" description="잠시 후 다시 열어 주세요." />
          ) : <>
            <div className="meal-image-toolbar"><strong>{image.title || '월간 식단표'}</strong><button type="button" className="home-button" onClick={() => setZoom(!zoom)}>{zoom ? '전체 보기' : '확대 보기'}</button></div>
            <div className={`meal-image-scroll${zoom ? ' is-zoomed' : ''}`}><img src={image.url} alt={image.title || '월간 식단표 전체 이미지'} onError={() => setFailedUrl(image.url)} /></div>
          </>
        )}
      </div>
    </section>
  );
}
