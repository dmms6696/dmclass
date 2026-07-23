import { useEffect } from 'react';

const AUTO_HOME_MS = 45_000;
const EVENTS = ['pointerdown', 'touchstart', 'keydown'] as const;

export function useAutoHome(onHome: () => void) {
  useEffect(() => {
    let timer = window.setTimeout(onHome, AUTO_HOME_MS);

    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onHome, AUTO_HOME_MS);
    };

    EVENTS.forEach((eventName) => window.addEventListener(eventName, reset, { passive: true }));

    return () => {
      window.clearTimeout(timer);
      EVENTS.forEach((eventName) => window.removeEventListener(eventName, reset));
    };
  }, [onHome]);
}
