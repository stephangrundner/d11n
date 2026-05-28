import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { SpaceActions } from '@/components/SpaceActions';
import { api } from '@/lib/api.server';
import type { Document, SpaceSettings } from '@/lib/types';

interface Props {
  params: Promise<{ spaceId: string }>;
}

export default async function SpacePage({ params }: Props) {
  const { spaceId } = await params;

  let documents: Document[] = [];
  let error: string | null = null;
  let settings: SpaceSettings = {};

  await Promise.allSettled([
    api.documents.list(spaceId).then(d => { documents = d; }).catch(() => {
      error = `Could not load documents for space "${spaceId}".`;
    }),
    api.spaces.settings.get(spaceId).then(s => { settings = s; }).catch(() => {}),
  ]);

  const displayName = settings.name || spaceId;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 4, py: 6 }}>

      {/* Space header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            Space
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {displayName}
          </Typography>
          {settings.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {settings.description}
            </Typography>
          )}
        </Box>

        <SpaceActions spaceId={spaceId} />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {documents.length === 0 && !error ? (
        <Alert severity="info">No documents yet.</Alert>
      ) : (
        <List disablePadding>
          {documents.map(doc => (
            <ListItem key={doc.slug} disablePadding divider>
              <NextLink
                href={`/spaces/${spaceId}/${doc.slug}`}
                style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
              >
                <ListItemButton>
                  <ListItemIcon>
                    <InsertDriveFileOutlinedIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.title || doc.slug}
                    secondary={doc.updatedAt ? `Updated ${new Date(doc.updatedAt).toLocaleDateString()}` : undefined}
                  />
                  {doc.tags?.map(tag => (
                    <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </ListItemButton>
              </NextLink>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
