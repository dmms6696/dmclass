const KOREA_TIMEZONE = 'Asia/Seoul';
const WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export function getKoreaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KOREA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  const year = Number(pick('year'));
  const month = Number(pick('month'));
  const day = Number(pick('day'));
  const hour = Number(pick('hour'));
  const minute = Number(pick('minute'));
  const second = Number(pick('second'));
  const weekdayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return { year, month, day, hour, minute, second, weekday: WEEKDAYS[weekdayIndex] };
}

export function formatKoreanDate(date = new Date()) {
  const parts = getKoreaDateParts(date);
  return `${parts.month}월 ${parts.day}일 ${parts.weekday}`;
}

export function formatKoreanTime(date = new Date()) {
  const { hour, minute, second } = getKoreaDateParts(date);
  return [hour, minute, second].map((value) => String(value).padStart(2, '0')).join(':');
}

export function getKoreaDateKey(date = new Date()) {
  const { year, month, day } = getKoreaDateParts(date);
  return toDateKey(year, month, day);
}

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return { year, month, day };
}

export function daysBetweenKoreaDates(fromDateKey: string, toDateKeyValue: string) {
  const from = parseDateKey(fromDateKey);
  const to = parseDateKey(toDateKeyValue);
  if (!from || !to) {
    return 0;
  }
  const fromTime = Date.UTC(from.year, from.month - 1, from.day);
  const toTime = Date.UTC(to.year, to.month - 1, to.day);
  return Math.round((toTime - fromTime) / 86_400_000);
}

export function formatDdayLabel(targetDate: string, todayDate = getKoreaDateKey()) {
  const diff = daysBetweenKoreaDates(todayDate, targetDate);
  if (diff === 0) {
    return 'D-DAY';
  }
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}

export function monthMatrix(year: number, month: number) {
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const lastDate = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<{ dateKey: string; day: number; inMonth: boolean }> = [];
  const previousLastDate = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();

  for (let index = firstDay - 1; index >= 0; index -= 1) {
    const date = previousLastDate - index;
    const previous = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
    cells.push({ dateKey: toDateKey(previous.year, previous.month, date), day: date, inMonth: false });
  }

  for (let date = 1; date <= lastDate; date += 1) {
    cells.push({ dateKey: toDateKey(year, month, date), day: date, inMonth: true });
  }

  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const date = cells.length - firstDay - lastDate + 1;
    cells.push({ dateKey: toDateKey(nextMonth.year, nextMonth.month, date), day: date, inMonth: false });
  }

  return cells;
}
