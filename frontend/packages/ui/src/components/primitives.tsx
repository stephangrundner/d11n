import type { ComponentType } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { d11nTokens } from "../theme";
import { LockIcon, GroupIcon, PublicIcon } from "../icons";

// ── IconTile ────────────────────────────────────────────────────────────────

export interface IconTileProps {
  icon: ComponentType<SvgIconProps>;
  /** Foreground (icon) color. Defaults to primary. */
  color?: string;
  /** Container background. Defaults to the primary container. */
  containerColor?: string;
  /** Square size in px. */
  size?: number;
}

/** A rounded, color-filled square holding an icon — used by space cards and headers. */
export function IconTile({ icon: Icon, color = d11nTokens.primary, containerColor = d11nTokens.primaryContainer, size = 46 }: IconTileProps) {
  return (
    <Box sx={{ width: size, height: size, borderRadius: `${Math.round(size * 0.24)}px`, bgcolor: containerColor, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      <Icon sx={{ fontSize: Math.round(size * 0.54), color }} />
    </Box>
  );
}

// ── TagChip ─────────────────────────────────────────────────────────────────

export interface TagChipProps {
  label: string;
  size?: "small" | "medium";
  /** Optional delete handler (renders an X). */
  onDelete?: () => void;
}

/** A tag pill in the d11n primary-container style. */
export function TagChip({ label, size = "small", onDelete }: TagChipProps) {
  return (
    <Chip
      label={label}
      size={size}
      onDelete={onDelete}
      sx={{
        bgcolor: d11nTokens.primaryContainer,
        color: d11nTokens.primary,
        fontWeight: 500,
        borderRadius: "13px",
        "& .MuiChip-deleteIcon": { color: "rgba(31,95,196,0.6)" },
      }}
    />
  );
}

// ── VisibilityChip ──────────────────────────────────────────────────────────

export type Visibility = "private" | "group" | "external" | "inherited";

const VIS: Record<Visibility, { icon: ComponentType<SvgIconProps>; label: string; color: string }> = {
  private: { icon: LockIcon, label: "Privat", color: "rgba(0,0,0,0.6)" },
  group: { icon: GroupIcon, label: "Gruppen", color: d11nTokens.primary },
  external: { icon: PublicIcon, label: "Extern", color: "rgba(0,0,0,0.6)" },
  inherited: { icon: LockIcon, label: "geerbt", color: "rgba(0,0,0,0.55)" },
};

export interface VisibilityChipProps {
  visibility: Visibility;
}

/** Inline visibility indicator (lock / group / public) with its German label. */
export function VisibilityChip({ visibility }: VisibilityChipProps) {
  const v = VIS[visibility];
  const Icon = v.icon;
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: 12, color: v.color }}>
      <Icon sx={{ fontSize: 15 }} />
      {v.label}
    </Box>
  );
}

// ── AvatarStack ─────────────────────────────────────────────────────────────

export interface Member {
  initials: string;
  color?: string;
}

export interface AvatarStackProps {
  members: Member[];
  size?: number;
}

/** Overlapping circular member avatars. */
export function AvatarStack({ members, size = 28 }: AvatarStackProps) {
  return (
    <Box sx={{ display: "flex" }}>
      {members.map((m, i) => (
        <Box
          key={i}
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            bgcolor: m.color ?? d11nTokens.avatarPalette[i % d11nTokens.avatarPalette.length],
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #fff",
            ml: i === 0 ? 0 : "-9px",
          }}
        >
          {m.initials}
        </Box>
      ))}
    </Box>
  );
}
