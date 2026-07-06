import Box from "@mui/material/Box";

/**
 * The subtle product footer shown at the bottom of every screen:
 * "d11n · Kontinuierliches Dokumentieren".
 */
export function AppFooter() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        height: 40,
        fontSize: 11,
        color: "rgba(0,0,0,0.3)",
        letterSpacing: "0.04em",
      }}
    >
      <Box component="span" sx={{ fontWeight: 500, letterSpacing: "0.16em" }}>
        d11n
      </Box>
      <Box component="span" sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "rgba(0,0,0,0.18)" }} />
      <Box component="span">Kontinuierliches Dokumentieren</Box>
    </Box>
  );
}
