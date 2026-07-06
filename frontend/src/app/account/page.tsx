"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AppShell, PageHeader, icons, d11nTokens } from "@d11n/ui";
import { isAuthenticated, clearToken } from "@/lib/auth";
import { useSearch } from "@/providers/SearchProvider";

export default function AccountPage() {
  const router = useRouter();
  const { openSearch } = useSearch();

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const items = [
    { icon: icons.GroupIcon, label: "Gruppen & Berechtigungen", desc: "Rollen und feingranulare Rechte verwalten", onClick: () => router.push("/account/groups") },
    { icon: icons.AccountIcon, label: "Abmelden", desc: "Aktuelle Sitzung beenden", onClick: () => { clearToken(); router.push("/login"); } },
  ];

  return (
    <AppShell
      menuBar={{ active: "account", onHome: () => router.push("/spaces"), onSearch: openSearch, onAccount: () => router.push("/account") }}
      breadcrumb={[{ label: "Konto", icon: icons.AccountIcon }]}
      maxWidth={760}
    >
      <PageHeader title="Konto" subtitle="Einstellungen und Verwaltung" />
      <Box sx={{ bgcolor: "#fff", borderRadius: "12px", boxShadow: d11nTokens.cardShadow, overflow: "hidden" }}>
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <Box
              key={it.label}
              onClick={it.onClick}
              sx={{ display: "flex", alignItems: "center", gap: "14px", p: "16px 20px", cursor: "pointer", borderTop: i === 0 ? "none" : "1px solid rgba(0,0,0,0.06)", "&:hover": { bgcolor: "rgba(31,95,196,0.03)" } }}
            >
              <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: d11nTokens.primaryContainer, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon sx={{ fontSize: 22, color: d11nTokens.primary }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 500, color: "rgba(0,0,0,0.87)" }}>{it.label}</Typography>
                <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.55)" }}>{it.desc}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </AppShell>
  );
}
