'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

export interface HeaderAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export interface RowAction {
  tooltip: string;
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
}

interface ResourceListProps {
  loading?: boolean;
  header?: React.ReactNode;
  headerActions?: HeaderAction[];
  emptyMessage?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export function ResourceList({
  loading = false,
  header,
  headerActions = [],
  emptyMessage = 'Nothing here yet.',
  footer,
  children,
}: ResourceListProps) {
  const isEmpty = !loading && React.Children.count(children) === 0 && !footer;

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 3, sm: 5, md: 8 }, pt: '80px', pb: 10 }}>
      {header}

      {headerActions.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {headerActions.map((action, i) => (
            <Button
              key={i}
              size="small"
              startIcon={action.icon}
              onClick={action.onClick}
              sx={{ color: 'text.secondary', textTransform: 'none' }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      )}

      <Divider sx={{ mb: 0.5 }} />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {isEmpty && (
        <Typography variant="body2" color="text.disabled" sx={{ py: 4, textAlign: 'center' }}>
          {emptyMessage}
        </Typography>
      )}

      {!loading && (
        <Box>
          {children}
          {footer}
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------

interface ResourceRowProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  actions?: RowAction[];
}

export function ResourceRow({ icon, children, actions = [] }: ResourceRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
        '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
      }}
    >
      {icon}
      {children}
      {actions.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.25, visibility: hovered ? 'visible' : 'hidden' }}>
          {actions.map((action, i) => (
            <Tooltip key={i} title={action.tooltip} arrow>
              <IconButton size="small" onClick={action.onClick} sx={{ color: 'text.disabled' }}>
                {action.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      )}
    </Box>
  );
}
