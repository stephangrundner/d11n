"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import dynamic from "next/dynamic";
import {
  AppShell,
  DocumentReadView,
  EditorStatusPill,
  ShareDialog,
  SettingsDialog,
  icons,
  d11nTokens,
  type ShareVisibility,
} from "@d11n/ui";
import { documents, blocks as blocksApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { isAuthenticated } from "@/lib/auth";
import { useSearch } from "@/providers/SearchProvider";
import { demoTags } from "@/lib/mockDesign";
import type { BlockRequest } from "@/lib/api";

const BlockEditor = dynamic(
  () => import("@/components/editor/BlockEditor").then((m) => ({ default: m.BlockEditor })),
  { ssr: false }
);

interface Props {
  params: Promise<{ id: string }>;
}

export default function DocumentPage({ params }: Props) {
  const { id } = use(params);
  const documentId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openSearch } = useSearch();

  const [editMode, setEditMode] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [visibility, setVisibility] = useState<ShareVisibility>("group");
  const getBlocksRef = useRef<(() => BlockRequest[]) | null>(null);
  const snapshotRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const { data: document, isLoading, error } = useQuery({
    queryKey: queryKeys.documents.detail(documentId),
    queryFn: () => documents.get(documentId),
  });

  const saveMutation = useMutation({
    mutationFn: (requests: BlockRequest[]) => blocksApi.batchReplace(documentId, requests),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(documentId) });
      setLeaveOpen(false);
      setEditMode(false);
    },
  });

  const handleSave = useCallback(() => {
    if (!getBlocksRef.current) return;
    saveMutation.mutate(getBlocksRef.current());
  }, [saveMutation]);

  const handleEditorReady = useCallback((getBlocks: () => BlockRequest[]) => {
    getBlocksRef.current = getBlocks;
    // Snapshot the loaded content so we can detect unsaved changes on exit.
    snapshotRef.current = JSON.stringify(getBlocks());
  }, []);

  const isDirty = useCallback(() => {
    if (!getBlocksRef.current || snapshotRef.current === null) return false;
    return JSON.stringify(getBlocksRef.current()) !== snapshotRef.current;
  }, []);

  // Leaving editor mode via the pencil: ask before discarding unsaved changes.
  const attemptLeaveEdit = useCallback(() => {
    if (isDirty()) setLeaveOpen(true);
    else setEditMode(false);
  }, [isDirty]);

  const discardChanges = useCallback(() => {
    setLeaveOpen(false);
    setEditMode(false);
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !document) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Typography color="error">Dokument nicht gefunden.</Typography>
      </Box>
    );
  }

  const tags = demoTags(documentId);

  return (
    <AppShell
      menuBar={{
        editMode,
        onHome: () => router.push("/spaces"),
        onSearch: openSearch,
        onAccount: () => router.push("/account"),
        onEdit: () => (editMode ? attemptLeaveEdit() : setEditMode(true)),
        onShare: () => setShareOpen(true),
        onSettings: () => setSettingsOpen(true),
      }}
      breadcrumb={[
        { label: "Spaces", icon: icons.HomeIcon, onClick: () => router.push("/spaces") },
        { label: document.title },
      ]}
      maxWidth={820}
    >
      {editMode && <EditorStatusPill />}

      {editMode ? (
        <Box sx={{ maxWidth: 720, mx: "auto", pt: 2 }}>
          <Typography sx={{ fontSize: 38, lineHeight: 1.2, fontWeight: 400, color: d11nTokens.textHeading, letterSpacing: "-0.5px" }}>
            {document.title}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <BlockEditor key={document.updatedAt} blocks={document.blocks} editable onEditorReady={handleEditorReady} />
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending}>
              Speichern
            </Button>
            <Button variant="text" onClick={() => setEditMode(false)} disabled={saveMutation.isPending}>
              Abbrechen
            </Button>
          </Stack>
        </Box>
      ) : (
        <DocumentReadView title={document.title} tags={tags} meta="zuletzt aktualisiert">
          <BlockEditor key={document.updatedAt} blocks={document.blocks} editable={false} onEditorReady={handleEditorReady} />
        </DocumentReadView>
      )}

      <Dialog open={leaveOpen} onClose={() => setLeaveOpen(false)}>
        <DialogTitle>Ungespeicherte Änderungen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Du hast Änderungen vorgenommen, die noch nicht gespeichert sind. Möchtest du sie speichern oder verwerfen?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveOpen(false)}>Abbrechen</Button>
          <Button color="error" onClick={discardChanges} disabled={saveMutation.isPending}>
            Verwerfen
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      <ShareDialog
        open={shareOpen}
        contextLabel={document.title}
        value={visibility}
        onChange={setVisibility}
        members={[{ label: "Team Architektur", initials: "TA", color: "#1F5FC4" }, { label: "m.weber", initials: "MW", color: "#0288D1" }]}
        onClose={() => setShareOpen(false)}
        onSave={() => setShareOpen(false)}
      />
      <SettingsDialog
        open={settingsOpen}
        contextKind="document"
        title={document.title}
        tags={tags}
        visibilityLabel="Gruppen & Benutzer"
        onChangeVisibility={() => { setSettingsOpen(false); setShareOpen(true); }}
        onClose={() => setSettingsOpen(false)}
      />
    </AppShell>
  );
}
