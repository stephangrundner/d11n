'use client';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { api } from '@/lib/api';

const VALID_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateSpaceDialog({ open, onClose, onCreated }: Props) {
  const [spaceId, setSpaceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validationError =
    spaceId.length > 0 && !VALID_ID.test(spaceId)
      ? 'Only letters, numbers, hyphens and underscores. Must start with a letter or digit.'
      : null;

  const isValid = spaceId.length > 0 && !validationError;

  const handleClose = () => {
    if (loading) return;
    setSpaceId('');
    setServerError(null);
    onClose();
  };

  const handleCreate = async () => {
    if (!isValid) return;
    setLoading(true);
    setServerError(null);
    try {
      await api.spaces.create(spaceId);
      setSpaceId('');
      onCreated();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to create space.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Space</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A Space is a git repository that holds a set of documents. The ID becomes the directory
          name on disk and the URL path segment.
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        <TextField
          autoFocus
          fullWidth
          label="Space ID"
          placeholder="e.g. my-project"
          value={spaceId}
          onChange={e => {
            setSpaceId(e.target.value);
            setServerError(null);
          }}
          onKeyDown={e => e.key === 'Enter' && isValid && handleCreate()}
          error={!!validationError}
          helperText={
            validationError ??
            (spaceId
              ? `Will be created at ~/d11n-spaces/${spaceId}`
              : 'Letters, numbers, hyphens and underscores')
          }
          disabled={loading}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!isValid || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? 'Creating…' : 'Create Space'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
