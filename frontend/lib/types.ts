export interface Space {
  id: string;
  name: string;
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

export interface TreeNode {
  name: string;
  path: string;
  type: 'document' | 'folder';
  title?: string;
  children?: TreeNode[];
}