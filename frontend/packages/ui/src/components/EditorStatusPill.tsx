import Box from "@mui/material/Box";
import { d11nTokens } from "../theme";
import { CloudDoneIcon } from "../icons";

export interface EditorStatusPillProps {
  text?: string;
}

/**
 * The status indicator shown under the Menu Bar in editor mode:
 * "Bearbeiten aktiv · automatisch gespeichert". See docs/ui/document-modes.md.
 */
export function EditorStatusPill({ text = "Bearbeiten aktiv · automatisch gespeichert" }: EditorStatusPillProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: "10px" }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          height: 28,
          px: "14px",
          borderRadius: "14px",
          bgcolor: "rgba(0,0,0,0.05)",
          fontSize: 12,
          color: "rgba(0,0,0,0.55)",
        }}
      >
        <CloudDoneIcon sx={{ fontSize: 15, color: d11nTokens.success }} />
        {text}
      </Box>
    </Box>
  );
}
