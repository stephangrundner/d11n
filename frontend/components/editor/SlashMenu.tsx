'use client';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
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
      elevation={4}
      sx={{
        width: 260,
        maxHeight: 320,
        overflow: 'auto',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <List dense disablePadding>
        {items.length === 0 ? (
          <ListItemButton disabled>
            <ListItemText primary="No results" />
          </ListItemButton>
        ) : (
          items.map((item, index) => (
            <ListItemButton
              key={item.title}
              selected={index === selectedIndex}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => command(item)}
              sx={{ py: 0.75 }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary={item.description}
              />
            </ListItemButton>
          ))
        )}
      </List>
    </Paper>
  );
});

SlashMenu.displayName = 'SlashMenu';