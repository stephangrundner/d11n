import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { d11nTokens } from "../theme";
import { FolderIcon, DocumentIcon, ChevronRightIcon, MoreVertIcon } from "../icons";
import { TagChip, VisibilityChip, type Visibility } from "./primitives";
import { formatRelativeTime } from "../internal/time";

export interface ContentRow {
  id: string | number;
  type: "folder" | "document";
  name: string;
  tags?: string[];
  visibility?: Visibility;
  updatedAt?: string;
  /** Nesting depth for indentation (0 = top level). */
  depth?: number;
  onOpen?: () => void;
  onMenu?: () => void;
}

export interface ContentTreeProps {
  rows: ContentRow[];
}

const COLS = "1fr 180px 120px 120px 40px";

/**
 * The Content View list for a Space or Directory: a table/tree of folders and
 * documents (Name · Tags · Sichtbarkeit · Geändert · actions). Folders carry a
 * chevron + amber folder icon; clicking a row opens it.
 * See docs/ui/content-view.md (Space-/Verzeichnis-Inhalt).
 */
export function ContentTree({ rows }: ContentTreeProps) {
  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "12px", boxShadow: d11nTokens.cardShadow, overflow: "hidden" }}>
      {/* header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: COLS,
          alignItems: "center",
          px: "18px",
          py: "11px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          bgcolor: d11nTokens.surfaceAlt,
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(0,0,0,0.55)",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          "& > span:nth-of-type(n+2)": { display: { xs: "none", md: "block" } },
        }}
      >
        <span>Name</span>
        <span>Tags</span>
        <span>Sichtbarkeit</span>
        <span>Geändert</span>
        <span />
      </Box>

      {rows.map((row, i) => {
        const Icon = row.type === "folder" ? FolderIcon : DocumentIcon;
        const iconColor = row.type === "folder" ? d11nTokens.folder : d11nTokens.primary;
        const indent = (row.depth ?? 0) * 30;
        return (
          <Box
            key={`${row.type}-${row.id}`}
            onClick={row.onOpen}
            sx={{
              display: "grid",
              gridTemplateColumns: COLS,
              alignItems: "center",
              px: "18px",
              py: "13px",
              cursor: row.onOpen ? "pointer" : "default",
              borderBottom: i === rows.length - 1 ? "none" : "1px solid rgba(0,0,0,0.05)",
              "&:hover": { bgcolor: "rgba(31,95,196,0.03)" },
            }}
          >
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: "10px", pl: `${indent}px`, minWidth: 0 }}>
              {row.type === "folder" && <ChevronRightIcon sx={{ fontSize: 20, color: "rgba(0,0,0,0.45)" }} />}
              <Icon sx={{ fontSize: 21, color: iconColor, ml: row.type === "document" ? "30px" : 0 }} />
              <Typography sx={{ fontSize: 15, fontWeight: row.type === "folder" ? 500 : 400, color: "rgba(0,0,0,0.87)" }} noWrap>
                {row.name}
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: "6px" }}>
              {(row.tags ?? []).map((t) => (
                <TagChip key={t} label={t} />
              ))}
            </Box>

            <Box sx={{ display: { xs: "none", md: "block" } }}>
              {row.visibility && <VisibilityChip visibility={row.visibility} />}
            </Box>

            <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: 13, color: "rgba(0,0,0,0.55)" }}>
              {row.updatedAt ? formatRelativeTime(row.updatedAt) : ""}
            </Typography>

            <Box sx={{ display: { xs: "none", md: "block" } }}>
              {row.onMenu && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    row.onMenu!();
                  }}
                  sx={{ color: "rgba(0,0,0,0.3)" }}
                >
                  <MoreVertIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
            </Box>
          </Box>
        );
      })}

      {rows.length === 0 && (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <Typography sx={{ fontSize: 14, color: "rgba(0,0,0,0.5)" }}>Dieser Bereich ist noch leer.</Typography>
        </Stack>
      )}
    </Box>
  );
}
