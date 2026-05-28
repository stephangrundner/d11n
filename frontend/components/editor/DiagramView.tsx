'use client';
import { useState, useEffect, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ImageIcon from '@mui/icons-material/Image';
import { DiagramDialog } from './DiagramDialog';
import { API_BASE } from '@/lib/api';
import { stripLightDark } from './svgUtils';

export function DiagramView({ node, updateAttributes, selected }: NodeViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const params = useParams();
  const spaceId = (params?.spaceId as string) ?? '';

  const { src, alt } = node.attrs as { src: string | null; alt: string };

  useEffect(() => {
    if (!src) { setPreviewUrl(null); return; }
    let cancelled = false;
    fetch(src, { cache: 'no-store' })
      .then(r => r.text())
      .then(text => {
        if (cancelled) return;
        const clean = stripLightDark(text);
        const blob = new Blob([clean], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = url;
        setPreviewUrl(url);
      })
      .catch(() => { if (!cancelled) setPreviewUrl(src); });
    return () => {
      cancelled = true;
      if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    };
  }, [src]);

  // Extract filename from full asset URL
  const filename = src
    ? src.replace(`${API_BASE}/api/spaces/${spaceId}/assets/`, '')
    : '';

  return (
    <NodeViewWrapper as="div">
      <Box
        onClick={() => setDialogOpen(true)}
        sx={{
          cursor: 'pointer',
          border: '2px solid',
          borderColor: selected ? 'primary.main' : 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          display: 'block',
          width: '100%',
          my: 1,
          transition: 'border-color 120ms',
          '&:hover': { borderColor: 'primary.light' },
        }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={alt || 'diagram'}
            style={{ display: 'block', width: '100%', height: 'auto' }}
            draggable={false}
          />
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            p: 4,
            color: 'text.disabled',
            userSelect: 'none',
            minWidth: 200,
          }}>
            <ImageIcon sx={{ fontSize: 40, opacity: 0.4 }} />
            <Typography variant="body2">Click to create diagram</Typography>
          </Box>
        )}
      </Box>

      {dialogOpen && (
        <DiagramDialog
          spaceId={spaceId}
          filename={filename}
          src={src}
          onSave={(newSrc) => {
            updateAttributes({ src: newSrc });
            setDialogOpen(false);
          }}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </NodeViewWrapper>
  );
}
