import type { ComponentType } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { ChevronRightIcon } from "../icons";

export interface BreadcrumbItem {
  label: string;
  icon?: ComponentType<SvgIconProps>;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  /** Path items, root first. The last item is rendered as the current location. */
  items: BreadcrumbItem[];
}

/**
 * Centered breadcrumb shown directly under the Menu Bar.
 * The last item is the current location (bold, non-interactive).
 * See docs/ui/content-view.md.
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: "7px", color: "rgba(0,0,0,0.6)", fontSize: 14 }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const Icon = item.icon;
          const content = (
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              {Icon && <Icon sx={{ fontSize: 17 }} />}
              {item.label}
            </Box>
          );
          return (
            <Box component="span" key={i} sx={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
              {isLast ? (
                <Typography component="span" sx={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.87)", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  {Icon && <Icon sx={{ fontSize: 17 }} />}
                  {item.label}
                </Typography>
              ) : item.onClick ? (
                <Link component="button" type="button" onClick={item.onClick} underline="hover" sx={{ fontSize: 14, color: "inherit", display: "inline-flex", alignItems: "center" }}>
                  {content}
                </Link>
              ) : (
                content
              )}
              {!isLast && <ChevronRightIcon sx={{ fontSize: 18, color: "rgba(0,0,0,0.3)" }} />}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
