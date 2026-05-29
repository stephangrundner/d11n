import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { DocumentEditor } from '@/components/editor/DocumentEditor';
import { SpaceBrowser } from '@/components/SpaceBrowser';
import { api } from '@/lib/api.server';

interface Props {
  params: Promise<{ spaceId: string; slug: string[] }>;
}

export default async function SlugPage({ params }: Props) {
  const { spaceId, slug } = await params;
  const slugStr = Array.isArray(slug) ? slug.join('/') : slug;

  try {
    const doc = await api.documents.get(spaceId, slugStr);
    return <DocumentEditor doc={doc} />;
  } catch {
    // Not a document — render as folder browser
    return <SpaceBrowser spaceId={spaceId} path={slugStr} />;
  }
}
