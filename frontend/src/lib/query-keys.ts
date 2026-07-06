export const queryKeys = {
  spaces: {
    all: () => ["spaces"] as const,
    detail: (id: number) => ["spaces", id] as const,
    contents: (id: number) => ["spaces", id, "contents"] as const,
  },
  directories: {
    detail: (id: number) => ["directories", id] as const,
    contents: (id: number) => ["directories", id, "contents"] as const,
  },
  documents: {
    detail: (id: number) => ["documents", id] as const,
  },
} as const;
