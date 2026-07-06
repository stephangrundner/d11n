import type { ComponentType, ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { SortIcon } from "../icons";
import { IconTile, TagChip, VisibilityChip, type Visibility } from "./primitives";

export interface PageHeaderProps {
  title: string;
  /** Subtitle line (used by the Spaces overview). */
  subtitle?: string;
  /** Icon tile shown before the title (used by Space/Directory headers). */
  icon?: ComponentType<SvgIconProps>;
  color?: string;
  containerColor?: string;
  /** Visibility chip shown next to the title. */
  visibility?: Visibility;
  /** Tag chips shown under the title. */
  tags?: string[];
  /** Right-aligned actions (sort pill, primary button …). */
  actions?: ReactNode;
}

/**
 * The header above a Content View: either a large title + subtitle (Spaces
 * overview) or an icon tile + name + visibility (Space/Directory), with
 * right-aligned actions. See docs/ui/content-view.md (Kontexttitel).
 */
export function PageHeader({ title, subtitle, icon: Icon, color, containerColor, visibility, tags, actions }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: subtitle ? "baseline" : "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
          {Icon && <IconTile icon={Icon} color={color} containerColor={containerColor} size={44} />}
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Typography sx={{ fontSize: Icon ? 28 : 32, fontWeight: 400, color: "#1b1b1f", letterSpacing: "-0.2px" }} noWrap>
                {title}
              </Typography>
              {visibility && (
                <Box sx={{ display: "inline-flex", alignItems: "center", height: 28, px: "11px", borderRadius: "14px", bgcolor: "rgba(0,0,0,0.06)" }}>
                  <VisibilityChip visibility={visibility} />
                </Box>
              )}
            </Box>
            {subtitle && (
              <Typography sx={{ fontSize: 14, color: "#5f6368", mt: "4px" }}>{subtitle}</Typography>
            )}
          </Box>
        </Box>
        {actions && <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>{actions}</Box>}
      </Box>
      {tags && tags.length > 0 && (
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: "14px", ml: Icon ? "58px" : 0 }}>
          {tags.map((t) => (
            <TagChip key={t} label={t} />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export interface SortPillProps {
  label: string;
  onClick?: () => void;
}

/** The outlined "sort" pill used in the Spaces overview header. */
export function SortPill({ label, onClick }: SortPillProps) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        height: 36,
        px: "12px",
        borderRadius: "18px",
        bgcolor: "#fff",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
        fontSize: 13,
        color: "rgba(0,0,0,0.7)",
      }}
    >
      <SortIcon sx={{ fontSize: 18 }} />
      {label}
    </ButtonBase>
  );
}
