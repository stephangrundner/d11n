'use client';
import { useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '@/lib/api';
import { useNotify } from '@/contexts/NotificationContext';

const VALID_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateSpaceDialog({ open, onClose, onCreated }: Props) {
  const notify = useNotify();
  const [spaceId, setSpaceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validationError =
    spaceId.length > 0 && !VALID_ID.test(spaceId)
      ? 'Only letters, numbers, hyphens and underscores. Must start with a letter or digit.'
      : null;

  const isValid = spaceId.length > 0 && !validationError;

  const handleClose = () => {
    if (loading) return;
    setSpaceId('');
    setError(null);
    onClose();
  };

  const handleCreate = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      await api.spaces.create(spaceId.trim());
      setSpaceId('');
      onCreated();
      onClose();
      notify(`Space "${spaceId.trim()}" created.`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create space.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>New Space</Typography>
        <IconButton size="small" onClick={handleClose} disabled={loading}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Space ID"
          placeholder="e.g. my-project"
          value={spaceId}
          onChange={e => { setSpaceId(e.target.value); setError(null); }}
          onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') handleClose(); }}
          error={!!(validationError ?? error)}
          helperText={validationError ?? error ?? 'Used as identifier and URL slug'}
          disabled={loading}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleCreate}
          disabled={!isValid || loading}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
