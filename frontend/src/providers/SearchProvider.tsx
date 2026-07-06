"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SearchOverlay, type SearchFilter } from "@d11n/ui";
import { mockSearchResults } from "@/lib/mockDesign";

interface SearchContextValue {
  openSearch: () => void;
}

const SearchContext = createContext<SearchContextValue>({ openSearch: () => {} });

/** Access the global search overlay (e.g. from a Menu Bar search button). */
export function useSearch() {
  return useContext(SearchContext);
}

/**
 * Mounts the global search overlay and opens it on the magnifier action or the
 * Shift+Shift shortcut (see docs/ui/search.md). Results are mock data for now.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");

  const openSearch = useCallback(() => setOpen(true), []);

  // Shift+Shift shortcut.
  useEffect(() => {
    let lastShift = 0;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Shift" || e.repeat) return;
      const now = e.timeStamp;
      if (now - lastShift < 400) {
        setOpen(true);
        lastShift = 0;
      } else {
        lastShift = now;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => {
    const groups = mockSearchResults(query);
    if (filter === "docs") {
      return groups
        .map((g) => ({ ...g, items: g.items.filter((it) => it.type === "document") }))
        .filter((g) => g.items.length > 0);
    }
    if (filter === "tag") {
      return groups
        .map((g) => ({ ...g, items: g.items.filter((it) => it.tagHit) }))
        .filter((g) => g.items.length > 0);
    }
    return groups;
  }, [query, filter]);

  const value = useMemo(() => ({ openSearch }), [openSearch]);

  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchOverlay
        open={open}
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
        results={results}
        onClose={() => setOpen(false)}
        onSelect={() => setOpen(false)}
      />
    </SearchContext.Provider>
  );
}
