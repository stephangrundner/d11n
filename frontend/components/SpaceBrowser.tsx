'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import { AppBreadcrumbs } from './AppBreadcrumbs';
import Typography from '@mui/material/Typography';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import NextLink from 'next/link';
import { api } from '@/lib/api';
import type { TreeNode } from '@/lib/types';
import { useDocumentSetter } from '@/contexts/DocumentContext';
import { ResourceList, ResourceRow } from './ResourceList';
import type { RowAction } from './ResourceList';
import { SpaceSettingsDialog } from './SpaceSettingsDialog';
import { FolderSettingsDialog } from './FolderSettingsDialog';
import { ShareDialog } from './ShareDialog';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  spaceId: string;
  path: string;
}

function getNodesAtPath(nodes: TreeNode[], path: string): TreeNode[] | null {
  if (!path) return nodes;
  const parts = path.split('/');
  let current: TreeNode[] = nodes;
  for (const part of parts) {
    const folder = current.find(n => n.name === part && n.type === 'folder');
    if (!folder?.children) return null;
    current = folder.children;
  }
  return current;
}

function buildBreadcrumbs(spaceId: string, path: string) {
  const crumbs: { label: string; href: string }[] = [
    { label: spaceId, href: `/spaces/${spaceId}` },
  ];
  if (!path) return crumbs;
  path.split('/').forEach((part, i, parts) => {
    crumbs.push({ label: part, href: `/spaces/${spaceId}/${parts.slice(0, i + 1).join('/')}` });
  });
  return crumbs;
}

const VALID_SLUG = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

export function SpaceBrowser({ spaceId, path }: Props) {
  const router = useRouter();
  const updateContext = useDocumentSetter();
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [newDocSlug, setNewDocSlug] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    updateContext({
      spaceId,
      slug: null,
      folderPath: path || null,
      onOpenSettings: () => setSettingsOpen(true),
    });
    return () => updateContext({ spaceId: null, slug: null, folderPath: null, onOpenSettings: () => {} });
  // setSettingsOpen is a stable React setter — excluded from deps intentionally
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId, path, updateContext]);

  const load = useCallback(() => {
    setLoading(true);
    api.tree(spaceId).then(setTree).finally(() => setLoading(false));
  }, [spaceId]);

  useEffect(() => { load(); }, [load]);

  const nodes = getNodesAtPath(tree, path);
  const crumbs = buildBreadcrumbs(spaceId, path);

  const submitCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) { setCreatingFolder(false); return; }
    await api.folders.create(spaceId, path ? `${path}/${name}` : name);
    setCreatingFolder(false);
    setNewFolderName('');
    load();
  };

  const submitCreateDoc = async () => {
    const slug = newDocSlug.trim();
    if (!VALID_SLUG.test(slug)) { setDocError('Only letters, numbers, hyphens and underscores.'); return; }
    const fullSlug = path ? `${path}/${slug}` : slug;
    try {
      await api.documents.create(spaceId, fullSlug, { title: newDocTitle.trim() || slug });
      setCreatingDoc(false);
      setNewDocSlug('');
      setNewDocTitle('');
      setDocError(null);
      router.push(`/spaces/${spaceId}/${fullSlug}`);
    } catch {
      setDocError('Failed to create document.');
    }
  };

  const breadcrumbNode = <AppBreadcrumbs crumbs={crumbs} sx={{ mb: 3 }} />;

  const settingsDialog = path ? (
    <FolderSettingsDialog
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      spaceId={spaceId}
      folderPath={path}
    />
  ) : (
    <SpaceSettingsDialog
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      spaceId={spaceId}
    />
  );

  // Folder not found — still render the breadcrumb but no list
  if (!loading && nodes === null) {
    return (
      <>
        <ResourceList loading={false} header={breadcrumbNode}>
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Folder not found.
          </Typography>
        </ResourceList>
        {settingsDialog}
      </>
    );
  }

  const footer = (
    <>
      {creatingDoc && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 1, borderRadius: 1,
          border: '1px solid', borderColor: 'primary.main',
          mt: 0.5, flexWrap: 'wrap',
        }}>
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
          <InputBase
            autoFocus
            value={newDocSlug}
            onChange={e => { setNewDocSlug(e.target.value); setDocError(null); }}
            onKeyDown={e => { if (e.key === 'Enter') submitCreateDoc(); if (e.key === 'Escape') setCreatingDoc(false); }}
            sx={{ flex: '1 1 120px', fontSize: '0.875rem', '& input': { p: 0 } }}
            placeholder="slug (e.g. my-page)"
          />
          <InputBase
            value={newDocTitle}
            onChange={e => setNewDocTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitCreateDoc(); if (e.key === 'Escape') setCreatingDoc(false); }}
            sx={{ flex: '2 1 160px', fontSize: '0.875rem', color: 'text.secondary', '& input': { p: 0 } }}
            placeholder="Title (optional)"
          />
          {docError && <Typography variant="caption" color="error" sx={{ width: '100%', pl: 3.5 }}>{docError}</Typography>}
          <IconButton size="small" onClick={submitCreateDoc}><CheckIcon sx={{ fontSize: 16 }} /></IconButton>
          <IconButton size="small" onClick={() => { setCreatingDoc(false); setDocError(null); }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}
      {creatingFolder && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 1, borderRadius: 1,
          border: '1px solid', borderColor: 'primary.main',
          mt: 0.5,
        }}>
          <FolderOutlinedIcon sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
          <InputBase
            autoFocus
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') submitCreateFolder();
              if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName(''); }
            }}
            sx={{ flex: 1, fontSize: '0.875rem', '& input': { p: 0 } }}
            placeholder="Folder name"
          />
          <IconButton size="small" onClick={submitCreateFolder}><CheckIcon sx={{ fontSize: 16 }} /></IconButton>
          <IconButton size="small" onClick={() => { setCreatingFolder(false); setNewFolderName(''); }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}
    </>
  );

  return (
    <>
    <ResourceList
      loading={loading}
      header={breadcrumbNode}
      headerActions={[
        {
          label: 'New document',
          icon: <NoteAddOutlinedIcon />,
          onClick: () => { setCreatingDoc(true); setNewDocSlug(''); setNewDocTitle(''); setDocError(null); },
        },
        {
          label: 'New folder',
          icon: <CreateNewFolderOutlinedIcon />,
          onClick: () => { setCreatingFolder(true); setNewFolderName(''); },
        },
      ]}
      emptyMessage="This folder is empty."
      footer={footer}
    >
      {(nodes ?? []).map(node =>
        node.type === 'folder' ? (
          <FolderRow
            key={node.path}
            node={node}
            spaceId={spaceId}
            onDelete={async () => { await api.folders.delete(spaceId, node.path); load(); }}
            onRename={async (newName) => { await api.folders.rename(spaceId, node.path, newName); load(); }}
          />
        ) : (
          <DocumentRow
            key={node.path}
            node={node}
            spaceId={spaceId}
            onDelete={async () => { await api.documents.delete(spaceId, node.path); load(); }}
          />
        )
      )}
    </ResourceList>
    {settingsDialog}
    </>
  );
}

