'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { TableKit } from '@tiptap/extension-table';
import { useMemo } from 'react';
import { DiagramNode } from '@/components/editor/DiagramNode';
import { ImageNode } from '@/components/editor/ImageNode';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PublicIcon from '@mui/icons-material/Public';
import GlobalStyles from '@mui/material/GlobalStyles';
import type { Document, ShareInfo } from '@/lib/types';
import { parseFrontMatter } from '@/lib/frontMatter';

interface Props {
  doc: Document;
  share: ShareInfo;
}

export default function SharedDocumentView({ doc, share }: Props) {
  const { body } = useMemo(() => parseFrontMatter(doc.content ?? ''), [doc.content]);

  // Redirect asset URLs from the authenticated proxy to the public shared-asset endpoint
  const sharedBody = useMemo(
    () => body.replace(/\/api\/spaces\/[^/\s"')]+\/assets\//g, `/api/shared/${share.token}/assets/`),
    [body, share.token],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Markdown, TableKit.configure({ table: { resizable: false } }), DiagramNode, ImageNode],
    content: sharedBody,
    editable: false,
  });

  return (
    <>
      <GlobalStyles styles={{
        '.shared-editor .is-empty::before': { content: 'none' },
      }} />

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Shared-content banner */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
          py: 0.75, px: 2,
          bgcolor: 'action.hover',
          borderBottom: '1px solid', borderColor: 'divider',
        }}>
          <PublicIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Shared document{share.label ? ` · ${share.label}` : ''}
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 3, sm: 5, md: 8 }, pt: 6, pb: 16 }}>
          <Typography sx={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.2, mb: 4 }}>
            {doc.title}
          </Typography>

          <Box sx={{
            '& .shared-editor': { outline: 'none', fontSize: '1rem', lineHeight: 1.75, color: 'text.primary' },
            '& .shared-editor > * + *': { mt: 0.75 },
            '& .shared-editor h1': { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3, mt: 3, mb: 1 },
            '& .shared-editor h2': { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3, mt: 3, mb: 1 },
            '& .shared-editor h3': { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.3, mt: 2, mb: 0.75 },
            '& .shared-editor p': { my: 0 },
            '& .shared-editor ul, & .shared-editor ol': { pl: 3 },
            '& .shared-editor li + li': { mt: 0.25 },
            '& .shared-editor code': {
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : '#f3f3f1',
              px: '4px', py: '1px', borderRadius: '3px', fontSize: '0.875em',
            },
            '& .shared-editor pre': {
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : '#f3f3f1',
              p: 2, borderRadius: 1, overflow: 'auto',
              '& code': { bgcolor: 'transparent', p: 0, fontSize: '0.875rem' },
            },
            '& .shared-editor blockquote': {
              borderLeft: '3px solid', borderColor: 'divider', pl: 2, ml: 0, color: 'text.secondary',
            },
            '& .shared-editor hr': {
              border: 'none', borderTop: '1px solid', borderColor: 'divider', my: 3,
            },
            '& .shared-editor table': {
              borderCollapse: 'collapse', width: '100%', my: 2,
              outline: '1px solid', outlineColor: 'divider',
            },
            '& .shared-editor th, & .shared-editor td': {
              border: '1px solid', borderColor: 'divider', px: 1.5, py: 0.75, verticalAlign: 'top',
            },
            '& .shared-editor th': { fontWeight: 600, textAlign: 'left' },
          }}>
            <EditorContent editor={editor} className="shared-editor" />
          </Box>
        </Box>
      </Box>
    </>
  );
}
