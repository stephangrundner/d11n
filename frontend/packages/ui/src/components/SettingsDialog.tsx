import type { ComponentType } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { d11nTokens } from "../theme";
import { SettingsIcon, CloseIcon, TuneIcon, TagIcon, VisibilityIcon, HistoryIcon, DeleteIcon, AddIcon, ShareIcon } from "../icons";
import { TagChip } from "./primitives";

export type SettingsContext = "document" | "space" | "directory";

const KIND_LABEL: Record<SettingsContext, string> = { document: "Dokument", space: "Space", directory: "Ordner" };

export interface SettingsDialogProps {
  open: boolean;
  contextKind: SettingsContext;
  title: string;
  onTitleChange?: (t: string) => void;
  tags?: string[];
  visibilityLabel?: string;
  readModeDefault?: boolean;
  onToggleReadMode?: (v: boolean) => void;
  onChangeVisibility?: () => void;
  onClose: () => void;
}

function NavItem({ icon: Icon, label, active, danger }: { icon: ComponentType<SvgIconProps>; label: string; active?: boolean; danger?: boolean }) {
  const color = danger ? "#d32f2f" : active ? d11nTokens.primary : "rgba(0,0,0,0.7)";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "11px", height: 42, px: "12px", borderRadius: "10px", color, fontSize: 14, fontWeight: active ? 500 : 400, bgcolor: active ? d11nTokens.primaryContainer : "transparent", cursor: "pointer" }}>
      <Icon sx={{ fontSize: 20, color: danger ? "#d32f2f" : active ? d11nTokens.primary : "rgba(0,0,0,0.5)" }} />
      {label}
    </Box>
  );
}

/**
 * The context-sensitive settings dialog (gear). The gear targets the active
 * context — document, space, or directory. See docs/ui/menu-bar.md.
 */
export function SettingsDialog({ open, contextKind, title, onTitleChange, tags = [], visibilityLabel = "Privat", readModeDefault = true, onToggleReadMode, onChangeVisibility, onClose }: SettingsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} slotProps={{ paper: { sx: { width: 720, maxWidth: "94vw", borderRadius: "16px", boxShadow: d11nTokens.dialogShadow, display: "flex", flexDirection: "row", minHeight: 480 } } }}>
      {/* left nav */}
      <Box sx={{ width: 210, bgcolor: d11nTokens.surfaceAlt, borderRight: "1px solid rgba(0,0,0,0.08)", p: "18px 12px", display: "flex", flexDirection: "column", flex: "none" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "9px", px: "8px", pb: "14px" }}>
          <SettingsIcon sx={{ fontSize: 22, color: d11nTokens.primary }} />
          <Typography sx={{ fontSize: 15, fontWeight: 500, color: "rgba(0,0,0,0.87)" }}>{KIND_LABEL[contextKind]}</Typography>
        </Box>
        <NavItem icon={TuneIcon} label="Allgemein" active />
        <NavItem icon={TagIcon} label="Tags" />
        <NavItem icon={VisibilityIcon} label="Sichtbarkeit" />
        <NavItem icon={HistoryIcon} label="Verlauf" />
        <NavItem icon={DeleteIcon} label="Löschen" danger />
        <Typography sx={{ mt: "auto", fontSize: 11, lineHeight: 1.5, color: "rgba(0,0,0,0.4)", p: "8px" }}>
          Im Space zeigt das Zahnrad Space-Einstellungen, im Ordner Verzeichnis-Einstellungen.
        </Typography>
      </Box>

      {/* content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "18px 24px 0" }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, color: "rgba(0,0,0,0.87)" }}>Allgemein</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: "rgba(0,0,0,0.45)" }}>
            <CloseIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>
        <Box sx={{ p: "20px 24px", display: "flex", flexDirection: "column", gap: "22px", flex: 1 }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: d11nTokens.primary, mb: "6px" }}>Titel</Typography>
            <InputBase
              value={title}
              onChange={(e) => onTitleChange?.(e.target.value)}
              sx={{ height: 44, width: "100%", borderRadius: "6px", boxShadow: `inset 0 0 0 2px ${d11nTokens.primary}`, px: "14px", fontSize: 15, color: "rgba(0,0,0,0.87)" }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.6)", mb: "8px" }}>Tags</Typography>
            <Box sx={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              {tags.map((t) => (
                <TagChip key={t} label={t} onDelete={() => {}} />
              ))}
              <Box component="button" type="button" sx={{ display: "inline-flex", alignItems: "center", gap: "5px", height: 32, px: "12px", borderRadius: "16px", border: "none", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)", bgcolor: "transparent", cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 500, color: "rgba(0,0,0,0.6)" }}>
                <AddIcon sx={{ fontSize: 17 }} />
                Tag
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(0,0,0,0.08)", pt: "18px" }}>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.87)" }}>Sichtbarkeit</Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.55)", mt: "2px" }}>{visibilityLabel}</Typography>
            </Box>
            <Box component="button" type="button" onClick={onChangeVisibility} sx={{ display: "inline-flex", alignItems: "center", gap: "6px", height: 34, px: "14px", borderRadius: "6px", border: "none", boxShadow: `inset 0 0 0 1px ${d11nTokens.primary}`, bgcolor: "transparent", cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 500, color: d11nTokens.primary }}>
              <ShareIcon sx={{ fontSize: 17 }} />
              Ändern
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.87)" }}>Beim Öffnen Lese-Modus</Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.55)", mt: "2px" }}>Standardverhalten für dieses {KIND_LABEL[contextKind]}</Typography>
            </Box>
            <Switch checked={readModeDefault} onChange={(e) => onToggleReadMode?.(e.target.checked)} />
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
