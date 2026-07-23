import type { KioskApiResponse, KioskData } from '../types/kiosk';

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

function validateApiResponse(payload: unknown): KioskData {
  if (!payload || typeof payload !== 'object') {
    throw new Error('데이터 형식이 올바르지 않아요.');
  }

  const response = payload as KioskApiResponse;
  if (!response.ok) {
    throw new Error(response.message || '정보를 불러오지 못했어요.');
  }

  if (!Array.isArray(response.notices) || !Array.isArray(response.academicEvents) || !Array.isArray(response.pointRanking)) {
    throw new Error('데이터 형식이 올바르지 않아요.');
  }

  return response;
}
