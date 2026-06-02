'use client';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (props: { editor: unknown; range: { from: number; to: number } }) => void;
}

export interface SlashMenuHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface Props {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export const SlashMenu = forwardRef<SlashMenuHandle, Props>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex(i => (i - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex(i => (i + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        if (items[selectedIndex]) command(items[selectedIndex]);
        return true;
      }
      return false;
    },
  }));

  return (
    <Paper
      elevation={0}
      sx={{
        width: 264,
        maxHeight: 320,
        overflow: 'auto',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'primary.dark',
        bgcolor: 'primary.main',
        boxShadow: '0 4px 24px rgba(13,105,213,0.4), 0 1px 6px rgba(13,105,213,0.25)',
        // Slim, on-brand scrollbar
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 2 },
      }}
    >
      <List dense disablePadding sx={{ py: 0.5 }}>
        {items.length === 0 ? (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
              No results
            </Typography>
          </Box>
        ) : (
          items.map((item, index) => (
            <ListItemButton
              key={item.title}
              selected={index === selectedIndex}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => command(item)}
              sx={{
                py: 0.75,
                px: 1.25,
                mx: 0.5,
                borderRadius: 1.5,
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.12)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.18)',
                  borderLeft: '2px solid rgba(255,255,255,0.9)',
                  pl: '10px',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
                },
              }}
            >
              {/* Icon badge */}
              <Box sx={{
                width: 28,
                height: 28,
                flexShrink: 0,
                mr: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'primary.contrastText',
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                lineHeight: 1,
                userSelect: 'none',
              }}>
                {item.icon}
              </Box>

              <ListItemText
                primary={item.title}
                secondary={item.description}
                slotProps={{
                  primary: {
                    sx: {
                      color: 'primary.contrastText',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      lineHeight: 1.3,
                    },
                  },
                  secondary: {
                    sx: {
                      color: 'rgba(255,255,255,0.62)',
                      fontSize: '0.75rem',
                      lineHeight: 1.3,
                    },
                  },
                }}
              />
            </ListItemButton>
          ))
        )}
      </List>
    </Paper>
  );
});

SlashMenu.displayName = 'SlashMenu';
