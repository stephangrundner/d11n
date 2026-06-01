import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE, authHeader } from '@/lib/api';

export interface LockState {
  locked: boolean;
  lockedBy: string | null;
}

export function useDocumentLock(
  spaceId: string,
  slug: string,
  onLockLost?: () => void,
) {
  const [holding, setHolding] = useState(false);
  const [lockState, setLockState] = useState<LockState>({ locked: false, lockedBy: null });
  const holdingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lockUrl = `${API_BASE}/api/spaces/${encodeURIComponent(spaceId)}/document-locks?slug=${encodeURIComponent(slug)}`;

  const stopHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Fetch lock status once on mount
  useEffect(() => {
    fetch(lockUrl, { headers: authHeader() })
      .then(r => r.ok ? r.json() : null)
      .then((data: LockState | null) => { if (data) setLockState(data); })
      .catch(() => {});
  }, [lockUrl]);

  const acquire = useCallback(async (): Promise<boolean> => {
    const res = await fetch(lockUrl, { method: 'POST', headers: authHeader() });
    const data: LockState = await res.json();
    setLockState(data);
    if (!res.ok) return false;

    setHolding(true);
    holdingRef.current = true;

    intervalRef.current = setInterval(async () => {
      const hb = await fetch(lockUrl, { method: 'PUT', headers: authHeader() });
      if (!hb.ok) {
        stopHeartbeat();
        setHolding(false);
        holdingRef.current = false;
        onLockLost?.();
      }
    }, 30_000);

    return true;
  }, [lockUrl, stopHeartbeat, onLockLost]);

  const release = useCallback(() => {
    if (!holdingRef.current) return;
    stopHeartbeat();
    setHolding(false);
    holdingRef.current = false;
    setLockState({ locked: false, lockedBy: null });
    // keepalive ensures delivery even during page unload
    fetch(lockUrl, { method: 'DELETE', headers: authHeader(), keepalive: true });
  }, [lockUrl, stopHeartbeat]);

  // Release on component unmount or page close
  useEffect(() => {
    const handleUnload = () => {
      if (holdingRef.current)
        fetch(lockUrl, { method: 'DELETE', headers: authHeader(), keepalive: true });
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (holdingRef.current) release();
    };
  }, [lockUrl, release]);

  return { holding, lockState, acquire, release };
}
