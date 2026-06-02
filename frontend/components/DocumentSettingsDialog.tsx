'use client';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  open: boolean;
  onClose: () => void;
  spaceId: string;
  slug: string;
  title: string | null;
}

export function DocumentSettingsDialog({ open, onClose, spaceId, slug, title }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <div>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600, display: 'block' }}>Document Settings</Typography>
          <Typography variant="caption" component="span" color="text.secondary">{spaceId} / {slug}</Typography>
        </div>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField size="small" fullWidth label="Title" value={title ?? ''} disabled />
        <TextField size="small" fullWidth label="Slug" value={slug} disabled />
        <Typography variant="body2" color="text.secondary">
          More document settings (author, tags, frontmatter) will be available here in a future release.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
