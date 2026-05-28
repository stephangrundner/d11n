import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { DocumentEditor } from '@/components/editor/DocumentEditor';
import { api } from '@/lib/api.server';

interface Props {
  params: Promise<{ spaceId: string; slug: string }>;
}

export default async function DocumentPage({ params }: Props) {
  const { spaceId, slug } = await params;

  let doc;
  try {
    doc = await api.documents.get(spaceId, slug);
  } catch {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 4, py: 6 }}>
        <Alert severity="error">Document not found: {slug}</Alert>
      </Box>
    );
  }

  return <DocumentEditor doc={doc} />;
}
