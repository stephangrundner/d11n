'use client';
import Box from '@mui/material/Box';
import { Sidebar } from './Sidebar';

const SIDEBAR_WIDTH = 260;

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Box
        component="nav"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          bgcolor: '#f7f7f5',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Sidebar />
      </Box>

      <Box
        id="main-scroll"
        component="main"
        sx={{
          flex: 1,
          height: '100vh',
          overflow: 'auto',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
