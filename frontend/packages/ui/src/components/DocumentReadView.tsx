import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { TagChip } from "./primitives";

export interface DocumentReadViewProps {
  title: string;
  tags?: string[];
  /** Meta line, e.g. "aktualisiert vor 2 Tagen von M. Weber". */
  meta?: string;
  /** Rendered document body (read-only blocks). */
  children?: ReactNode;
}

/**
 * The distraction-free reading surface for a document (read mode, the default).
 * Centered, max-width 680. See docs/ui/document-modes.md (Lese-Modus).
 */
export function DocumentReadView({ title, tags, meta, children }: DocumentReadViewProps) {
  return (
    <Box sx={{ maxWidth: 680, mx: "auto", pt: "10px" }}>
      <Typography sx={{ fontSize: 38, lineHeight: 1.2, fontWeight: 400, color: "#1b1b1f", letterSpacing: "-0.5px" }}>
        {title}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mt: "18px", flexWrap: "wrap" }}>
        {tags && tags.length > 0 && (
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            {tags.map((t) => (
              <TagChip key={t} label={t} />
            ))}
          </Stack>
        )}
        {meta && <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)" }}>{meta}</Typography>}
      </Box>
      <Divider sx={{ my: "26px" }} />
      <Box
        sx={{
          fontSize: 17,
          lineHeight: 1.75,
          color: "rgba(0,0,0,0.82)",
          "& h1,& h2,& h3": { color: "#1b1b1f" },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
