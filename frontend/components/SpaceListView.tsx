'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import NextLink from 'next/link';
import { api } from '@/lib/api';
import type { Space } from '@/lib/types';

const VALID_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

export function SpaceListView() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newId, setNewId] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.spaces.list().then(setSpaces).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const submitCreate = async () => {
    const id = newId.trim();
    if (!VALID_ID.test(id)) {
      setCreateError('Nur Buchstaben, Zahlen, Bindestriche und Unterstriche. Muss mit Buchstabe oder Ziffer beginnen.');
      return;
    }
    try {
      await api.spaces.create(id);
      setCreating(false);
      setNewId('');
      setCreateError(null);
      load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Fehler beim Anlegen.');
    }
  };

  const handleDelete = async (space: Space) => {
    if (!confirm(`Space "${space.name}" und alle darin enthaltenen Dokumente unwiderruflich löschen?`)) return;
    await api.spaces.delete(space.id);
    load();
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 3, sm: 5, md: 8 }, pt: '80px', pb: 10 }}>

      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Spaces
      </Typography>

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Button
          size="small"
          startIcon={<AddOutlinedIcon />}
          onClick={() => { setCreating(true); setNewId(''); setCreateError(null); }}
          sx={{ color: 'text.secondary', textTransform: 'none' }}
        >
          New space
        </Button>
      </Box>

      <Divider sx={{ mb: 0.5 }} />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!loading && (
        <Box>
          {spaces.length === 0 && !creating && (
            <Typography variant="body2" color="text.disabled" sx={{ py: 4, textAlign: 'center' }}>
              No spaces yet.
            </Typography>
          )}

          {spaces.map(space => (
            <SpaceRow
              key={space.id}
              space={space}
              onDelete={() => handleDelete(space)}
              onRenamed={load}
            />
          ))}

          {/* Inline new-space input */}
          {creating && (
            <Box sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1,
              px: 1.5, py: 1, borderRadius: 1,
              border: '1px solid', borderColor: 'primary.main',
              mt: 0.5, flexWrap: 'wrap',
            }}>
              <WorkspacesOutlinedIcon sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0, mt: 0.2 }} />
              <Box sx={{ flex: 1, minWidth: 180 }}>
                <InputBase
                  autoFocus
                  value={newId}
                  onChange={e => { setNewId(e.target.value); setCreateError(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') submitCreate(); if (e.key === 'Escape') setCreating(false); }}
                  sx={{ width: '100%', fontSize: '0.875rem', '& input': { p: 0 } }}
                  placeholder="Space ID (e.g. my-project)"
                />
                {createError && (
                  <Typography variant="caption" color="error">{createError}</Typography>
                )}
              </Box>
              <IconButton size="small" onClick={submitCreate}><CheckIcon sx={{ fontSize: 16 }} /></IconButton>
              <IconButton size="small" onClick={() => { setCreating(false); setCreateError(null); }}>
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

interface SpaceRowProps {
  space: Space;
  onDelete: () => void;
  onRenamed: () => void;
}

function SpaceRow({ space, onDelete, onRenamed }: SpaceRowProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(space.name);

  const submitRename = async () => {
    const name = newName.trim();
    if (!name || name === space.name) { setRenaming(false); setNewName(space.name); return; }
    await api.spaces.settings.update(space.id, { name });
    setRenaming(false);
    onRenamed();
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1.25,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
        '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
      }}
    >
      <WorkspacesOutlinedIcon sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0 }} />

      {renaming ? (
        <>
          <InputBase
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') { setRenaming(false); setNewName(space.name); } }}
            sx={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, '& input': { p: 0 } }}
          />
          <IconButton size="small" onClick={submitRename}><CheckIcon sx={{ fontSize: 16 }} /></IconButton>
          <IconButton size="small" onClick={() => { setRenaming(false); setNewName(space.name); }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </>
      ) : (
        <>
          <Box
            sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
            onClick={() => router.push(`/spaces/${space.id}`)}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {space.name}
            </Typography>
            {space.id !== space.name && (
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                {space.id}
              </Typography>
            )}
          </Box>

          {typeof space.documentCount === 'number' && (
            <Chip
              label={`${space.documentCount} ${space.documentCount === 1 ? 'doc' : 'docs'}`}
              size="small"
              sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'action.selected', color: 'text.secondary', '& .MuiChip-label': { px: 1 } }}
            />
          )}

          <Box sx={{ display: 'flex', gap: 0.25, visibility: hovered ? 'visible' : 'hidden' }}>
            <Tooltip title="Rename">
              <IconButton size="small" sx={{ color: 'text.disabled' }} onClick={() => setRenaming(true)}>
                <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" sx={{ color: 'text.disabled' }} onClick={onDelete}>
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  );
}
