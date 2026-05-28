'use client';
import { useState, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { api } from '@/lib/api';

export function ImageView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const spaceId = (params?.spaceId as string) ?? '';

  const { src, alt } = node.attrs as { src: string | null; alt: string };

  const uploadBlob = async (blob: Blob, filename: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.assets.upload(spaceId, filename, blob);
      updateAttributes({ src: api.assets.url(spaceId, filename), alt: filename });
      setEditing(false);
    } catch (err) {
      setError('Upload failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleUrlConfirm = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    updateAttributes({ src: trimmed, alt: 'image' });
    setEditing(false);
    setUrl('');
  };

  const handleFile = (file: File) => {
    const dot = file.name.lastIndexOf('.');
    const ext = dot >= 0
      ? file.name.slice(dot + 1)
      : (file.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'bin');
    uploadBlob(file, `image-${Date.now()}.${ext}`);
  };

  const handleClipboardPaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const ext = imageType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png';
          await uploadBlob(blob, `image-${Date.now()}.${ext}`);
          return;
        }
      }
      setError('No image found in clipboard.');
    } catch {
      setError('Clipboard access denied.');
    }
  };

  if (src && !editing) {
    return (
      <NodeViewWrapper as="div">
        <Box sx={{
          position: 'relative',
          width: '100%',
          my: 1,
          border: '2px solid',
          borderColor: selected ? 'primary.main' : 'transparent',
          borderRadius: 1,
          overflow: 'hidden',
          transition: 'border-color 120ms',
          '&:hover .img-toolbar': { opacity: 1 },
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || 'image'}
            style={{ display: 'block', width: '100%', height: 'auto' }}
            draggable={false}
          />
          <Box className="img-toolbar" sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            display: 'flex',
            gap: 0.5,
            opacity: 0,
            transition: 'opacity 120ms',
          }}>
            <IconButton size="small" onClick={() => setEditing(true)} sx={{
              bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
            }}>
              <EditIcon sx={{ fontSize: 15 }} />
            </IconButton>
            <IconButton size="small" onClick={deleteNode} sx={{
              bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
            }}>
              <DeleteForeverIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>
        </Box>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="div">
      <Box sx={{
        border: '2px dashed',
        borderColor: selected ? 'primary.main' : 'divider',
        borderRadius: 1,
        p: 2,
        my: 1,
        transition: 'border-color 120ms',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: 'text.disabled' }}>
          <ImageOutlinedIcon fontSize="small" />
          <Typography variant="body2">Add image</Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1.5, py: 0 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Image URL…"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleUrlConfirm(); }}
            disabled={loading}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleUrlConfirm}
            disabled={!url.trim() || loading}
          >
            OK
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            component="label"
            startIcon={loading ? <CircularProgress size={14} /> : <UploadFileIcon />}
            disabled={loading}
          >
            Upload
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentPasteIcon />}
            onClick={handleClipboardPaste}
            disabled={loading}
          >
            Paste from clipboard
          </Button>
          {editing && (
            <Button variant="text" size="small" onClick={() => setEditing(false)} sx={{ ml: 'auto' }}>
              Cancel
            </Button>
          )}
        </Box>
      </Box>
    </NodeViewWrapper>
  );
}
