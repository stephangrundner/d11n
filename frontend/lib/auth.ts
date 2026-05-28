const COOKIE = 'd11n_token';
const MAX_AGE = 60 * 60 * 24; // 24 h

export function setToken(token: string) {
  document.cookie = `${COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function clearToken() {
  document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getClientToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)d11n_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getUsernameFromToken(token: string): string | null {
  try {
    return JSON.parse(atob(token.split('.')[1])).sub ?? null;
  } catch {
    return null;
  }
}
