'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import { api } from '@/lib/api';
import type { Space, Document } from '@/lib/types';
import { CreateSpaceDialog } from './CreateSpaceDialog';
import { CreateDocumentDialog } from './CreateDocumentDialog';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SpacePickerDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [docs, setDocs] = useState<Map<string, Document[]>>(new Map());
  const [loadingDocs, setLoadingDocs] = useState<Set<string>>(new Set());
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [createDocTarget, setCreateDocTarget] = useState<string | null>(null);

  const loadSpaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSpaces(await api.spaces.list());
    } catch {
      setError('Could not load spaces.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadSpaces();
  }, [open, loadSpaces]);

  const toggleSpace = async (spaceId: string) => {
    const next = new Set(expanded);
    if (next.has(spaceId)) {
      next.delete(spaceId);
    } else {
      next.add(spaceId);
      if (!docs.has(spaceId)) {
        setLoadingDocs(prev => new Set(prev).add(spaceId));
        try {
          const d = await api.documents.list(spaceId);
          setDocs(prev => new Map(prev).set(spaceId, d));
        } catch {
          setDocs(prev => new Map(prev).set(spaceId, []));
        } finally {
          setLoadingDocs(prev => { const s = new Set(prev); s.delete(spaceId); return s; });
        }
      }
    }
    setExpanded(next);
  };

  const navigate = (spaceId: string, slug: string) => {
    router.push(`/spaces/${spaceId}/${slug}`);
    onClose();
  };

  const reloadSpace = async (spaceId: string) => {
    setLoadingDocs(prev => new Set(prev).add(spaceId));
    try {
      const d = await api.documents.list(spaceId);
      setDocs(prev => new Map(prev).set(spaceId, d));
    } finally {
      setLoadingDocs(prev => { const s = new Set(prev); s.delete(spaceId); return s; });
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { maxHeight: '75vh', borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
          <Typography component="span" sx={{ flex: 1, fontWeight: 600, fontSize: '1rem' }}>
            Open document
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 0, overflowY: 'auto' }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

          {!loading && spaces.length === 0 && !error && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
              No spaces yet. Create one below.
            </Typography>
          )}

          <List dense disablePadding>
            {spaces.map(space => {
              const isExpanded = expanded.has(space.id);
              const spaceDocs = docs.get(space.id) ?? [];
              const isLoadingDocs = loadingDocs.has(space.id);

              return (
                <Box key={space.id}>
                  <ListItemButton
                    onClick={() => toggleSpace(space.id)}
                    sx={{ px: 2, py: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {isExpanded
                        ? <FolderOpenOutlinedIcon fontSize="small" color="primary" />
                        : <FolderOutlinedIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={space.name}
                      slotProps={{ primary: { sx: { fontWeight: 500 } } }}
                    />
                    <Tooltip title="New document">
                      <IconButton
                        size="small"
                        onClick={e => { e.stopPropagation(); setCreateDocTarget(space.id); }}
                        sx={{ mr: 0.5, opacity: 0.5, '&:hover': { opacity: 1 } }}
                      >
                        <AddIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    {isExpanded
                      ? <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      : <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                  </ListItemButton>

                  <Collapse in={isExpanded} unmountOnExit>
                    {isLoadingDocs && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                        <CircularProgress size={16} />
                      </Box>
                    )}
                    {!isLoadingDocs && spaceDocs.length === 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ pl: 6, pb: 1, display: 'block' }}
                      >
                        No documents
                      </Typography>
                    )}
                    {spaceDocs.map(doc => (
                      <ListItemButton
                        key={doc.slug}
                        onClick={() => navigate(space.id, doc.slug)}
                        sx={{ pl: 5.5, pr: 2, py: 0.75 }}
                      >
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <InsertDriveFileOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.title || doc.slug}
                          slotProps={{ primary: { sx: { fontSize: '0.875rem' }, noWrap: true } }}
                        />
                      </ListItemButton>
                    ))}
                  </Collapse>

                  <Divider />
                </Box>
              );
            })}
          </List>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 2, py: 1.25 }}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setCreateSpaceOpen(true)}
          >
            New space
          </Button>
        </DialogActions>
      </Dialog>

      <CreateSpaceDialog
        open={createSpaceOpen}
        onClose={() => setCreateSpaceOpen(false)}
        onCreated={() => { setCreateSpaceOpen(false); loadSpaces(); }}
      />

      <CreateDocumentDialog
        open={!!createDocTarget}
        spaceId={createDocTarget ?? ''}
        onClose={() => setCreateDocTarget(null)}
        onCreated={slug => {
          const spaceId = createDocTarget!;
          setCreateDocTarget(null);
          setExpanded(prev => new Set(prev).add(spaceId));
          reloadSpace(spaceId);
          navigate(spaceId, slug);
        }}
      />
    </>
  );
}
