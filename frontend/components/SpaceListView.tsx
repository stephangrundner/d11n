'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { api, NetworkError } from '@/lib/api';
import type { Space } from '@/lib/types';
import { ResourceList, ResourceRow } from './ResourceList';
import type { RowAction } from './ResourceList';
import { CreateSpaceDialog } from './CreateSpaceDialog';
import { ShareDialog } from './ShareDialog';
import { ConfirmDialog } from './ConfirmDialog';

export function SpaceListView() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.spaces.list()
      .then(setSpaces)
      .catch(err => { if (!(err instanceof NetworkError)) throw err; })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <ResourceList
        loading={loading}
        header={<Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Spaces</Typography>}
        headerActions={[{
          label: 'New space',
          icon: <AddOutlinedIcon />,
          onClick: () => setCreateOpen(true),
        }]}
        emptyMessage="No spaces yet."
      >
        {spaces.map(space => (
          <SpaceRow
            key={space.id}
            space={space}
            onDelete={async () => { await api.spaces.delete(space.id); load(); }}
          />
        ))}
      </ResourceList>

      <CreateSpaceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={load}
      />
    </>
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
        message="All documents in this space will be permanently deleted."
        onConfirm={() => { setConfirmOpen(false); onDelete(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
