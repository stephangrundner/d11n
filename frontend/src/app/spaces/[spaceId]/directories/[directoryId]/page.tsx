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
import { directories, documents, spaces } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { isAuthenticated } from "@/lib/auth";
import { useSearch } from "@/providers/SearchProvider";
import { demoTags, demoVisibility } from "@/lib/mockDesign";

export default function DirectoryPage() {
  const router = useRouter();
  const { spaceId, directoryId } = useParams<{ spaceId: string; directoryId: string }>();
  const dirId = Number(directoryId);
  const spId = Number(spaceId);
  const queryClient = useQueryClient();
  const { openSearch } = useSearch();

  const [neuAnchor, setNeuAnchor] = useState<null | HTMLElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [visibility, setVisibility] = useState<ShareVisibility>("group");

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const { data: space } = useQuery({ queryKey: queryKeys.spaces.detail(spId), queryFn: () => spaces.get(spId) });
  const { data: dir } = useQuery({ queryKey: queryKeys.directories.detail(dirId), queryFn: () => directories.get(dirId) });
  const { data: contents, isLoading } = useQuery({ queryKey: queryKeys.directories.contents(dirId), queryFn: () => directories.contents(dirId) });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.directories.contents(dirId) });
  const createSubDir = useMutation({ mutationFn: () => directories.createInDirectory(dirId, "Neues Verzeichnis"), onSuccess: invalidate });
  const createDoc = useMutation({ mutationFn: () => documents.createInDirectory(dirId, "Neues Dokument"), onSuccess: invalidate });

  const rows: ContentRow[] = (contents ?? []).map((item) => ({
    id: item.id,
    type: item.type === "DIRECTORY" ? "folder" : "document",
    name: item.name,
    tags: demoTags(item.id),
    visibility: demoVisibility(item.id),
    updatedAt: item.updatedAt,
    onOpen: () =>
      item.type === "DIRECTORY"
        ? router.push(`/spaces/${spId}/directories/${item.id}`)
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
        { label: space?.name ?? "Space", onClick: () => router.push(`/spaces/${spId}`) },
        { label: dir?.name ?? "Verzeichnis" },
      ]}
      maxWidth={980}
    >
      <PageHeader
        title={dir?.name ?? "Verzeichnis"}
        icon={icons.FolderIcon}
        color="#F6B73C"
        containerColor="#FFF3DF"
        visibility="inherited"
        tags={demoTags(dirId)}
        actions={
          <Button variant="contained" startIcon={<icons.AddIcon />} onClick={(e) => setNeuAnchor(e.currentTarget)}>
            Neu
          </Button>
        }
      />

      <Menu anchorEl={neuAnchor} open={Boolean(neuAnchor)} onClose={() => setNeuAnchor(null)}>
        <MenuItem onClick={() => { setNeuAnchor(null); createSubDir.mutate(); }}>Neues Verzeichnis</MenuItem>
        <MenuItem onClick={() => { setNeuAnchor(null); createDoc.mutate(); }}>Neues Dokument</MenuItem>
      </Menu>

      {!isLoading && <ContentTree rows={rows} />}

      <ShareDialog
        open={shareOpen}
        contextLabel={dir?.name ?? "Verzeichnis"}
        inheritedFrom={space?.name}
        value={visibility}
        onChange={setVisibility}
        members={[{ label: "Team Architektur", initials: "TA", color: "#1F5FC4" }]}
        onClose={() => setShareOpen(false)}
        onSave={() => setShareOpen(false)}
      />
      <SettingsDialog
        open={settingsOpen}
        contextKind="directory"
        title={dir?.name ?? ""}
        tags={demoTags(dirId)}
        visibilityLabel="geerbt"
        onChangeVisibility={() => { setSettingsOpen(false); setShareOpen(true); }}
        onClose={() => setSettingsOpen(false)}
      />
    </AppShell>
  );
}
