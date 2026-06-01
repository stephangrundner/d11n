'use client';
import { useState, useEffect, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import ImageIcon from '@mui/icons-material/Image';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { DiagramDialog } from './DiagramDialog';
import { API_BASE } from '@/lib/api';
import { stripLightDark } from './svgUtils';
import { useDocumentContext } from '@/contexts/DocumentContext';

export function DiagramView({ node, updateAttributes, selected }: NodeViewProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const params = useParams();
  const spaceId = (params?.spaceId as string) ?? '';
  const { isEditing } = useDocumentContext();

  const { src, alt } = node.attrs as { src: string | null; alt: string };

  const proxySrc = src?.startsWith(API_BASE)
    ? src.slice(API_BASE.length)
    : (src ?? null);

  useEffect(() => {
    if (!proxySrc) { setPreviewUrl(null); return; }
    let cancelled = false;
    fetch(proxySrc, { cache: 'no-store' })
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
      .catch(() => { if (!cancelled) setPreviewUrl(proxySrc); });
    return () => {
      cancelled = true;
      if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    };
  }, [src]);

  const filename = proxySrc
    ? proxySrc.replace(`/api/spaces/${spaceId}/assets/`, '')
    : '';

  const handleClick = () => {
    if (isEditing) setEditDialogOpen(true);
    else if (previewUrl) setLightboxOpen(true);
  };

  return (
    <NodeViewWrapper as="div">
      <Box
        onClick={handleClick}
        sx={{
          cursor: isEditing ? 'pointer' : (previewUrl ? 'zoom-in' : 'default'),
          border: '2px solid',
          borderColor: selected ? 'primary.main' : 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          display: 'block',
          width: '100%',
          my: 1,
          transition: 'border-color 120ms',
          '&:hover': { borderColor: isEditing || previewUrl ? 'primary.light' : 'divider' },
        }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={alt || 'diagram'}
            style={{ display: 'block', width: '100%', height: 'auto', backgroundColor: '#ffffff' }}
            draggable={false}
          />
        ) : (
          isEditing && (
            <Box sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 1, p: 4,
              color: 'text.disabled', userSelect: 'none', minWidth: 200,
            }}>
              <ImageIcon sx={{ fontSize: 40, opacity: 0.4 }} />
              <Typography variant="body2">Click to create diagram</Typography>
            </Box>
          )
        )}
      </Box>

      {/* Lightbox with zoom/pan — view mode only */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        fullScreen
        slotProps={{ paper: { sx: { bgcolor: '#ffffff' } } }}
      >
        {/* Close */}
        <IconButton
          size="small"
          onClick={() => setLightboxOpen(false)}
          sx={{
            position: 'absolute', top: 12, right: 12, zIndex: 10,
            bgcolor: 'rgba(0,0,0,0.06)', '&:hover': { bgcolor: 'rgba(0,0,0,0.12)' },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>

        {/* Padded area — position:relative so controls can anchor to it */}
        <Box sx={{ height: '100%', p: 6, boxSizing: 'border-box', position: 'relative' }}>
          <TransformWrapper
            initialScale={1}
            minScale={0.1}
            maxScale={10}
            centerOnInit
            limitToBounds={false}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl ?? ''}
                    alt={alt || 'diagram'}
                    style={{
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      backgroundColor: '#ffffff',
                      userSelect: 'none',
                    }}
                    draggable={false}
                  />
                </TransformComponent>

                {/* Zoom controls — floating pill, centered at bottom of padded area */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,0,0,0.09)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    px: 0.5,
                    py: 0.25,
                    gap: 0.25,
                  }}
                >
                  <Tooltip title="Zoom out" placement="top" arrow>
                    <IconButton size="small" onClick={() => zoomOut()}>
                      <ZoomOutIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Fit to screen" placement="top" arrow>
                    <IconButton size="small" onClick={() => resetTransform()}>
                      <FitScreenIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Zoom in" placement="top" arrow>
                    <IconButton size="small" onClick={() => zoomIn()}>
                      <ZoomInIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </>
            )}
          </TransformWrapper>
        </Box>
      </Dialog>

      {/* Edit dialog — edit mode only */}
      {editDialogOpen && (
        <DiagramDialog
          spaceId={spaceId}
          filename={filename}
          src={src}
          onSave={(newSrc) => {
            updateAttributes({ src: newSrc });
            setEditDialogOpen(false);
          }}
          onClose={() => setEditDialogOpen(false)}
        />
      )}
    </NodeViewWrapper>
  );
}
