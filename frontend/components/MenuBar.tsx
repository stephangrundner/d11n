'use client';
import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import NextLink from 'next/link';
import { useDocumentContext } from '@/contexts/DocumentContext';
import { getClientToken, getUsernameFromToken } from '@/lib/auth';
import { AccountDialog } from './AccountDialog';

export function MenuBar() {
  const doc = useDocumentContext();
  const hasDoc = !!doc.spaceId && !!doc.slug;
  const lockedByOther = !doc.isEditing && !!doc.lockedBy;

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
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          border: '1px solid',
          transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease',

          // All icons inherit this color — no per-icon color overrides needed
          color: doc.isEditing ? 'primary.contrastText' : 'text.primary',

          bgcolor: doc.isEditing
            ? 'primary.main'
            : (t) => t.palette.mode === 'dark' ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.95)',

          borderColor: doc.isEditing
            ? 'primary.dark'
            : (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)',

          boxShadow: doc.isEditing
            ? '0 2px 20px rgba(13,105,213,0.35), 0 1px 4px rgba(13,105,213,0.2)'
            : '0 2px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)',

          // Disabled buttons fade gracefully on the primary background
          '& .Mui-disabled': {
            color: doc.isEditing ? 'rgba(255,255,255,0.35) !important' : undefined,
          },
        }}
      >
        {/* Home */}
        <Tooltip title="Home" placement="bottom" arrow>
          <IconButton
            size="small"
            component={NextLink}
            href="/"
            sx={doc.isEditing
              ? { color: 'inherit', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }
              : { color: 'primary.main', bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }
            }
          >
            <HomeOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 0.5,
            my: 0.75,
            borderColor: doc.isEditing ? 'rgba(255,255,255,0.25)' : 'divider',
          }}
        />

        {/* Edit / Done toggle */}
        {hasDoc && !lockedByOther && (
          <Tooltip
            title={doc.isEditing ? 'Exit edit mode' : 'Edit document'}
            placement="bottom"
            arrow
          >
            <IconButton
              size="small"
              onClick={doc.isEditing ? doc.onExitEdit : doc.onEnterEdit}
              sx={doc.isEditing
                ? { color: 'inherit', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }
                : { color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }
              }
            >
              {doc.isEditing
                ? <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                : <EditOutlinedIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
        )}

        {/* Locked-by-other indicator */}
        {hasDoc && lockedByOther && (
          <Tooltip title={`${doc.lockedBy} is currently editing`} placement="bottom" arrow>
            <Chip
              size="small"
              icon={<LockOutlinedIcon sx={{ fontSize: 13, ml: '6px !important' }} />}
              label={doc.lockedBy}
              sx={{ height: 24, fontSize: '0.7rem', color: 'text.secondary', bgcolor: 'action.hover' }}
            />
          </Tooltip>
        )}

        {/* Save */}
        <Tooltip
          title={!hasDoc || !doc.isEditing ? 'No document in edit mode' : doc.isDirty ? 'Save (⌘S)' : 'Already saved'}
          placement="bottom"
          arrow
        >
          <span>
            <IconButton
              size="small"
              disabled={!hasDoc || !doc.isEditing || !doc.isDirty}
              onClick={doc.onSave}
              sx={{ '&:not(:disabled)': { color: 'inherit' } }}
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
              sx={{ '&:not(:disabled)': { color: 'inherit' } }}
            >
              <HistoryOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>

        <Box sx={{ flex: 1, minWidth: 24 }} />

        {/* Share current document */}
        <Tooltip
          title={!hasDoc ? 'No document open' : 'Share document'}
          placement="bottom"
          arrow
        >
          <span>
            <IconButton
              size="small"
              disabled={!hasDoc}
              onClick={doc.onShare}
              sx={{ '&:not(:disabled)': { color: 'inherit' } }}
            >
              <IosShareOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{
          mx: 0.5, my: 0.75,
          borderColor: doc.isEditing ? 'rgba(255,255,255,0.25)' : 'divider',
        }} />

        {/* Account */}
        <Tooltip title={username ?? 'Account'} placement="bottom" arrow>
          <IconButton size="small" onClick={() => setAccountOpen(true)} sx={{ p: 0.375 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                // In edit mode: white avatar ring with primary text; otherwise primary bg
                bgcolor: doc.isEditing ? 'rgba(255,255,255,0.9)' : 'primary.main',
                color: doc.isEditing ? 'primary.main' : 'primary.contrastText',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                transition: 'background-color 0.25s ease, color 0.25s ease',
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      <AccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} username={username} />
    </>
  );
}
