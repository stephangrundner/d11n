'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { API_BASE } from '@/lib/api';
import { setNetworkFailureListener } from '@/lib/networkStatus';

const DEFAULT_INTERVAL_MS = 30_000;
const DEFAULT_TIMEOUT_MS = 5_000;

interface HeartbeatConfig {
  intervalMs: number;
  timeoutMs: number;
}

const HeartbeatContext = createContext<boolean>(true);

export function useIsBackendOnline() {
  return useContext(HeartbeatContext);
}

export function HeartbeatProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const configRef = useRef<HeartbeatConfig>({ intervalMs: DEFAULT_INTERVAL_MS, timeoutMs: DEFAULT_TIMEOUT_MS });

  useEffect(() => {
    setNetworkFailureListener(() => setIsOnline(false));
    return () => setNetworkFailureListener(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const ping = async () => {
      if (cancelled) return;
      const { intervalMs, timeoutMs } = configRef.current;
      const controller = new AbortController();
      const abortTimer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(`${API_BASE}/api/health`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(abortTimer);
        if (!cancelled) {
          if (res.ok) {
            const data: Partial<HeartbeatConfig> & { status?: string } = await res.json();
            if (typeof data.intervalMs === 'number' && typeof data.timeoutMs === 'number') {
              configRef.current = { intervalMs: data.intervalMs, timeoutMs: data.timeoutMs };
            }
            setIsOnline(true);
          } else {
            setIsOnline(false);
          }
        }
      } catch {
        clearTimeout(abortTimer);
        if (!cancelled) setIsOnline(false);
      } finally {
        if (!cancelled) {
          timerId = setTimeout(ping, configRef.current.intervalMs);
        }
      }
    };

    ping();

    return () => {
      cancelled = true;
      if (timerId !== null) clearTimeout(timerId);
    };
  }, []);

  return (
    <HeartbeatContext.Provider value={isOnline}>
      {children}
    </HeartbeatContext.Provider>
  );
}
