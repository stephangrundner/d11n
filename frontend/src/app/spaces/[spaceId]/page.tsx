"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AppShell,
  PageHeader,
  ContentTree,
  ShareDialog,
  SettingsDialog,
  icons,
  type ContentRow,
  type ShareVisibility,
} from "@d11n/ui";
import { spaces, directories, documents } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { isAuthenticated } from "@/lib/auth";
import { useSearch } from "@/providers/SearchProvider";
import { spaceVisual, demoTags, demoVisibility } from "@/lib/mockDesign";

export default function SpacePage() {
  const router = useRouter();
  const { spaceId } = useParams<{ spaceId: string }>();
  const id = Number(spaceId);
  const queryClient = useQueryClient();
  const { openSearch } = useSearch();

  const [neuAnchor, setNeuAnchor] = useState<null | HTMLElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [visibility, setVisibility] = useState<ShareVisibility>("group");

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const { data: space } = useQuery({
    queryKey: queryKeys.spaces.detail(id),
    queryFn: () => spaces.get(id),
  });

  const { data: contents, isLoading } = useQuery({
    queryKey: queryKeys.spaces.contents(id),
    queryFn: () => spaces.contents(id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.spaces.contents(id) });
  const createDirectory = useMutation({ mutationFn: () => directories.createInSpace(id, "Neues Verzeichnis"), onSuccess: invalidate });
  const createDocument = useMutation({ mutationFn: () => documents.createInSpace(id, "Neues Dokument"), onSuccess: invalidate });

  const visual = spaceVisual(id);
  const rows: ContentRow[] = (contents ?? []).map((item) => ({
    id: item.id,
    type: item.type === "DIRECTORY" ? "folder" : "document",
    name: item.name,
    tags: demoTags(item.id),
    visibility: demoVisibility(item.id),
    updatedAt: item.updatedAt,
    onOpen: () =>
      item.type === "DIRECTORY"
        ? router.push(`/spaces/${id}/directories/${item.id}`)
        : router.push(`/documents/${item.id}`),
    onMenu: () => {},
  }));

  return (
    <AppShell
      menuBar={{
        onHome: () => router.push("/spaces"),
        onSearch: openSearch,
        onAccount: () => router.push("/account"),
        onShare: () => setShareOpen(true),
        onSettings: () => setSettingsOpen(true),
      }}
      breadcrumb={[
        { label: "Spaces", icon: icons.HomeIcon, onClick: () => router.push("/spaces") },
        { label: space?.name ?? "Space" },
      ]}
      maxWidth={980}
    >
      <PageHeader
        title={space?.name ?? "Space"}
        icon={visual.icon}
        color={visual.color}
        containerColor={visual.containerColor}
        visibility="private"
        tags={demoTags(id)}
        actions={
          <Button variant="contained" startIcon={<icons.AddIcon />} onClick={(e) => setNeuAnchor(e.currentTarget)}>
            Neu
          </Button>
        }
      />

      <Menu anchorEl={neuAnchor} open={Boolean(neuAnchor)} onClose={() => setNeuAnchor(null)}>
        <MenuItem onClick={() => { setNeuAnchor(null); createDirectory.mutate(); }}>Neues Verzeichnis</MenuItem>
        <MenuItem onClick={() => { setNeuAnchor(null); createDocument.mutate(); }}>Neues Dokument</MenuItem>
      </Menu>

      {!isLoading && <ContentTree rows={rows} />}

      <ShareDialog
        open={shareOpen}
        contextLabel={space?.name ?? "Space"}
        value={visibility}
        onChange={setVisibility}
        members={[{ label: "Team Architektur", initials: "TA", color: "#1F5FC4" }, { label: "m.weber", initials: "MW", color: "#0288D1" }]}
        onClose={() => setShareOpen(false)}
        onSave={() => setShareOpen(false)}
      />
      <SettingsDialog
        open={settingsOpen}
        contextKind="space"
        title={space?.name ?? ""}
        tags={demoTags(id)}
        visibilityLabel="Privat"
        onChangeVisibility={() => { setSettingsOpen(false); setShareOpen(true); }}
        onClose={() => setSettingsOpen(false)}
      />
    </AppShell>
  );
}
