'use client';
import { useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import { clearToken } from '@/lib/auth';
import { useThemeMode, type ThemeMode } from '@/contexts/ThemeModeContext';

interface Props {
  open: boolean;
  onClose: () => void;
  username: string | null;
}

export function AccountDialog({ open, onClose, username }: Props) {
  const router = useRouter();
  const { mode, setMode } = useThemeMode();
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

        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Appearance
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, val: ThemeMode | null) => { if (val) setMode(val); }}
            size="small"
            fullWidth
          >
            <ToggleButton value="light" sx={{ gap: 0.75, fontSize: '0.8rem' }}>
              <LightModeOutlinedIcon sx={{ fontSize: 16 }} />
              Light
            </ToggleButton>
            <ToggleButton value="system" sx={{ gap: 0.75, fontSize: '0.8rem' }}>
              <SettingsBrightnessOutlinedIcon sx={{ fontSize: 16 }} />
              System
            </ToggleButton>
            <ToggleButton value="dark" sx={{ gap: 0.75, fontSize: '0.8rem' }}>
              <DarkModeOutlinedIcon sx={{ fontSize: 16 }} />
              Dark
            </ToggleButton>
          </ToggleButtonGroup>
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
