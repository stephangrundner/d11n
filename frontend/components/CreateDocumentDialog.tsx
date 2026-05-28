'use client';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { api } from '@/lib/api';

const VALID_SLUG = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

interface Props {
  open: boolean;
  spaceId: string;
  onClose: () => void;
  onCreated: (slug: string) => void;
}

export function CreateDocumentDialog({ open, spaceId, onClose, onCreated }: Props) {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const slugError =
    slug.length > 0 && !VALID_SLUG.test(slug)
      ? 'Only letters, numbers, hyphens and underscores. Must start with a letter or digit.'
      : null;

  const isValid = slug.length > 0 && !slugError;

  const handleClose = () => {
    if (loading) return;
    setSlug('');
    setTitle('');
    setServerError(null);
    onClose();
  };

  const handleCreate = async () => {
    if (!isValid) return;
    setLoading(true);
    setServerError(null);
    try {
      await api.documents.create(spaceId, slug, { title: title || slug });
      setSlug('');
      setTitle('');
      onCreated(slug);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to create document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Document in &ldquo;{spaceId}&rdquo;</DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        {serverError && <Alert severity="error">{serverError}</Alert>}

        <TextField
          autoFocus
          fullWidth
          label="Slug"
          placeholder="e.g. getting-started"
          value={slug}
          onChange={e => { setSlug(e.target.value); setServerError(null); }}
          onKeyDown={e => e.key === 'Enter' && isValid && !title && handleCreate()}
          error={!!slugError}
          helperText={slugError ?? 'Used in the URL and as filename on disk'}
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Title"
          placeholder="e.g. Getting Started"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && isValid && handleCreate()}
          helperText="Optional — defaults to the slug"
          disabled={loading}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!isValid || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? 'Creating…' : 'Create Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
