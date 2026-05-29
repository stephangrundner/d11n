import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

type Params = Promise<{ spaceId: string; filename: string }>;

async function authHeaders(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get('d11n_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { spaceId, filename } = await params;
  const res = await fetch(
    `${BACKEND}/api/spaces/${spaceId}/assets/${filename}`,
    { headers: await authHeaders(), cache: 'no-store' },
  );
  if (!res.ok) return new NextResponse(null, { status: res.status });
  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('content-type') ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    },
  });
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const { spaceId, filename } = await params;
  const headers: Record<string, string> = await authHeaders();
  const ct = req.headers.get('content-type');
  if (ct) headers['Content-Type'] = ct;
  const body = await req.arrayBuffer();
  const res = await fetch(
    `${BACKEND}/api/spaces/${spaceId}/assets/${filename}`,
    { method: 'PUT', headers, body },
  );
  if (!res.ok) return new NextResponse(null, { status: res.status });
  return new NextResponse(null, { status: 200 });
}
