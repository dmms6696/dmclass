import type { CachedKioskData, KioskData } from '../types/kiosk';

const CACHE_KEY = 'dmclass:kiosk-data:v1';

export function loadCachedData(): CachedKioskData | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as CachedKioskData;
  } catch {
    return null;
  }
}

export function saveCachedData(data: KioskData) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ data, savedAt: new Date().toISOString() }));
  } catch {
    // 저장 공간 부족은 최신 화면 표시를 막지 않는다.
  }
}
