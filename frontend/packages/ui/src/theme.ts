import { createTheme, type Theme } from "@mui/material/styles";

/**
 * d11n design tokens, derived from the Claude Design hi-fi mockup
 * ("d11n Mockups"). Single source of truth for color, elevation and shape.
 * Import these directly in components; the values are also wired into the MUI
 * palette below where MUI consumes them.
 */
export const d11nTokens = {
  primary: "#1F5FC4",
  primaryContainer: "#E8EFFB",
  primaryContainerDark: "#CFE0FB",
  success: "#2E7D32",
  successContainer: "#E6F4EA",
  error: "#C62828",
  errorStrong: "#D32F2F",
  errorContainer: "#FDECEA",
  info: "#0288D1",
  infoContainer: "#E8F3FC",
  folder: "#F6B73C",
  folderContainer: "#FFF3DF",
  background: "#F4F5F7",
  paper: "#FFFFFF",
  surfaceAlt: "#FAFBFC",
  surfaceNested: "#FCFCFD",
  textHeading: "#1B1B1F",
  textBody: "rgba(0,0,0,0.87)",
  textSecondary: "rgba(0,0,0,0.6)",
  textTertiary: "rgba(0,0,0,0.55)",
  divider: "rgba(0,0,0,0.08)",
  cardShadow: "0 2px 1px -1px rgba(0,0,0,.06),0 1px 1px rgba(0,0,0,.08),0 1px 3px rgba(0,0,0,.10)",
  menuShadow: "0 5px 5px -3px rgba(0,0,0,.2),0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12)",
  dialogShadow: "0 11px 15px -7px rgba(0,0,0,.2),0 24px 38px 3px rgba(0,0,0,.14),0 9px 46px 8px rgba(0,0,0,.12)",
  buttonShadow: "0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px rgba(0,0,0,.14),0 1px 5px rgba(0,0,0,.12)",
  avatarPalette: ["#7E57C2", "#0288D1", "#2E7D32", "#C62828", "#F6B73C", "#1F5FC4"],
} as const;

const fontFamily = "Roboto, system-ui, -apple-system, Segoe UI, sans-serif";

/**
 * The d11n MUI theme — the look of every component in this library and in the
 * consuming application. Light appearance is the default; the editor mode
 * switches the Menu Bar to the primary color (see docs/ui/document-modes.md).
 */
export const d11nTheme: Theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: d11nTokens.primary, contrastText: "#fff" },
    success: { main: d11nTokens.success, contrastText: "#fff" },
    error: { main: d11nTokens.error, contrastText: "#fff" },
    info: { main: d11nTokens.info, contrastText: "#fff" },
    background: { default: d11nTokens.background, paper: d11nTokens.paper },
    text: { primary: d11nTokens.textBody, secondary: d11nTokens.textSecondary },
    divider: d11nTokens.divider,
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily,
    h4: { fontWeight: 400, letterSpacing: "-0.3px", color: d11nTokens.textHeading },
    h5: { fontWeight: 600, color: d11nTokens.textHeading },
    h6: { fontWeight: 500, color: d11nTokens.textHeading },
    button: { textTransform: "none", fontWeight: 500, letterSpacing: "0.02em" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
        containedPrimary: { boxShadow: d11nTokens.buttonShadow },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 12 },
      },
    },
  },
});
