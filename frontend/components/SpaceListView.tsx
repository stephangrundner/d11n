'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '@/lib/api';
import type { Space } from '@/lib/types';
import { ResourceList, ResourceRow } from './ResourceList';
import type { RowAction } from './ResourceList';
import { ShareDialog } from './ShareDialog';
import { ConfirmDialog } from './ConfirmDialog';

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

  const createForm = creating && (
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
        {createError && <Typography variant="caption" color="error">{createError}</Typography>}
      </Box>
      <IconButton size="small" onClick={submitCreate}><CheckIcon sx={{ fontSize: 16 }} /></IconButton>
      <IconButton size="small" onClick={() => { setCreating(false); setCreateError(null); }}>
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );

  return (
    <ResourceList
      loading={loading}
      header={<Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Spaces</Typography>}
      headerActions={[{
        label: 'New space',
        icon: <AddOutlinedIcon />,
        onClick: () => { setCreating(true); setNewId(''); setCreateError(null); },
      }]}
      emptyMessage="No spaces yet."
      footer={createForm || undefined}
    >
      {spaces.map(space => (
        <SpaceRow
          key={space.id}
          space={space}
          onDelete={async () => { await api.spaces.delete(space.id); load(); }}
        />
      ))}
    </ResourceList>
  );
}

// ---------------------------------------------------------------------------

interface SpaceRowProps {
  space: Space;
  onDelete: () => void;
}

function SpaceRow({ space, onDelete }: SpaceRowProps) {
  const router = useRouter();
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
        icon={<WorkspacesOutlinedIcon sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0 }} />}
        actions={rowActions}
      >
        <Box
          sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
          onClick={() => router.push(`/spaces/${space.id}`)}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
      </ResourceRow>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        resourceType="space"
        spaceId={space.id}
        resourcePath={null}
        resourceLabel={space.name}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete "${space.name}"?`}
        message="Alle darin enthaltenen Dokumente werden unwiderruflich gelöscht."
        onConfirm={() => { setConfirmOpen(false); onDelete(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
