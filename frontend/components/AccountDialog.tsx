'use client';
import { useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import { clearToken } from '@/lib/auth';

interface Props {
  open: boolean;
  onClose: () => void;
  username: string | null;
}

export function AccountDialog({ open, onClose, username }: Props) {
  const router = useRouter();
  const initials = username?.slice(0, 2).toUpperCase() ?? '?';

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem', fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {username ?? 'Unknown'}
          </Typography>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Sign out
        </Button>
      </DialogContent>
    </Dialog>
  );
}
