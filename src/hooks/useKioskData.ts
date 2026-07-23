import { useCallback, useEffect, useRef, useState } from 'react';
import type { KioskData } from '../types/kiosk';
import { getKoreaDateKey } from '../utils/date';
import { fetchKioskData, getKioskApiUrl } from '../services/kioskApi';
import { loadCachedData, saveCachedData } from '../services/localCache';

type KioskDataState = {
  data: KioskData | null;
  isLoading: boolean;
  isOffline: boolean;
  usingCache: boolean;
  apiConfigured: boolean;
  statusMessage: string;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
};

const REFRESH_MS = 60_000;

export function useKioskData(): KioskDataState {
  const apiUrl = getKioskApiUrl();
  const [data, setData] = useState<KioskData | null>(() => loadCachedData()?.data ?? null);
  const [isLoading, setIsLoading] = useState(() => !loadCachedData());
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);
  const [usingCache, setUsingCache] = useState(() => Boolean(loadCachedData()));
  const [statusMessage, setStatusMessage] = useState(apiUrl ? '정보를 불러오는 중이에요...' : '연동 주소가 아직 설정되지 않았어요.');
  const [lastUpdated, setLastUpdated] = useState<string | null>(() => loadCachedData()?.data.generatedAt ?? null);
  const lastDateKeyRef = useRef(getKoreaDateKey());

  const refresh = useCallback(async () => {
    if (!apiUrl) {
      setIsLoading(false);
      setUsingCache(Boolean(data));
      setStatusMessage('연동 주소가 아직 설정되지 않았어요.');
      return;
    }

    try {
      const nextData = await fetchKioskData(apiUrl);
      setData(nextData);
      saveCachedData(nextData);
      setLastUpdated(nextData.generatedAt);
      setUsingCache(false);
      setStatusMessage('최신 정보를 보여 주고 있어요.');
    } catch (error) {
      const cached = loadCachedData();
      if (cached) {
        setData(cached.data);
        setLastUpdated(cached.data.generatedAt);
        setUsingCache(true);
        setStatusMessage('마지막으로 저장된 정보를 보여 주고 있어요.');
      } else {
        setStatusMessage(error instanceof Error ? error.message : '잠시 인터넷 연결을 확인해 주세요.');
      }
    } finally {
      setIsLoading(false);
      setIsOffline(!navigator.onLine);
    }
  }, [apiUrl, data]);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(refresh, REFRESH_MS);
    const visibilityRefresh = () => {
      if (!document.hidden) {
        void refresh();
      }
    };
    const onlineRefresh = () => {
      setIsOffline(false);
      void refresh();
    };
    const offlineUpdate = () => setIsOffline(true);

    window.addEventListener('online', onlineRefresh);
    window.addEventListener('offline', offlineUpdate);
    document.addEventListener('visibilitychange', visibilityRefresh);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('online', onlineRefresh);
      window.removeEventListener('offline', offlineUpdate);
      document.removeEventListener('visibilitychange', visibilityRefresh);
    };
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextDateKey = getKoreaDateKey();
      if (lastDateKeyRef.current !== nextDateKey) {
        lastDateKeyRef.current = nextDateKey;
        void refresh();
      }
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return {
    data,
    isLoading,
    isOffline,
    usingCache,
    apiConfigured: Boolean(apiUrl),
    statusMessage,
    lastUpdated,
    refresh,
  };
}
