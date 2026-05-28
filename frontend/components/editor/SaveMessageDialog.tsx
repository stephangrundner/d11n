'use client';
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (commitMessage: string) => void;
  saving: boolean;
  defaultMessage: string;
}

export function SaveMessageDialog({ open, onClose, onSave, saving, defaultMessage }: Props) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) setMessage(defaultMessage);
  }, [open, defaultMessage]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save with message</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Describe what you changed. This message will appear in the document history.
        </Typography>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Commit message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
          }}
          multiline
          minRows={2}
          maxRows={6}
          disabled={saving}
          slotProps={{ htmlInput: { maxLength: 256 } }}
          helperText={`${message.length}/256`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!message.trim() || saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
