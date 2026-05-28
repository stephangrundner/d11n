'use client';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

interface Props {
  spaceId: string;
}

/**
 * Action toolbar shown in the Space page header.
 * Add new buttons here as needed.
 */
export function SpaceActions({ spaceId }: Props) {
  const router = useRouter();

  return (
    <Box sx={{ display: 'flex', gap: 0.5, pt: 0.5, flexShrink: 0 }}>
      <Tooltip title="Settings">
        <IconButton size="small" onClick={() => router.push(`/spaces/${spaceId}/settings`)}>
          <SettingsOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
