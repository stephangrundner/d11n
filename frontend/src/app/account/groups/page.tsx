"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, PermissionsAdmin, icons } from "@d11n/ui";
import { isAuthenticated } from "@/lib/auth";
import { useSearch } from "@/providers/SearchProvider";
import { mockGroups, mockGroupMembers, mockPermRows } from "@/lib/mockDesign";

export default function GroupsPage() {
  const router = useRouter();
  const { openSearch } = useSearch();
  const [selected, setSelected] = useState<string | number>(mockGroups[0].id);

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  return (
    <AppShell
      menuBar={{ active: "account", onHome: () => router.push("/spaces"), onSearch: openSearch, onAccount: () => router.push("/account") }}
      breadcrumb={[
        { label: "Konto", icon: icons.AccountIcon, onClick: () => router.push("/account") },
        { label: "Gruppen & Berechtigungen" },
      ]}
      maxWidth={1180}
    >
      <PermissionsAdmin
        groups={mockGroups}
        selectedGroupId={selected}
        onSelectGroup={setSelected}
        members={mockGroupMembers}
        rows={mockPermRows}
      />
    </AppShell>
  );
}
