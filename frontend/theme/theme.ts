'use client';
import { createTheme } from '@mui/material/styles';

export function createAppTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#0d69d5' },
      ...(mode === 'light'
        ? {
            background: { default: '#ffffff', paper: '#ffffff' },
            text: { primary: '#1c1c1e', secondary: '#6b6b6b' },
          }
        : {
            background: { default: '#111113', paper: '#1c1c1e' },
            text: { primary: '#f5f5f7', secondary: '#98989f' },
          }),
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 14,
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 6 },
    components: {
      MuiListItemButton: {
        styleOverrides: {
          root: { borderRadius: 6, paddingTop: 5, paddingBottom: 5, paddingLeft: 10, paddingRight: 10 },
        },
      },
      MuiListItemIcon: {
        styleOverrides: { root: { minWidth: 32 } },
      },
      MuiModal: {
        defaultProps: { disableScrollLock: true },
      },
    },
  });
}
