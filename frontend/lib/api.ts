import type { Space, Document, CommitInfo, DiffResponse, SpaceSettings } from './types';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  spaces: {
    list: () => apiFetch<Space[]>('/api/spaces'),
    get: (id: string) => apiFetch<Space>(`/api/spaces/${id}`),
    create: (id: string) =>
      apiFetch<Space>('/api/spaces', { method: 'POST', body: JSON.stringify({ id }) }),
    settings: {
      get: (spaceId: string) => apiFetch<SpaceSettings>(`/api/spaces/${spaceId}/settings`),
      update: (spaceId: string, data: SpaceSettings) =>
        apiFetch<SpaceSettings>(`/api/spaces/${spaceId}/settings`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
    },
  },
  documents: {
    list: (spaceId: string) => apiFetch<Document[]>(`/api/spaces/${spaceId}/documents`),
    get: (spaceId: string, slug: string) =>
      apiFetch<Document>(`/api/spaces/${spaceId}/documents/${slug}`),
    create: (spaceId: string, slug: string, data: Partial<Document>) =>
      apiFetch<Document>(`/api/spaces/${spaceId}/documents/${slug}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (spaceId: string, slug: string, data: Partial<Document>, commitMessage?: string) =>
      apiFetch<Document>(`/api/spaces/${spaceId}/documents/${slug}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, commitMessage }),
      }),
    delete: (spaceId: string, slug: string) =>
      apiFetch<void>(`/api/spaces/${spaceId}/documents/${slug}`, { method: 'DELETE' }),
    history: (spaceId: string, slug: string) =>
      apiFetch<CommitInfo[]>(`/api/spaces/${spaceId}/documents/${slug}/history`),
    diff: (spaceId: string, slug: string, hash: string) =>
      apiFetch<DiffResponse>(`/api/spaces/${spaceId}/documents/${slug}/history/${hash}/diff`),
  },
  assets: {
    url: (spaceId: string, filename: string) =>
      `${API_BASE}/api/spaces/${spaceId}/assets/${filename}`,
    upload: async (spaceId: string, filename: string, data: Blob): Promise<void> => {
      const res = await fetch(`${API_BASE}/api/spaces/${spaceId}/assets/${filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': data.type || 'application/octet-stream' },
        body: data,
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    },
    fetchContent: async (spaceId: string, filename: string): Promise<string> => {
      const res = await fetch(`${API_BASE}/api/spaces/${spaceId}/assets/${filename}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.text();
    },
  },
};
