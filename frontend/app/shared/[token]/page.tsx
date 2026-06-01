import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { API_BASE } from '@/lib/api';
import type { ShareInfo, Document, TreeNode } from '@/lib/types';
import SharedDocumentView from './SharedDocumentView';
import SharedBrowserView from './SharedBrowserView';

async function fetchJson<T>(url: string, jwt?: string): Promise<T | null> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  try {
    const res = await fetch(url, { headers, cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SharedPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const cookieStore = await cookies();
  const jwt = cookieStore.get('d11n_token')?.value;

  const share = await fetchJson<ShareInfo>(`${API_BASE}/api/shared/${token}`);

  if (!share || share.expired) {
    return (
      <ErrorView message={share?.expired
        ? 'This share link has expired.'
        : 'This share link is invalid or no longer exists.'} />
    );
  }

  if (share.type === 'INTERNAL') {
    if (!jwt) redirect(`/login?from=/shared/${token}`);
    // Logged-in users go directly to the resource in the normal app
    const target = share.resourceType === 'space'
      ? `/spaces/${share.spaceId}`
      : `/spaces/${share.spaceId}/${share.resourcePath ?? ''}`;
    redirect(target);
  }

  // EXTERNAL — read-only viewer
  if (share.resourceType === 'document') {
    const doc = await fetchJson<Document>(`${API_BASE}/api/shared/${token}/document`);
    if (!doc) return <ErrorView message="Could not load the shared document." />;
    return <SharedDocumentView doc={doc} share={share} />;
  }

  const tree = await fetchJson<TreeNode[]>(`${API_BASE}/api/shared/${token}/tree`);
  if (!tree) return <ErrorView message="Could not load the shared content." />;
  return <SharedBrowserView tree={tree} share={share} />;
}

function ErrorView({ message }: { message: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Box sx={{ textAlign: 'center', maxWidth: 400, px: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Link unavailable</Typography>
        <Typography color="text.secondary">{message}</Typography>
      </Box>
    </Box>
  );
}
