import type { KioskApiResponse, KioskData, TodayMeal, TimetableItem } from '../types/kiosk';

const CALLBACK_PREFIX = 'dmclassCallback';

export function getKioskApiUrl() {
  return import.meta.env.VITE_KIOSK_API_URL?.trim() ?? '';
}

export async function fetchKioskData(apiUrl: string): Promise<KioskData> {
  try {
    const response = await fetch(withTimestamp(apiUrl), { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('API 접근 권한을 확인해 주세요.');
    }
    return validateApiResponse(await response.json());
  } catch {
    return fetchJsonp(apiUrl);
  }
}

function withTimestamp(apiUrl: string) {
  const url = new URL(apiUrl);
  url.searchParams.set('_', String(Date.now()));
  return url.toString();
}

function fetchJsonp(apiUrl: string): Promise<KioskData> {
  return new Promise((resolve, reject) => {
    const callbackName = `${CALLBACK_PREFIX}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('잠시 인터넷 연결을 확인해 주세요.'));
    }, 12_000);

    const script = document.createElement('script');
    const url = new URL(apiUrl);
    url.searchParams.set('callback', callbackName);
    url.searchParams.set('_', String(Date.now()));

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      Reflect.deleteProperty(window, callbackName);
    }

    Object.assign(window, {
      [callbackName]: (payload: KioskApiResponse) => {
        cleanup();
        try {
          resolve(validateApiResponse(payload));
        } catch (error) {
          reject(error);
        }
      },
    });

    script.onerror = () => {
      cleanup();
      reject(new Error('API 접근 권한을 확인해 주세요.'));
    };

    script.src = url.toString();
    document.head.appendChild(script);
  });
}

function isTimetable(value: unknown): value is TimetableItem[] {
  return Array.isArray(value) && value.every((item) => (
    Boolean(item)
    && typeof item === 'object'
    && typeof (item as TimetableItem).period === 'string'
    && typeof (item as TimetableItem).subject === 'string'
  ));
}

function isTodayMeal(value: unknown): value is TodayMeal | null {
  if (value === null || value === undefined) {
    return true;
  }
  if (!value || typeof value !== 'object') {
    return false;
  }
  const meal = value as TodayMeal;
  return typeof meal.date === 'string'
    && typeof meal.dateLabel === 'string'
    && Array.isArray(meal.menu)
    && meal.menu.every((item) => typeof item === 'string');
}

function validateApiResponse(payload: unknown): KioskData {
  if (!payload || typeof payload !== 'object') {
    throw new Error('데이터 형식이 올바르지 않아요.');
  }

  const response = payload as KioskApiResponse & {
    timetable?: unknown;
    todayMeal?: unknown;
  };
  if (!response.ok) {
    throw new Error(response.message || '정보를 불러오지 못했어요.');
  }

  if (!Array.isArray(response.notices) || !Array.isArray(response.academicEvents)) {
    throw new Error('데이터 형식이 올바르지 않아요.');
  }

  const timetable = response.timetable ?? [];
  const todayMeal = response.todayMeal ?? null;
  if (!isTimetable(timetable) || !isTodayMeal(todayMeal)) {
    throw new Error('시간표 또는 급식 데이터 형식이 올바르지 않아요.');
  }

  return {
    ...response,
    timetable,
    todayMeal,
  };
}
