'use client';
import { useEffect, useState } from 'react';
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
import type { SpaceSettings } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  spaceId: string;
}

export function SpaceSettingsDialog({ open, onClose, spaceId }: Props) {
  const notify = useNotify();
  const [settings, setSettings] = useState<SpaceSettings>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.spaces.settings.get(spaceId)
      .then(setSettings)
      .catch(() => notify('Could not load space settings.', 'error'))
      .finally(() => setLoading(false));
  }, [open, spaceId, notify]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.spaces.settings.update(spaceId, settings);
      notify('Settings saved.', 'success');
      onClose();
    } catch {
      notify('Could not save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <div>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600, display: 'block' }}>Space Settings</Typography>
          <Typography variant="caption" component="span" color="text.secondary">{spaceId}</Typography>
        </div>
        <IconButton size="small" onClick={onClose} disabled={saving}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {loading ? (
          <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField
              size="small"
              fullWidth
              label="Name"
              value={settings.name ?? ''}
              onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
              disabled={saving}
            />
            <TextField
              size="small"
              fullWidth
              label="Description"
              value={settings.description ?? ''}
              onChange={e => setSettings(s => ({ ...s, description: e.target.value }))}
              disabled={saving}
              multiline
              rows={2}
            />
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSave}
          disabled={loading || saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
