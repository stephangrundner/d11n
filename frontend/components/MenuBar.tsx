'use client';
import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import { useDocumentContext } from '@/contexts/DocumentContext';
// useDocumentContext reads from DocumentStateContext, which is provided by
// DocumentContextProvider in the layout — above both MenuBar and page content.
import { getClientToken, getUsernameFromToken } from '@/lib/auth';
import { AccountDialog } from './AccountDialog';
import { SpacePickerDialog } from './SpacePickerDialog';

export function MenuBar() {
  const doc = useDocumentContext();
  const hasDoc = !!doc.spaceId && !!doc.slug;

  const [spacePickerOpen, setSpacePickerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = getClientToken();
    if (token) setUsername(getUsernameFromToken(token));
  }, []);

  const initials = username ? username.slice(0, 2).toUpperCase() : '?';

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          px: 1,
          py: 0.625,
          maxWidth: 720,
          width: 'calc(100% - 32px)',
          bgcolor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          border: '1px solid rgba(0,0,0,0.09)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Space picker */}
        <Tooltip title="Open / switch document" placement="bottom" arrow>
          <IconButton
            size="small"
            onClick={() => setSpacePickerOpen(true)}
            sx={{ color: 'primary.main', bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}
          >
            <FolderOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.75 }} />

        {/* Save */}
        <Tooltip
          title={!hasDoc ? 'No document open' : doc.isDirty ? 'Save (⌘S)' : 'Already saved'}
          placement="bottom"
          arrow
        >
          <span>
            <IconButton
              size="small"
              disabled={!hasDoc || !doc.isDirty}
              onClick={doc.onSave}
              sx={{ '&:not(:disabled)': { color: 'text.primary' } }}
            >
              {doc.saving
                ? <CircularProgress size={16} color="inherit" />
                : <CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </span>
        </Tooltip>

        {/* History */}
        <Tooltip
          title={!hasDoc ? 'No document open' : 'History'}
          placement="bottom"
          arrow
        >
          <span>
            <IconButton
              size="small"
              disabled={!hasDoc}
              onClick={doc.onOpenHistory}
              sx={{ '&:not(:disabled)': { color: 'text.primary' } }}
            >
              <HistoryOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>

        <Box sx={{ flex: 1, minWidth: 24 }} />

        {/* Account */}
        <Tooltip title={username ?? 'Account'} placement="bottom" arrow>
          <IconButton size="small" onClick={() => setAccountOpen(true)} sx={{ p: 0.375 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: 'primary.main',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      <SpacePickerDialog open={spacePickerOpen} onClose={() => setSpacePickerOpen(false)} />
      <AccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} username={username} />
    </>
  );
}
