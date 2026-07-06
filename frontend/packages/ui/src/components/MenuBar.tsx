import type { ComponentType } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { d11nTokens } from "../theme";
import {
  HomeIcon,
  SearchIcon,
  AccountIcon,
  EditIcon,
  ShareIcon,
  SettingsIcon,
} from "../icons";

export type MenuBarView = "home" | "search" | "account";

export interface MenuBarProps {
  /** Which context-independent view is currently active. */
  active?: MenuBarView;
  /** Editor mode — the whole bar adopts the primary color (editing indicator). */
  editMode?: boolean;
  onHome?: () => void;
  onSearch?: () => void;
  onAccount?: () => void;
  /** Context-sensitive: toggle document edit mode. */
  onEdit?: () => void;
  /** Context-sensitive: open sharing/visibility of the active context. */
  onShare?: () => void;
  /** Context-sensitive: open settings of the active context. */
  onSettings?: () => void;
}

interface PillButtonProps {
  icon: ComponentType<SvgIconProps>;
  title: string;
  onClick?: () => void;
  /** Highlighted as the current view. */
  active?: boolean;
  /** Bar is in editor (primary) mode. */
  invert?: boolean;
  /** White circle + primary icon (the active edit toggle in editor mode). */
  editActive?: boolean;
}

function PillButton({ icon: Icon, title, onClick, active, invert, editActive }: PillButtonProps) {
  const disabled = !onClick;

  let bg = "transparent";
  let color: string;
  if (editActive) {
    bg = "rgba(255,255,255,0.92)";
    color = d11nTokens.primary;
  } else if (active) {
    bg = invert ? "rgba(255,255,255,0.18)" : d11nTokens.primaryContainer;
    color = invert ? "#fff" : d11nTokens.primary;
  } else if (invert) {
    color = disabled ? "rgba(255,255,255,0.35)" : "#fff";
  } else {
    color = disabled ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.6)";
  }

  return (
    <IconButton
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      sx={{
        width: 42,
        height: 42,
        bgcolor: bg,
        color,
        "&.Mui-disabled": { color },
        "&:hover": { bgcolor: editActive || active ? bg : invert ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.04)" },
      }}
    >
      <Icon sx={{ fontSize: 23 }} />
    </IconButton>
  );
}

/**
 * The floating, centered Menu Bar — the only permanently visible control.
 * Layout: Home · Suche · Konto │ Bearbeiten · Teilen · Einstellungen.
 * The three context-independent buttons highlight the active view; the three
 * context-sensitive buttons are disabled (faded) when no handler is provided.
 * In editMode the entire pill turns the primary color.
 * See docs/ui/menu-bar.md and docs/ui/document-modes.md.
 */
export function MenuBar({
  active,
  editMode,
  onHome,
  onSearch,
  onAccount,
  onEdit,
  onShare,
  onSettings,
}: MenuBarProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", pt: "22px", position: "relative", zIndex: 5 }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          p: "7px",
          borderRadius: "30px",
          boxShadow: d11nTokens.menuShadow,
          bgcolor: editMode ? d11nTokens.primary : "#fff",
        }}
      >
        <PillButton icon={HomeIcon} title="Spaces" onClick={onHome} active={active === "home"} invert={editMode} />
        <PillButton icon={SearchIcon} title="Suche (Shift + Shift)" onClick={onSearch} active={active === "search"} invert={editMode} />
        <PillButton icon={AccountIcon} title="Konto" onClick={onAccount} active={active === "account"} invert={editMode} />
        <Box sx={{ width: "1px", height: 26, mx: "6px", bgcolor: editMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.12)" }} />
        <PillButton
          icon={EditIcon}
          title={editMode ? "Bearbeitung beenden" : "Bearbeiten"}
          onClick={onEdit}
          invert={editMode}
          editActive={editMode}
        />
        <PillButton icon={ShareIcon} title="Teilen" onClick={onShare} invert={editMode} />
        <PillButton icon={SettingsIcon} title="Einstellungen" onClick={onSettings} invert={editMode} />
      </Box>
    </Box>
  );
}
