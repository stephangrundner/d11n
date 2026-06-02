'use client';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { useIsBackendOnline } from '@/contexts/HeartbeatContext';

export function BackendOfflineOverlay() {
  const isOnline = useIsBackendOnline();

  return (
    <Dialog
      open={!isOnline}
      maxWidth="xs"
      fullWidth
      aria-labelledby="backend-offline-title"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, py: 2 }}>
          <CircularProgress size={48} thickness={3.5} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography id="backend-offline-title" variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Connecting to server…
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The application will resume automatically once the connection is restored.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
