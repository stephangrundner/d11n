'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import NextLink from 'next/link';
import { api } from '@/lib/api';
import type { TreeNode } from '@/lib/types';

interface Props {
  spaceId: string;
  path: string; // "" for root, "folder", "folder/sub" for nested
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
  const parts = path.split('/');
  parts.forEach((part, i) => {
    crumbs.push({ label: part, href: `/spaces/${spaceId}/${parts.slice(0, i + 1).join('/')}` });
  });
  return crumbs;
}

const VALID_SLUG = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

export function SpaceBrowser({ spaceId, path }: Props) {
  const router = useRouter();
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [newDocSlug, setNewDocSlug] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [docError, setDocError] = useState<string | null>(null);

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
    const folderPath = path ? `${path}/${name}` : name;
    await api.folders.create(spaceId, folderPath);
    setCreatingFolder(false);
    setNewFolderName('');
    load();
  };

  const handleDeleteFolder = async (folderPath: string, folderName: string) => {
    if (!confirm(`Delete folder "${folderName}" and all its contents?`)) return;
    await api.folders.delete(spaceId, folderPath);
    load();
  };

  const handleRenameFolder = async (folderPath: string, newName: string) => {
    await api.folders.rename(spaceId, folderPath, newName);
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

  const handleDeleteDoc = async (docSlug: string, docTitle: string) => {
    if (!confirm(`Delete document "${docTitle}"?`)) return;
    await api.documents.delete(spaceId, docSlug);
    load();
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 3, sm: 5, md: 8 }, pt: '80px', pb: 10 }}>

      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 3 }}>
        {crumbs.map((crumb, i) => {
          const isCurrentFolder = i === crumbs.length - 1 && i > 0;
          return isCurrentFolder ? (
            <Typography key={crumb.href} variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
              {crumb.label}
            </Typography>
          ) : (
            <Link
              key={crumb.href}
              component={NextLink}
              href={crumb.href}
              underline="hover"
              color="text.secondary"
              variant="body2"
            >
              {crumb.label}
            </Link>
          );
        })}
      </Breadcrumbs>

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Button
          size="small"
          startIcon={<NoteAddOutlinedIcon />}
          onClick={() => { setCreatingDoc(true); setNewDocSlug(''); setNewDocTitle(''); setDocError(null); }}
          sx={{ color: 'text.secondary', textTransform: 'none' }}
        >
          New document
        </Button>
        <Button
          size="small"
          startIcon={<CreateNewFolderOutlinedIcon />}
          onClick={() => { setCreatingFolder(true); setNewFolderName(''); }}
          sx={{ color: 'text.secondary', textTransform: 'none' }}
        >
          New folder
        </Button>
      </Box>

      <Divider sx={{ mb: 0.5 }} />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!loading && nodes === null && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          Folder not found.
        </Typography>
      )}

      {!loading && nodes !== null && (
        <Box>
          {nodes.length === 0 && !creatingFolder && (
            <Typography variant="body2" color="text.disabled" sx={{ py: 4, textAlign: 'center' }}>
              This folder is empty.
            </Typography>
          )}

          {nodes.map(node =>
            node.type === 'folder' ? (
              <FolderRow
                key={node.path}
                node={node}
                spaceId={spaceId}
                onDelete={() => handleDeleteFolder(node.path, node.name)}
                onRename={(newName) => handleRenameFolder(node.path, newName)}
              />
            ) : (
              <DocumentRow
                key={node.path}
                node={node}
                spaceId={spaceId}
                onDelete={() => handleDeleteDoc(node.path, node.title || node.name)}
              />
            )
          )}

          {/* Inline new-document input */}
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
                error={!!docError}
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

          {/* Inline new-folder input */}
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
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------

interface FolderRowProps {
  node: TreeNode;
  spaceId: string;
  onDelete: () => void;
  onRename: (newName: string) => void;
}

function FolderRow({ node, spaceId, onDelete, onRename }: FolderRowProps) {
  const [hovered, setHovered] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);

  const submitRename = () => {
    const name = newName.trim();
    if (!name || name === node.name) { setRenaming(false); setNewName(node.name); return; }
    onRename(name);
    setRenaming(false);
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1,
        borderRadius: 1,
        cursor: renaming ? 'default' : 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
        '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
      }}
    >
      <FolderOutlinedIcon sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0 }} />

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
          <IconButton size="small" onClick={submitRename}><CheckIcon sx={{ fontSize: 16 }} /></IconButton>
          <IconButton size="small" onClick={() => { setRenaming(false); setNewName(node.name); }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </>
      ) : (
        <>
          <Typography
            variant="body2"
            sx={{ flex: 1, fontWeight: 500 }}
            component={NextLink}
            href={`/spaces/${spaceId}/${node.path}`}
            onClick={e => e.stopPropagation()}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {node.name}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.5, visibility: hovered ? 'visible' : 'hidden' }}>
            <Tooltip title="Rename">
              <IconButton
                size="small"
                onClick={e => { e.stopPropagation(); setRenaming(true); }}
                sx={{ color: 'text.disabled' }}
              >
                <DriveFileRenameOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={e => { e.stopPropagation(); onDelete(); }} sx={{ color: 'text.disabled' }}>
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------

function DocumentRow({ node, spaceId, onDelete }: { node: TreeNode; spaceId: string; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
        '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
      }}
    >
      <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0 }} />
      <Typography
        variant="body2"
        component={NextLink}
        href={`/spaces/${spaceId}/${node.path}`}
        style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}
      >
        {node.title || node.name}
      </Typography>
      <Box sx={{ visibility: hovered ? 'visible' : 'hidden' }}>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={e => { e.stopPropagation(); onDelete(); }} sx={{ color: 'text.disabled' }}>
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
