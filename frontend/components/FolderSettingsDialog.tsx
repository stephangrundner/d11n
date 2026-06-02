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
  folderPath: string;
}

export function FolderSettingsDialog({ open, onClose, spaceId, folderPath }: Props) {
  const name = folderPath.split('/').at(-1) ?? folderPath;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <div>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600, display: 'block' }}>Folder Settings</Typography>
          <Typography variant="caption" component="span" color="text.secondary">{spaceId} / {folderPath}</Typography>
        </div>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField size="small" fullWidth label="Name" value={name} disabled />
        <TextField size="small" fullWidth label="Path" value={folderPath} disabled />
        <Typography variant="body2" color="text.secondary">
          More folder settings will be available here in a future release.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
