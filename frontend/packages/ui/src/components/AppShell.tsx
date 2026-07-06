import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { d11nTokens } from "../theme";
import { MenuBar, type MenuBarProps } from "./MenuBar";
import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";
import { AppFooter } from "./AppFooter";

export interface AppShellProps {
  /** Props forwarded to the floating Menu Bar. */
  menuBar: MenuBarProps;
  /** Optional breadcrumb shown under the Menu Bar. */
  breadcrumb?: BreadcrumbItem[];
  /** Max width of the centered content container (px). Defaults to 1080. */
  maxWidth?: number;
  children: ReactNode;
}

/**
 * Page scaffold shared by every screen: the d11n background, the floating Menu
 * Bar, an optional breadcrumb, a centered content container, and the footer.
 * The Menu Bar overlays the content (no reserved layout area).
 */
export function AppShell({ menuBar, breadcrumb, maxWidth = 1080, children }: AppShellProps) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: d11nTokens.background }}>
      <MenuBar {...menuBar} />
      {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
      <Box sx={{ flex: 1, width: "100%", maxWidth, mx: "auto", px: { xs: 2, sm: 4 }, pt: "30px", pb: "40px" }}>
        {children}
      </Box>
      <AppFooter />
    </Box>
  );
}
