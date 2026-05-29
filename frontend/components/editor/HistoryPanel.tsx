'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { api } from '@/lib/api';
import type { CommitInfo } from '@/lib/types';
import { CommitDiffDialog } from './CommitDiffDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  spaceId: string;
  slug: string;
  reloadKey?: number;
}

function getInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

type BadgeLevel = 'Minor' | 'Moderate' | 'Extensive' | 'Complete';

function changeBadge(linesAdded: number, linesRemoved: number, baseLines: number): BadgeLevel {
  const changed = linesAdded + linesRemoved;
  const pct = (changed / Math.max(baseLines, 1)) * 100;
  if (pct < 5) return 'Minor';
  if (pct < 20) return 'Moderate';
  if (pct <= 50) return 'Extensive';
  return 'Complete';
}

const BADGE_COLORS: Record<BadgeLevel, { bgcolor: string; color: string }> = {
  Minor:     { bgcolor: 'action.selected',              color: 'text.secondary' },
  Moderate:  { bgcolor: 'rgba(33,150,243,0.12)',        color: '#1976d2' },
  Extensive: { bgcolor: 'rgba(255,152,0,0.15)',         color: '#e65100' },
  Complete:  { bgcolor: 'rgba(211,47,47,0.12)',         color: '#c62828' },
};

const NAMED_GROUPS = ['Today', 'Yesterday', 'This week', 'This month'];

function groupLabel(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === today.getTime() - 86_400_000) return 'Yesterday';
  if (d.getTime() >= today.getTime() - 7 * 86_400_000) return 'This week';
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) return 'This month';
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function groupCommits(commits: CommitInfo[]): { label: string; commits: CommitInfo[] }[] {
  const map = new Map<string, CommitInfo[]>();
  for (const commit of commits) {
    const label = groupLabel(commit.timestamp);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(commit);
  }
  const named = NAMED_GROUPS.filter(l => map.has(l)).map(l => ({ label: l, commits: map.get(l)! }));
  const older = [...map.entries()]
    .filter(([l]) => !NAMED_GROUPS.includes(l))
    .sort((a, b) => new Date(b[1][0].timestamp).getTime() - new Date(a[1][0].timestamp).getTime())
    .map(([l, c]) => ({ label: l, commits: c }));
  return [...named, ...older];
}

export function HistoryPanel({ open, onClose, spaceId, slug, reloadKey }: Props) {
  const [commits, setCommits] = useState<CommitInfo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<CommitInfo | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    api.documents.history(spaceId, slug)
      .then(setCommits)
      .catch(() => setError('Could not load history.'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, spaceId, slug, reloadKey]);

  const groups = commits ? groupCommits(commits) : [];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { maxHeight: '80vh', borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
          <Typography component="span" sx={{ flex: 1, fontWeight: 600, fontSize: '1rem' }}>
            Change history
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
          {commits && commits.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
              No changes found.
            </Typography>
          )}
          {groups.map(group => (
            <Accordion
              key={group.label}
              defaultExpanded={NAMED_GROUPS.includes(group.label)}
              disableGutters
              elevation={0}
              sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon fontSize="small" />}
                sx={{ px: 2.5, minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.75 } }}
              >
                <Typography variant="caption" sx={{
                  fontWeight: 600, color: 'text.secondary',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {group.label}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {group.commits.map(commit => (
                  <CommitItem key={commit.hash} commit={commit} onClick={() => setSelectedCommit(commit)} />
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
      </Dialog>

      {selectedCommit && (
        <CommitDiffDialog
          open={!!selectedCommit}
          onClose={() => setSelectedCommit(null)}
          commit={selectedCommit}
          spaceId={spaceId}
          slug={slug}
        />
      )}
    </>
  );
}

function CommitItem({ commit, onClick }: { commit: CommitInfo; onClick: () => void }) {
  const badge = changeBadge(commit.linesAdded, commit.linesRemoved, commit.baseLines);
  const badgeColors = BADGE_COLORS[badge];

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        gap: 1.5,
        px: 2,
        py: 1.5,
        alignItems: 'flex-start',
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
        '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
      }}
    >
      <Tooltip title={commit.author}>
        <Avatar sx={{ width: 30, height: 30, fontSize: '0.7rem', flexShrink: 0, bgcolor: 'primary.main', mt: 0.25 }}>
          {getInitials(commit.author)}
        </Avatar>
      </Tooltip>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Author + badge row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {commit.author}
          </Typography>
          <Chip
            label={badge}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 600,
              flexShrink: 0,
              bgcolor: badgeColors.bgcolor,
              color: badgeColors.color,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Box>

        {/* Date */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {formatDate(commit.timestamp)}
        </Typography>

        {/* Line change stats */}
        <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#2ea043', fontFamily: 'monospace' }}>
            +{commit.linesAdded}
          </Typography>
          <Typography variant="caption" sx={{ color: '#f85149', fontFamily: 'monospace' }}>
            -{commit.linesRemoved}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
