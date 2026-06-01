import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

type Params = Promise<{ token: string; filename: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { token, filename } = await params;
  const res = await fetch(
    `${BACKEND}/api/shared/${encodeURIComponent(token)}/assets/${encodeURIComponent(filename)}`,
    { cache: 'no-store' },
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
