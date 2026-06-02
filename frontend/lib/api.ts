import type { Space, Document, CommitInfo, DiffResponse, SpaceSettings, TreeNode, ShareInfo, ShareRequest, RoleInfo } from './types';
import { getClientToken, clearToken } from './auth';
import { reportNetworkFailure } from './networkStatus';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export class NetworkError extends Error {
  constructor() { super('Network unreachable'); this.name = 'NetworkError'; }
}

export class ForbiddenError extends Error {
  constructor() { super('Forbidden'); this.name = 'ForbiddenError'; }
}

export function authHeader(): Record<string, string> {
  const token = getClientToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeader(),
    ...(options?.headers as Record<string, string>),
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers, cache: 'no-store' });
  } catch {
    reportNetworkFailure();
    throw new NetworkError();
  }

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (res.status === 403) throw new ForbiddenError();

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  spaces: {
    list: () => apiFetch<Space[]>('/api/spaces'),
    get: (id: string) => apiFetch<Space>(`/api/spaces/${id}`),
    create: (id: string) =>
      apiFetch<Space>('/api/spaces', { method: 'POST', body: JSON.stringify({ id }) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/spaces/${id}`, { method: 'DELETE' }),
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
      apiFetch<CommitInfo[]>(`/api/spaces/${spaceId}/documents/history?slug=${encodeURIComponent(slug)}`),
    diff: (spaceId: string, slug: string, hash: string) =>
      apiFetch<DiffResponse>(`/api/spaces/${spaceId}/documents/diff?slug=${encodeURIComponent(slug)}&hash=${encodeURIComponent(hash)}`),
  },
  tree: (spaceId: string) => apiFetch<TreeNode[]>(`/api/spaces/${spaceId}/tree`),
  folders: {
    create: (spaceId: string, path: string) =>
      apiFetch<void>(`/api/spaces/${spaceId}/folders`, {
        method: 'POST',
        body: JSON.stringify({ path }),
      }),
    delete: (spaceId: string, path: string) =>
      apiFetch<void>(`/api/spaces/${spaceId}/folders?path=${encodeURIComponent(path)}`, { method: 'DELETE' }),
    rename: (spaceId: string, path: string, newName: string) =>
      apiFetch<void>(`/api/spaces/${spaceId}/folders?path=${encodeURIComponent(path)}`, {
        method: 'PATCH',
        body: JSON.stringify({ newName }),
      }),
  },
  shares: {
    create: (req: ShareRequest) =>
      apiFetch<ShareInfo>('/api/shares', { method: 'POST', body: JSON.stringify(req) }),
    listMine: () =>
      apiFetch<ShareInfo[]>('/api/shares'),
    listForResource: (spaceId: string, resourceType: string, resourcePath?: string | null) =>
      apiFetch<ShareInfo[]>(
        `/api/shares/for-resource?spaceId=${encodeURIComponent(spaceId)}&resourceType=${encodeURIComponent(resourceType)}${resourcePath ? `&resourcePath=${encodeURIComponent(resourcePath)}` : ''}`
      ),
    revoke: (token: string) =>
      apiFetch<void>(`/api/shares/${token}`, { method: 'DELETE' }),
  },
  shared: {
    resolve: (token: string) =>
      apiFetch<ShareInfo>(`/api/shared/${token}`),
    document: (token: string) =>
      apiFetch<Document>(`/api/shared/${token}/document`),
    tree: (token: string) =>
      apiFetch<TreeNode[]>(`/api/shared/${token}/tree`),
  },
  admin: {
    roles: {
      list:           ()                            => apiFetch<RoleInfo[]>('/api/admin/roles'),
      create:         (name: string)                => apiFetch<RoleInfo>('/api/admin/roles', { method: 'POST', body: JSON.stringify({ name }) }),
      setPermissions: (id: number, perms: string[]) => apiFetch<RoleInfo>(`/api/admin/roles/${id}/permissions`, { method: 'PUT', body: JSON.stringify(perms) }),
      delete:         (id: number)                  => apiFetch<void>(`/api/admin/roles/${id}`, { method: 'DELETE' }),
    },
  },
  locks: {
    status: (spaceId: string, slug: string) =>
      apiFetch<{ locked: boolean; lockedBy: string | null }>(
        `/api/spaces/${spaceId}/document-locks?slug=${encodeURIComponent(slug)}`
      ),
  },
  assets: {
    // Relative URL — routed through the Next.js proxy (app/api/spaces/.../assets/route.ts)
    // which adds the Bearer token server-side. Works for <img src> and direct fetch alike.
    url: (spaceId: string, filename: string) =>
      `/api/spaces/${spaceId}/assets/${filename}`,
    upload: async (spaceId: string, filename: string, data: Blob): Promise<void> => {
      const res = await fetch(`/api/spaces/${spaceId}/assets/${filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': data.type || 'application/octet-stream' },
        body: data,
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    },
    fetchContent: async (spaceId: string, filename: string): Promise<string> => {
      const res = await fetch(`/api/spaces/${spaceId}/assets/${filename}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.text();
    },
  },
};
