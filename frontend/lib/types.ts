export interface Space {
  id: string;
  name: string;
  documentCount?: number;
}

export interface Document {
  slug: string;
  spaceId: string;
  title: string;
  content: string;
  author: string | null;
  tags: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SpaceSettings {
  name?: string;
  description?: string;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  linesAdded: number;
  linesRemoved: number;
  baseLines: number;
}

export interface DiffResponse {
  diff: string;
}

export type ShareType = 'EXTERNAL' | 'INTERNAL';
export type ResourceType = 'space' | 'folder' | 'document';

export interface ShareInfo {
  token: string;
  type: ShareType;
  resourceType: ResourceType;
  spaceId: string;
  resourcePath: string | null;
  label: string | null;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
  expired: boolean;
}

export interface ShareRequest {
  type: ShareType;
  resourceType: ResourceType;
  spaceId: string;
  resourcePath: string | null;
  label: string | null;
  expiresAt: string | null;
}

export interface RoleInfo {
  id: number;
  name: string;
  builtin: boolean;
  permissions: string[];
}

export interface EmailSettings {
  enabled: boolean;
  smtpHost: string | null;
  smtpPort: number;
  smtpUsername: string | null;
  passwordSet: boolean;
  smtpFrom: string | null;
  smtpFromName: string | null;
  smtpTls: boolean;
  smtpAuth: boolean;
}

export interface EmailSettingsRequest {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string | null;
  smtpFrom: string;
  smtpFromName: string;
  smtpTls: boolean;
  smtpAuth: boolean;
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'document' | 'folder';
  title?: string;
  children?: TreeNode[];
}