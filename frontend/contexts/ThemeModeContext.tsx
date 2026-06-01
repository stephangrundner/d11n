'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeModeValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
}

const STORAGE_KEY = 'd11n_theme';

function systemPreference(): 'light' | 'dark' {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolve(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? systemPreference() : mode;
}

const ThemeModeContext = createContext<ThemeModeValue>({
  mode: 'system',
  setMode: () => {},
  resolvedMode: 'light',
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  // Start with SSR-safe defaults so server and client render identically.
  // useEffect reads localStorage after hydration to apply the stored preference.
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? 'light';
    setModeState(stored);
    setResolvedMode(resolve(stored));
  }, []);

  // Track system preference changes while mode === 'system'
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolvedMode(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    setResolvedMode(resolve(next));
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, resolvedMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}