// ---------------------------------------------------------------------------

function FolderRow({ node, spaceId, onDelete, onRename }: {
  node: TreeNode;
  spaceId: string;
  onDelete: () => void;
  onRename: (newName: string) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const submitRename = () => {
    const name = newName.trim();
    if (!name || name === node.name) { setRenaming(false); setNewName(node.name); return; }
    onRename(name);
    setRenaming(false);
  };

  const rowActions: RowAction[] = [
    {
      tooltip: 'Share',
      icon: <IosShareOutlinedIcon sx={{ fontSize: 16 }} />,
      onClick: (e) => { e.stopPropagation(); setShareOpen(true); },
    },
    {
      tooltip: 'Rename',
      icon: <DriveFileRenameOutlineIcon sx={{ fontSize: 16 }} />,
      onClick: (e) => { e.stopPropagation(); setRenaming(true); },
    },
    {
      tooltip: 'Delete',
      icon: <DeleteIcon sx={{ fontSize: 16 }} />,
      onClick: (e) => { e.stopPropagation(); setConfirmOpen(true); },
    },
  ];

  return (
    <>
      <ResourceRow
        icon={<FolderOutlinedIcon sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0 }} />}
        actions={renaming ? [] : rowActions}
      >
        {renaming ? (
          <>
            <InputBase
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') submitRename();
                if (e.key === 'Escape') { setRenaming(false); setNewName(node.name); }
              }}
              onClick={e => e.stopPropagation()}
              sx={{ flex: 1, fontSize: '0.875rem', '& input': { p: 0 } }}
            />
            <Tooltip title="Confirm"><IconButton size="small" onClick={submitRename}><CheckIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
            <Tooltip title="Cancel"><IconButton size="small" onClick={() => { setRenaming(false); setNewName(node.name); }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
          </>
        ) : (
          <Typography
            variant="body2"
            component={NextLink}
            href={`/spaces/${spaceId}/${node.path}`}
            onClick={e => e.stopPropagation()}
            sx={{ flex: 1, fontWeight: 500, textDecoration: 'none', color: 'inherit' }}
          >
            {node.name}
          </Typography>
        )}
      </ResourceRow>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        resourceType="folder"
        spaceId={spaceId}
        resourcePath={node.path}
        resourceLabel={node.name}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete "${node.name}"?`}
        message="The folder and all documents it contains will be permanently deleted."
        onConfirm={() => { setConfirmOpen(false); onDelete(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

// ---------------------------------------------------------------------------

function DocumentRow({ node, spaceId, onDelete }: { node: TreeNode; spaceId: string; onDelete: () => void }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rowActions: RowAction[] = [
    {
      tooltip: 'Share',
      icon: <IosShareOutlinedIcon sx={{ fontSize: 16 }} />,
      onClick: (e) => { e.stopPropagation(); setShareOpen(true); },
    },
    {
      tooltip: 'Delete',
      icon: <DeleteIcon sx={{ fontSize: 16 }} />,
      onClick: (e) => { e.stopPropagation(); setConfirmOpen(true); },
    },
  ];

  return (
    <>
      <ResourceRow
        icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0 }} />}
        actions={rowActions}
      >
        <Typography
          variant="body2"
          component={NextLink}
          href={`/spaces/${spaceId}/${node.path}`}
          sx={{ flex: 1, textDecoration: 'none', color: 'inherit' }}
        >
          {node.title || node.name}
        </Typography>
      </ResourceRow>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        resourceType="document"
        spaceId={spaceId}
        resourcePath={node.path}
        resourceLabel={node.title || node.name}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete "${node.title || node.name}"?`}
        message="This document will be permanently deleted."
        onConfirm={() => { setConfirmOpen(false); onDelete(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
