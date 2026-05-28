import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import Alert from '@mui/material/Alert';
import { api } from '@/lib/api.server';
import type { Space } from '@/lib/types';

export default async function HomePage() {
  let spaces: Space[] = [];
  let error: string | null = null;

  try {
    spaces = await api.spaces.list();
  } catch {
    error = 'Could not load spaces. Check that the backend is running.';
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 4, py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
        Home
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Select a space to browse its documents.
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {spaces.length === 0 && !error && (
        <Alert severity="info">
          No spaces found. Create a git repo in{' '}
          <code style={{ fontFamily: 'monospace' }}>~/d11n-spaces/</code> to get started.
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
        {spaces.map(space => (
          <NextLink key={space.id} href={`/spaces/${space.id}`} style={{ textDecoration: 'none' }}>
            <Card
              variant="outlined"
              sx={{ '&:hover': { borderColor: 'primary.main', cursor: 'pointer', bgcolor: '#fafafa' } }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FolderOutlinedIcon color="primary" />
                <Typography sx={{ fontWeight: 600 }} noWrap>
                  {space.name}
                </Typography>
              </CardContent>
            </Card>
          </NextLink>
        ))}
      </Box>
    </Box>
  );
}
