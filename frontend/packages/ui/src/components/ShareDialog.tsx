import type { ComponentType } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { d11nTokens } from "../theme";
import { ShareIcon, CloseIcon, LockIcon, GroupIcon, PublicIcon, InfoIcon, LinkIcon, AddIcon } from "../icons";

export type ShareVisibility = "private" | "group" | "external";

export interface ShareMember {
  label: string;
  initials?: string;
  color?: string;
}

export interface ShareDialogProps {
  open: boolean;
  /** Name of the shared item. */
  contextLabel: string;
  /** Inherited-from source (folder/space name), if any. */
  inheritedFrom?: string;
  value: ShareVisibility;
  onChange: (v: ShareVisibility) => void;
  /** Members/groups shown for the "group" option. */
  members?: ShareMember[];
  onClose: () => void;
  onSave?: () => void;
  onCopyLink?: () => void;
  onAddMember?: () => void;
}

interface OptionProps {
  icon: ComponentType<SvgIconProps>;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <Box sx={{ width: 20, height: 20, borderRadius: "50%", mt: "1px", flex: "none", boxShadow: selected ? `inset 0 0 0 6px ${d11nTokens.primary}` : "inset 0 0 0 2px rgba(0,0,0,0.35)" }} />
  );
}

function Option({ icon: Icon, title, description, selected, onSelect, children }: OptionProps) {
  return (
    <Box
      onClick={onSelect}
      sx={{
        borderRadius: "12px",
        p: "14px 16px",
        cursor: "pointer",
        border: selected ? `2px solid ${d11nTokens.primary}` : "1px solid rgba(0,0,0,0.14)",
        bgcolor: selected ? "#f5f9ff" : "transparent",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: "13px" }}>
        <Radio selected={selected} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", fontSize: 15, fontWeight: 500, color: "rgba(0,0,0,0.87)" }}>
            <Icon sx={{ fontSize: 19, color: selected ? d11nTokens.primary : "rgba(0,0,0,0.6)" }} />
            {title}
          </Box>
          <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)", mt: "3px", ml: "27px" }}>{description}</Typography>
          {children && <Box sx={{ ml: "27px", mt: "12px" }}>{children}</Box>}
        </Box>
      </Box>
    </Box>
  );
}

/**
 * The Teilen / Sichtbarkeit dialog: private / group / external with optional
 * member chips and an inheritance note. See docs/ui/menu-bar.md (Teilen) and
 * docs/rules/business-rules.md (visibility levels).
 */
export function ShareDialog({ open, contextLabel, inheritedFrom, value, onChange, members = [], onClose, onSave, onCopyLink, onAddMember }: ShareDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} slotProps={{ paper: { sx: { width: 560, maxWidth: "92vw", borderRadius: "16px", boxShadow: d11nTokens.dialogShadow } } }}>
      <Box sx={{ p: "22px 24px 16px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <ShareIcon sx={{ fontSize: 24, color: d11nTokens.primary }} />
            <Typography sx={{ fontSize: 19, fontWeight: 500, color: "rgba(0,0,0,0.87)" }}>Teilen</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "rgba(0,0,0,0.45)" }}>
            <CloseIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>
        <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)", mt: "6px" }}>
          „{contextLabel}"
          {inheritedFrom && (
            <>
              {" "}· erbt aktuell von <Box component="b" sx={{ fontWeight: 500, color: "rgba(0,0,0,0.8)" }}>{inheritedFrom}</Box>
            </>
          )}
        </Typography>
      </Box>

      <Box sx={{ p: "18px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <Option icon={LockIcon} title="Privat" description="Nur der Eigentümer hat Zugriff (Standard)" selected={value === "private"} onSelect={() => onChange("private")} />
        <Option icon={GroupIcon} title="Gruppen & Benutzer" description="Gezielt für ausgewählte Gruppen und Personen" selected={value === "group"} onSelect={() => onChange("group")}>
          <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {members.map((m, i) => (
              <Box key={i} sx={{ display: "inline-flex", alignItems: "center", gap: "7px", height: 32, pl: "4px", pr: "6px", borderRadius: "16px", bgcolor: d11nTokens.primaryContainer, fontSize: 13, color: "rgba(0,0,0,0.85)" }}>
                <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: m.color ?? d11nTokens.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  {m.initials ?? <GroupIcon sx={{ fontSize: 15 }} />}
                </Box>
                {m.label}
              </Box>
            ))}
            <Box component="button" type="button" onClick={onAddMember} sx={{ display: "inline-flex", alignItems: "center", gap: "5px", height: 32, px: "12px", borderRadius: "16px", border: "none", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)", bgcolor: "transparent", cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 500, color: d11nTokens.primary }}>
              <AddIcon sx={{ fontSize: 17 }} />
              Hinzufügen
            </Box>
          </Box>
        </Option>
        <Option icon={PublicIcon} title="Extern" description="Öffentlich ohne Anmeldung erreichbar" selected={value === "external"} onSelect={() => onChange("external")} />

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px", bgcolor: d11nTokens.infoContainer, borderRadius: "8px", p: "12px 14px" }}>
          <InfoIcon sx={{ fontSize: 21, color: d11nTokens.info, mt: "1px" }} />
          <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: "#0d4f73" }}>
            Diese Auswahl überschreibt die geerbte Sichtbarkeit. Untergeordnete Inhalte erben sie automatisch, sofern sie nicht selbst eine eigene Sichtbarkeit setzen.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "14px 24px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <Button startIcon={<LinkIcon sx={{ fontSize: 18 }} />} onClick={onCopyLink} sx={{ color: d11nTokens.primary }}>
          Link kopieren
        </Button>
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Button onClick={onClose} sx={{ color: "rgba(0,0,0,0.6)", borderRadius: "4px" }}>
            Abbrechen
          </Button>
          <Button variant="contained" onClick={onSave} sx={{ borderRadius: "4px" }}>
            Speichern
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
