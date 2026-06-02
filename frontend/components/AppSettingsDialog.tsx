'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { RolesPanel } from './settings/RolesPanel';

type NavItem = { id: string; label: string; icon: React.ReactNode };

const NAV_ITEMS: NavItem[] = [
  { id: 'general', label: 'General', icon: <TuneOutlinedIcon sx={{ fontSize: 20 }} /> },
  { id: 'roles',   label: 'Roles',   icon: <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20 }} /> },
  { id: 'users',   label: 'Users',   icon: <PeopleOutlinedIcon sx={{ fontSize: 20 }} /> },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AppSettingsDialog({ open, onClose }: Props) {
  const [activeId, setActiveId] = useState('general');
  const active = NAV_ITEMS.find(n => n.id === activeId) ?? NAV_ITEMS[0];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { height: 560, borderRadius: 3, overflow: 'hidden' } } }}
    >
      <Box sx={{ display: 'flex', height: '100%' }}>

        {/* Sidebar */}
        <Box sx={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        }}>
          <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.04em', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Settings
            </Typography>
          </Box>
          <List dense disablePadding sx={{ flex: 1, px: 1 }}>
            {NAV_ITEMS.map(item => (
              <ListItemButton
                key={item.id}
                selected={item.id === activeId}
                onClick={() => setActiveId(item.id)}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.25,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { variant: 'body2', sx: { fontWeight: item.id === activeId ? 600 : 400 } } }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{active.label}</Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Panel — guarded by `open` so panels never mount while the dialog is closed/animating */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {open && activeId === 'general' && <GeneralPanel />}
            {open && activeId === 'roles'   && <RolesPanel />}
            {open && activeId === 'users'   && <UsersPanel />}
          </Box>
        </Box>

      </Box>
    </Dialog>
  );
}

function GeneralPanel() {
  return <Typography variant="body2" color="text.secondary">General settings will follow here.</Typography>;
}

function UsersPanel() {
  return <Typography variant="body2" color="text.secondary">User management will follow here.</Typography>;
}
