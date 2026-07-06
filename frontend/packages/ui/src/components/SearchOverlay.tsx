import { useEffect, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import { d11nTokens } from "../theme";
import { SearchIcon, DocumentIcon, FolderIcon, TagIcon, ReturnIcon, ArrowUpIcon, ArrowDownIcon } from "../icons";

export type SearchFilter = "all" | "docs" | "tag";

export interface SearchResultItem {
  id: string | number;
  type: "document" | "folder";
  title: string;
  snippet?: string;
  tagHit?: string;
}

export interface SearchResultGroup {
  label: string;
  items: SearchResultItem[];
}

export interface SearchOverlayProps {
  open: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  results?: SearchResultGroup[];
  filter?: SearchFilter;
  onFilterChange?: (f: SearchFilter) => void;
  onClose: () => void;
  onSelect?: (item: SearchResultItem) => void;
}

function FilterChip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        height: 30,
        px: "14px",
        borderRadius: "15px",
        border: "none",
        cursor: "pointer",
        font: "inherit",
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        color: active ? "#fff" : "rgba(0,0,0,0.7)",
        bgcolor: active ? d11nTokens.primary : "#fff",
        boxShadow: active ? "none" : "inset 0 0 0 1px rgba(0,0,0,0.16)",
      }}
    >
      {label}
    </Box>
  );
}

/**
 * The global search overlay (magnifier / Shift + Shift). A centered modal with
 * an input, filter chips, grouped results, and keyboard hints.
 * See docs/ui/search.md.
 */
export function SearchOverlay({ open, query, onQueryChange, results = [], filter = "all", onFilterChange, onClose, onSelect }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: { sx: { width: 600, maxWidth: "92vw", borderRadius: "16px", boxShadow: d11nTokens.dialogShadow, m: 0 } },
      }}
      sx={{ "& .MuiDialog-container": { alignItems: "flex-start" }, "& .MuiDialog-paper": { mt: "96px" } }}
    >
      {/* input */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "14px", px: "22px", py: "18px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <SearchIcon sx={{ fontSize: 26, color: "rgba(0,0,0,0.45)" }} />
        <InputBase
          inputRef={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Suchen … (Inhalt & Tags)"
          sx={{ flex: 1, fontSize: 21, color: "rgba(0,0,0,0.87)" }}
        />
        <Box component="span" sx={{ fontSize: 11, color: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,0,0,0.16)", borderRadius: "5px", px: "8px", py: "3px" }}>
          esc
        </Box>
      </Box>

      {/* filter chips */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", px: "22px", pt: "14px", pb: "6px" }}>
        <FilterChip label="Alle" active={filter === "all"} onClick={() => onFilterChange?.("all")} />
        <FilterChip label="Nur Dokumente" active={filter === "docs"} onClick={() => onFilterChange?.("docs")} />
        <FilterChip label="Tags" active={filter === "tag"} onClick={() => onFilterChange?.("tag")} />
      </Box>

      {/* results */}
      <Box sx={{ px: "10px", pt: "6px", pb: "10px", maxHeight: 420, overflowY: "auto" }}>
        {results.length === 0 && (
          <Typography sx={{ px: "12px", py: "20px", fontSize: 14, color: "rgba(0,0,0,0.5)" }}>
            {query ? "Keine Treffer." : "Tippe, um zu suchen."}
          </Typography>
        )}
        {results.map((group) => (
          <Box key={group.label}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: "rgba(0,0,0,0.5)", letterSpacing: "0.05em", textTransform: "uppercase", px: "12px", pt: "12px", pb: "6px" }}>
              {group.label}
            </Typography>
            {group.items.map((item) => {
              const Icon = item.type === "folder" ? FolderIcon : DocumentIcon;
              const tileBg = item.type === "folder" ? d11nTokens.folderContainer : d11nTokens.primaryContainerDark;
              const tileColor = item.type === "folder" ? d11nTokens.folder : d11nTokens.primary;
              return (
                <Box
                  key={`${item.type}-${item.id}`}
                  onClick={() => onSelect?.(item)}
                  sx={{ display: "flex", alignItems: "center", gap: "14px", px: "12px", py: "11px", borderRadius: "10px", cursor: "pointer", "&:hover": { bgcolor: d11nTokens.primaryContainer } }}
                >
                  <Box sx={{ width: 36, height: 36, borderRadius: "9px", bgcolor: tileBg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    <Icon sx={{ fontSize: 20, color: tileColor }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 500, color: "rgba(0,0,0,0.87)" }} noWrap>
                      {item.title}
                    </Typography>
                    {item.snippet && (
                      <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.55)" }} noWrap>
                        {item.snippet}
                      </Typography>
                    )}
                    {item.tagHit && (
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: "5px", mt: "2px", fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
                        <TagIcon sx={{ fontSize: 14, color: d11nTokens.primary }} />
                        Tag-Treffer: {item.tagHit}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* footer hints */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: "22px", py: "11px", borderTop: "1px solid rgba(0,0,0,0.08)", bgcolor: d11nTokens.surfaceAlt, fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "14px" }}>
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <ArrowUpIcon sx={{ fontSize: 16 }} />
            <ArrowDownIcon sx={{ fontSize: 16 }} />
            navigieren
          </Box>
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <ReturnIcon sx={{ fontSize: 16 }} />
            öffnen
          </Box>
        </Box>
        <Box component="span">Inhalt &amp; Tags · Shift Shift</Box>
      </Box>
    </Dialog>
  );
}
