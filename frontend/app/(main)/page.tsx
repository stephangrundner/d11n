'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { SpacePickerDialog } from '@/components/SpacePickerDialog';

export default function HomePage() {
  const [open, setOpen] = useState(false);

  // Auto-open the picker on the home screen
  useEffect(() => { setOpen(true); }, []);

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          color: 'text.disabled',
          userSelect: 'none',
        }}
      >
        <FolderOutlinedIcon sx={{ fontSize: 48, opacity: 0.3 }} />
        <Typography variant="body2" color="text.disabled">
          Open a document to get started
        </Typography>
      </Box>

      <SpacePickerDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
