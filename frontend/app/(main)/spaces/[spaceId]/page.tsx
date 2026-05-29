import { SpaceBrowser } from '@/components/SpaceBrowser';

interface Props {
  params: Promise<{ spaceId: string }>;
}

export default async function SpacePage({ params }: Props) {
  const { spaceId } = await params;
  return <SpaceBrowser spaceId={spaceId} path="" />;
}
