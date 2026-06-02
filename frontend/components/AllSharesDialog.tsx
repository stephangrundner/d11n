'use client';
import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PublicIcon from '@mui/icons-material/Public';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import { api } from '@/lib/api';
import type { ShareInfo } from '@/lib/types';
import { useNotify } from '@/contexts/NotificationContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

function shareUrl(token: string) {
  return `${window.location.origin}/shared/${token}`;
}

function formatExpiry(iso: string | null) {
  if (!iso) return 'No expiry';
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  return isToday
    ? `Expires today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : `Expires ${d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function resourceLabel(share: ShareInfo): string {
  if (share.resourceType === 'space') return share.spaceId;
  return share.resourcePath ? `${share.spaceId} / ${share.resourcePath}` : share.spaceId;
}

function ResourceIcon({ type }: { type: ShareInfo['resourceType'] }) {
  const sx = { fontSize: 16, flexShrink: 0 };
  if (type === 'space')    return <WorkspacesOutlinedIcon sx={{ ...sx, color: 'primary.main' }} />;
  if (type === 'folder')   return <FolderOutlinedIcon sx={{ ...sx, color: 'primary.main' }} />;
  return <InsertDriveFileOutlinedIcon sx={{ ...sx, color: 'text.secondary' }} />;
}

export function AllSharesDialog({ open, onClose }: Props) {
  const notify = useNotify();
  const [shares, setShares] = useState<ShareInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setShares(await api.shares.listMine());
    } catch {
      notify('Could not load shared links.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(shareUrl(token));
    notify('Link copied to clipboard.', 'success');
  };

  const handleRevoke = async (token: string) => {
    setRevokingToken(token);
    try {
      await api.shares.revoke(token);
      setShares(prev => prev.filter(s => s.token !== token));
      notify('Share link revoked.', 'info');
    } catch {
      notify('Could not revoke share link.', 'error');
    } finally {
      setRevokingToken(null);
    }
  };

  const active = shares.filter(s => !s.expired);
  const expired = shares.filter(s => s.expired);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600, display: 'block' }}>
            Shared links
          </Typography>
          <Typography variant="caption" color="text.secondary">
            All share links created by you
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && shares.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}>
            <PublicIcon sx={{ fontSize: 36, mb: 1, display: 'block', mx: 'auto', opacity: 0.4 }} />
            <Typography variant="body2">No shared links yet.</Typography>
          </Box>
        )}

        {!loading && active.length > 0 && (
          <>
            <SectionLabel label="Active" count={active.length} />
            {active.map(share => (
              <ShareRow
                key={share.token}
                share={share}
                revoking={revokingToken === share.token}
                onCopy={handleCopy}
                onRevoke={handleRevoke}
              />
            ))}
          </>
        )}

        {!loading && expired.length > 0 && (
          <>
            <SectionLabel label="Expired" count={expired.length} sx={{ mt: active.length > 0 ? 2 : 0 }} />
            {expired.map(share => (
              <ShareRow
                key={share.token}
                share={share}
                revoking={revokingToken === share.token}
                onCopy={handleCopy}
                onRevoke={handleRevoke}
              />
            ))}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ label, count, sx }: { label: string; count: number; sx?: object }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', ...sx }}
    >
      {label} · {count}
    </Typography>
  );
}

interface ShareRowProps {
  share: ShareInfo;
  revoking: boolean;
  onCopy: (token: string) => void;
  onRevoke: (token: string) => void;
}

function ShareRow({ share, revoking, onCopy, onRevoke }: ShareRowProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, py: 1, borderBottom: '1px solid', borderColor: 'divider', opacity: share.expired ? 0.55 : 1 }}>
      <Box sx={{ mt: 0.25 }}>
        <ResourceIcon type={share.resourceType} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {resourceLabel(share)}
          </Typography>
          <Chip
            size="small"
            icon={share.type === 'EXTERNAL' ? <PublicIcon sx={{ fontSize: 11 }} /> : <LockOutlinedIcon sx={{ fontSize: 11 }} />}
            label={share.type === 'EXTERNAL' ? 'Public' : 'Internal'}
            sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 } }}
          />
          {share.expired && (
            <Chip size="small" label="Expired" color="error" sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 } }} />
          )}
        </Box>
        <Typography variant="caption" color="text.disabled">
          {share.label && `${share.label} · `}{formatExpiry(share.expiresAt)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
        <Tooltip title="Copy link" placement="top">
          <IconButton size="small" onClick={() => onCopy(share.token)}>
            <ContentCopyIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Revoke" placement="top">
          <span>
            <IconButton
              size="small"
              onClick={() => onRevoke(share.token)}
              disabled={revoking}
              sx={{ color: 'error.main' }}
            >
              {revoking ? <CircularProgress size={14} color="inherit" /> : <DeleteIcon sx={{ fontSize: 15 }} />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}
