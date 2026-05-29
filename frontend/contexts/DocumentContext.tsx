'use client';
import { createContext, useCallback, useContext, useState } from 'react';

export interface DocumentState {
  spaceId: string | null;
  slug: string | null;
  title: string | null;
  isDirty: boolean;
  saving: boolean;
  reloadKey: number;
  onSave: () => void;
  onOpenHistory: () => void;
  onOpenSaveDialog: () => void;
}

const defaultState: DocumentState = {
  spaceId: null,
  slug: null,
  title: null,
  isDirty: false,
  saving: false,
  reloadKey: 0,
  onSave: () => {},
  onOpenHistory: () => {},
  onOpenSaveDialog: () => {},
};

// Read context — consumed by MenuBar
export const DocumentStateContext = createContext<DocumentState>(defaultState);

// Write context — consumed by DocumentEditor to push its state up
export const DocumentSetterContext = createContext<(patch: Partial<DocumentState>) => void>(() => {});

export function useDocumentContext() {
  return useContext(DocumentStateContext);
}

export function useDocumentSetter() {
  return useContext(DocumentSetterContext);
}

export function DocumentContextProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DocumentState>(defaultState);

  const update = useCallback((patch: Partial<DocumentState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  return (
    <DocumentSetterContext.Provider value={update}>
      <DocumentStateContext.Provider value={state}>
        {children}
      </DocumentStateContext.Provider>
    </DocumentSetterContext.Provider>
  );
}
