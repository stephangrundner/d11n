import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { d11nTokens } from "../../theme";
import { AddCircleIcon } from "../../icons";

export interface CreateCardProps {
  /** Call-to-action label, e.g. "Neuen Space anlegen". */
  label: string;
  onCreate?: () => void;
}

/**
 * The dashed "create new" card that trails the Content View grid.
 * See docs/ui/content-view.md (Ghost-Card).
 */
export function CreateCard({ label, onCreate }: CreateCardProps) {
  return (
    <ButtonBase
      onClick={onCreate}
      sx={{
        width: "100%",
        minHeight: 150,
        height: "100%",
        border: "1.5px dashed #c4c7c5",
        borderRadius: "12px",
        color: "#5f6368",
        "&:hover": { bgcolor: "rgba(31,95,196,0.03)", borderColor: d11nTokens.primary },
      }}
    >
      <Stack alignItems="center" justifyContent="center" spacing={1.25} sx={{ p: "20px" }}>
        <AddCircleIcon sx={{ fontSize: 30, color: d11nTokens.primary }} />
        <Typography sx={{ fontWeight: 500, fontSize: 14, color: "rgba(0,0,0,0.7)" }}>{label}</Typography>
      </Stack>
    </ButtonBase>
  );
}
