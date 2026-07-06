import { getToken, clearToken } from "./auth";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string) =>
    request<void>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// Types
export interface DirectoryResponse {
  id: number;
  name: string;
  spaceId: number;
  parentDirectoryId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SpaceSummary {
  id: number;
  name: string;
  documentCount: number;
  directoryCount: number;
  updatedAt: string;
}

export interface SpaceResponse {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: number;
  type: "DIRECTORY" | "DOCUMENT";
  name: string;
  updatedAt: string;
}

// Spaces
export const spaces = {
  list: () => request<SpaceSummary[]>("/spaces"),
  get: (id: number) => request<SpaceResponse>(`/spaces/${id}`),
  create: (name: string) =>
    request<SpaceResponse>("/spaces", { method: "POST", body: JSON.stringify({ name }) }),
  update: (id: number, name: string) =>
    request<SpaceResponse>(`/spaces/${id}`, { method: "PUT", body: JSON.stringify({ name }) }),
  delete: (id: number) => request<void>(`/spaces/${id}`, { method: "DELETE" }),
  contents: (id: number) => request<ContentItem[]>(`/spaces/${id}/contents`),
};

// Directories
export const directories = {
  get: (id: number) => request<DirectoryResponse>(`/directories/${id}`),
  contents: (id: number) => request<ContentItem[]>(`/directories/${id}/contents`),
  createInSpace: (spaceId: number, name: string) =>
    request(`/spaces/${spaceId}/directories`, { method: "POST", body: JSON.stringify({ name }) }),
  createInDirectory: (parentId: number, name: string) =>
    request(`/directories/${parentId}/directories`, { method: "POST", body: JSON.stringify({ name }) }),
  delete: (id: number) => request<void>(`/directories/${id}`, { method: "DELETE" }),
};

export type BlockTypeName = "HEADING" | "TEXT" | "DIAGRAM";

export interface BlockResponse {
  id: number;
  type: BlockTypeName;
  content: string | null;
  headingLevel: number | null;
  position: number;
  svg?: string | null;
  diagramXml?: string | null;
}

export interface BlockRequest {
  type: BlockTypeName;
  content?: string | null;
  headingLevel?: number;
  svg?: string | null;
  diagramXml?: string | null;
}

export interface AuditInfo {
  createdAt?: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface DocumentResponse {
  id: number;
  title: string;
  spaceId: number;
  directoryId: number | null;
  blocks: BlockResponse[];
  createdAt?: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface UserSummary {
  id: number;
  email: string;
}

// Documents
export const documents = {
  get: (id: number) => request<DocumentResponse>(`/documents/${id}`),
  createInSpace: (spaceId: number, title: string) =>
    request<DocumentResponse>(`/spaces/${spaceId}/documents`, { method: "POST", body: JSON.stringify({ title }) }),
  createInDirectory: (directoryId: number, title: string) =>
    request<DocumentResponse>(`/directories/${directoryId}/documents`, { method: "POST", body: JSON.stringify({ title }) }),
  delete: (id: number) => request<void>(`/documents/${id}`, { method: "DELETE" }),
};

// Blocks
export const blocks = {
  batchReplace: (documentId: number, requests: BlockRequest[]) =>
    request<BlockResponse[]>(`/documents/${documentId}/blocks`, {
      method: "PUT",
      body: JSON.stringify(requests),
    }),
};

// Users
export const users = {
  search: (q: string) => request<UserSummary[]>(`/users/search?q=${encodeURIComponent(q)}`),
};
