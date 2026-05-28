'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { TocItem } from './useTableOfContents';

interface Props {
  items: TocItem[];
  activeId: string | null;
  onItemClick: (id: string) => void;
}

export function TableOfContents({ items, activeId, onItemClick }: Props) {
  if (items.length === 0) return null;

  return (
    <Box component="nav" aria-label="Table of contents" sx={{ userSelect: 'none' }}>
      <Typography sx={{
        display: 'block',
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'text.disabled',
        mb: 1,
      }}>
        Contents
      </Typography>
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {items.map(item => {
          const active = item.id === activeId;
          return (
            <Box
              component="li"
              key={item.id}
              onClick={() => onItemClick(item.id)}
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                cursor: 'pointer',
                mb: 0.25,
              }}
            >
              {/* Active indicator bar */}
              <Box sx={{
                width: 2,
                flexShrink: 0,
                borderRadius: 1,
                bgcolor: active ? 'primary.main' : 'transparent',
                transition: 'background-color 150ms',
                mr: 1,
              }} />
              <Typography
                variant="body2"
                sx={{
                  pl: (item.level - 1) * 1.25,
                  py: 0.35,
                  fontSize: '0.78rem',
                  lineHeight: 1.35,
                  color: active ? 'text.primary' : 'text.secondary',
                  fontWeight: active ? 500 : 400,
                  transition: 'color 150ms',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {item.text}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
