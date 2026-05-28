'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '@/lib/api';
import type { SpaceSettings } from '@/lib/types';

export default function SpaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const spaceId = params?.spaceId as string;

  const [settings, setSettings] = useState<SpaceSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.spaces.settings.get(spaceId)
      .then(s => setSettings(s))
      .catch(() => setSettings({}))
      .finally(() => setLoading(false));
  }, [spaceId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const saved = await api.spaces.settings.update(spaceId, settings);
      setSettings(saved);
      setSuccess(true);
    } catch (e) {
      setError('Save failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', px: 4, py: 6 }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Tooltip title={`Back to ${spaceId}`}>
          <IconButton size="small" onClick={() => router.push(`/spaces/${spaceId}`)}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {spaceId}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Settings
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Form */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600 }}>
            Name
          </Typography>
          {loading ? (
            <Skeleton variant="rounded" height={40} />
          ) : (
            <TextField
              fullWidth
              size="small"
              placeholder={spaceId}
              value={settings.name ?? ''}
              onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
            />
          )}
          <Typography variant="caption" color="text.secondary">
            Display name of this space. Leave empty to use the space ID.
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600 }}>
            Description
          </Typography>
          {loading ? (
            <Skeleton variant="rounded" height={80} />
          ) : (
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              placeholder="Short description…"
              value={settings.description ?? ''}
              onChange={e => setSettings(s => ({ ...s, description: e.target.value }))}
            />
          )}
        </Box>

        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess(false)}>Settings saved.</Alert>}

        <Box>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Save
          </Button>
        </Box>

      </Box>

      <Divider sx={{ mt: 6, mb: 2 }} />
      <Typography variant="caption" color="text.secondary">
        Settings are stored as <code>settings.yml</code> in the repository root
        and can also be edited directly in the file.
      </Typography>

    </Box>
  );
}
