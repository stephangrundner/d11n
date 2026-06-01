'use client';
import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PublicIcon from '@mui/icons-material/Public';
import { api } from '@/lib/api';
import type { ResourceType, ShareInfo, ShareType } from '@/lib/types';
import { useNotify } from '@/contexts/NotificationContext';

interface Props {
  open: boolean;
  onClose: () => void;
  resourceType: ResourceType;
  spaceId: string;
  resourcePath: string | null;
  resourceLabel: string;
}

function shareUrl(token: string) {
  return `${window.location.origin}/shared/${token}`;
}

function formatExpiry(iso: string | null) {
  if (!iso) return 'Permanent';
  return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ShareDialog({ open, onClose, resourceType, spaceId, resourcePath, resourceLabel }: Props) {
  const notify = useNotify();
  const [shares, setShares] = useState<ShareInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newType, setNewType] = useState<ShareType>('EXTERNAL');
  const [newLabel, setNewLabel] = useState('');
  const [newExpiry, setNewExpiry] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.shares.listForResource(spaceId, resourceType, resourcePath);
      setShares(data);
    } finally {
      setLoading(false);
    }
  }, [spaceId, resourceType, resourcePath]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await api.shares.create({
        type: newType,
        resourceType,
        spaceId,
        resourcePath,
        label: newLabel.trim() || null,
        expiresAt: newExpiry ? new Date(newExpiry).toISOString() : null,
      });
      setNewLabel('');
      setNewExpiry('');
      await load();
      notify('Share link created.', 'success');
    } catch {
      notify('Could not create share link.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(shareUrl(token));
    notify('Link copied to clipboard.', 'success');
  };

  const handleRevoke = async (token: string) => {
    await api.shares.revoke(token);
    await load();
    notify('Share link revoked.', 'info');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600, display: 'block' }}>Share</Typography>
          <Typography variant="caption" component="span" color="text.secondary">{resourceLabel}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>

        {/* Existing shares */}
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={20} /></Box>}

        {!loading && shares.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            {shares.map(share => (
              <Box
                key={share.token}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  py: 1, borderBottom: '1px solid', borderColor: 'divider',
                }}
              >
                {share.type === 'EXTERNAL'
                  ? <PublicIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                  : <LockOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }} />}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {share.type === 'EXTERNAL' ? 'External (read-only)' : 'Internal (read+write)'}
                    {share.label && <Typography component="span" variant="body2" color="text.secondary"> · {share.label}</Typography>}
                  </Typography>
                  <Typography variant="caption" color={share.expired ? 'error' : 'text.disabled'}>
                    {share.expired ? 'Expired' : `Expires: ${formatExpiry(share.expiresAt)}`}
                  </Typography>
                </Box>
                <Tooltip title="Copy link"><IconButton size="small" onClick={() => handleCopy(share.token)}><ContentCopyIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                <Tooltip title="Revoke"><IconButton size="small" onClick={() => handleRevoke(share.token)} sx={{ color: 'error.main' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
              </Box>
            ))}
          </Box>
        )}

        {!loading && shares.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ mb: 2, textAlign: 'center', py: 1 }}>
            No active share links.
          </Typography>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Create new share */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          New share link
        </Typography>

        <ToggleButtonGroup
          value={newType}
          exclusive
          onChange={(_, v) => { if (v) setNewType(v); }}
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="EXTERNAL" sx={{ gap: 0.75, fontSize: '0.8rem' }}>
            <PublicIcon sx={{ fontSize: 16 }} />
            External · read-only
          </ToggleButton>
          <ToggleButton value="INTERNAL" sx={{ gap: 0.75, fontSize: '0.8rem' }}>
            <LockOutlinedIcon sx={{ fontSize: 16 }} />
            Internal · read+write
          </ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Label (optional)"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            size="small"
            sx={{ flex: '1 1 160px' }}
            placeholder="e.g. For team review"
          />
          <TextField
            label="Expires (optional)"
            type="date"
            value={newExpiry}
            onChange={e => setNewExpiry(e.target.value)}
            size="small"
            sx={{ flex: '1 1 140px' }}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: new Date().toISOString().split('T')[0] } }}
          />
        </Box>

        {newType === 'EXTERNAL' && (
          <Chip
            icon={<PublicIcon sx={{ fontSize: 14 }} />}
            label="Anyone with this link can view — no login required"
            size="small"
            sx={{ mb: 2, fontSize: '0.75rem', bgcolor: 'action.hover' }}
          />
        )}
        {newType === 'INTERNAL' && (
          <Chip
            icon={<LockOutlinedIcon sx={{ fontSize: 14 }} />}
            label="Recipients must be logged in to view and edit"
            size="small"
            sx={{ mb: 2, fontSize: '0.75rem', bgcolor: 'action.hover' }}
          />
        )}

        <Button
          variant="contained"
          disableElevation
          startIcon={creating ? <CircularProgress size={14} color="inherit" /> : <LinkIcon />}
          onClick={handleCreate}
          disabled={creating}
          fullWidth
        >
          Create share link
        </Button>
      </DialogContent>
    </Dialog>
  );
}
