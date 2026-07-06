import type { ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { d11nTheme } from "./theme";

export interface D11nThemeProviderProps {
  children: ReactNode;
}

/**
 * Root wrapper that every d11n UI component must be rendered inside.
 * It installs the d11n MUI theme and the MUI CSS baseline. Without it,
 * components fall back to default MUI styling and tokens.
 */
export function D11nThemeProvider({ children }: D11nThemeProviderProps) {
  return (
    <MuiThemeProvider theme={d11nTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
