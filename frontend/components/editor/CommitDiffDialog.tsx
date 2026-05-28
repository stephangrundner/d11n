'use client';
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { api } from '@/lib/api';
import type { CommitInfo } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  commit: CommitInfo;
  spaceId: string;
  slug: string;
}

type LineType = 'add' | 'remove' | 'hunk' | 'header' | 'context';

interface DiffLine {
  type: LineType;
  content: string;
}

function parseDiffLines(diff: string): DiffLine[] {
  return diff.split('\n').map(line => {
    if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff ') || line.startsWith('index ')) {
      return { type: 'header', content: line };
    }
    if (line.startsWith('@@')) return { type: 'hunk', content: line };
    if (line.startsWith('+')) return { type: 'add', content: line };
    if (line.startsWith('-')) return { type: 'remove', content: line };
    return { type: 'context', content: line };
  });
}

const LINE_STYLES: Record<LineType, object> = {
  add:     { bgcolor: 'rgba(46,160,67,0.15)', color: '#2ea043' },
  remove:  { bgcolor: 'rgba(248,81,73,0.15)', color: '#f85149' },
  hunk:    { bgcolor: 'rgba(121,192,255,0.1)', color: 'text.secondary', fontStyle: 'italic' },
  header:  { color: 'text.disabled' },
  context: {},
};

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function CommitDiffDialog({ open, onClose, commit, spaceId, slug }: Props) {
  const [diff, setDiff] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setDiff(null);
    api.documents.diff(spaceId, slug, commit.hash)
      .then(r => setDiff(r.diff))
      .catch(() => setError('Could not load diff.'))
      .finally(() => setLoading(false));
  }, [open, spaceId, slug, commit.hash]);

  const lines = diff ? parseDiffLines(diff) : [];
  const addCount = lines.filter(l => l.type === 'add').length;
  const removeCount = lines.filter(l => l.type === 'remove').length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
          {commit.message}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            {commit.author} · {relativeTime(commit.timestamp)}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
            {commit.hash.slice(0, 7)}
          </Typography>
          {diff && (
            <>
              <Chip label={`+${addCount}`} size="small" sx={{ bgcolor: 'rgba(46,160,67,0.15)', color: '#2ea043', height: 20, fontSize: '0.7rem' }} />
              <Chip label={`-${removeCount}`} size="small" sx={{ bgcolor: 'rgba(248,81,73,0.15)', color: '#f85149', height: 20, fontSize: '0.7rem' }} />
            </>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, bgcolor: 'background.default' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
        {diff !== null && diff.trim() === '' && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
            No changes in this commit.
          </Typography>
        )}
        {lines.length > 0 && (
          <Box
            component="pre"
            sx={{
              m: 0,
              fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              overflow: 'auto',
            }}
          >
            {lines.map((line, i) => (
              <Box
                key={i}
                component="div"
                sx={{
                  px: 2,
                  whiteSpace: 'pre',
                  minHeight: '1.6em',
                  ...LINE_STYLES[line.type],
                }}
              >
                {line.content || ' '}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} size="small">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
