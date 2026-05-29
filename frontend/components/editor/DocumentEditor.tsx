'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import GlobalStyles from '@mui/material/GlobalStyles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TocOutlinedIcon from '@mui/icons-material/TocOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import CodeIcon from '@mui/icons-material/Code';
import { api } from '@/lib/api';
import type { Document } from '@/lib/types';
import { parseFrontMatter, serializeFrontMatter, type FrontMatter } from '@/lib/frontMatter';
import { slashCommand } from './slashCommand';
import { BlockHandle } from './BlockHandle';
import { TableHandles } from './TableHandles';
import { DiagramNode } from './DiagramNode';
import { ImageNode } from './ImageNode';
import { useTableOfContents } from './useTableOfContents';
import { TableOfContents } from './TableOfContents';
import { HistoryPanel } from './HistoryPanel';
import { SaveMessageDialog } from './SaveMessageDialog';

interface Props {
  doc: Document;
}

const bubbleBtnSx = {
  border: 'none !important',
  borderRadius: '4px !important',
  px: 0.5,
  py: 0.25,
  color: 'inherit',
  '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.2)' },
  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
};

export function DocumentEditor({ doc }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(doc.title ?? '');
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const mountedRef = useRef(false);
  useEffect(() => { mountedRef.current = true; }, []);

  const { meta: initialMeta, body: initialBody } = useMemo(
    () => parseFrontMatter(doc.content ?? ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const frontMetaRef = useRef<FrontMatter>(initialMeta);
  const [tocVisible, setTocVisible] = useState(initialMeta.toc !== 'false');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [saveMenuAnchor, setSaveMenuAnchor] = useState<HTMLElement | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [lastCommitMessage, setLastCommitMessage] = useState('');

  // Stable references — recreating these on every render triggers TipTap's
  // compareOptions → setOptions → view.setProps chain which disrupts the
  // Suggestion plugin state mid-keystroke and closes the slash menu.
  const extensions = useMemo(() => [
    StarterKit,
    Markdown,
    TableKit.configure({ table: { resizable: false } }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') return 'Heading';
        return "Type '/' for commands…";
      },
    }),
    slashCommand,
    ImageNode,
    DiagramNode,
  ], []);

  const editorProps = useMemo(() => ({
    attributes: { class: 'd11n-editor' },
  }), []);

  const editor = useEditor({
    immediatelyRender: true,
    extensions,
    content: initialBody,
    onUpdate: () => { if (mountedRef.current) setIsDirty(true); },
    editorProps,
  });

  const { items: tocItems, activeId: tocActiveId, scrollTo: tocScrollTo } = useTableOfContents(editor ?? null);

  const handleTocToggle = useCallback(() => {
    setTocVisible(prev => {
      const next = !prev;
      frontMetaRef.current = { ...frontMetaRef.current, toc: String(next) };
      setIsDirty(true);
      return next;
    });
  }, []);

  const handleSave = useCallback(async (commitMessage?: string) => {
    if (!editor || saving) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (editor.storage as any).markdown.getMarkdown() as string;
    const content = serializeFrontMatter(frontMetaRef.current, body);
    setSaving(true);
    setSaveError(null);
    try {
      await api.documents.update(doc.spaceId, doc.slug, {
        title: title || doc.slug,
        content,
        author: doc.author ?? undefined,
        tags: doc.tags,
      }, commitMessage);
      setIsDirty(false);
      setSaveCount(n => n + 1);
      if (commitMessage) setLastCommitMessage(commitMessage);
    } catch {
      setSaveError('Save failed. Check that the backend is running.');
    } finally {
      setSaving(false);
    }
  }, [editor, title, doc, saving]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleSave]);

  const fmt = (mark: string) => editor?.isActive(mark) ?? false;

  return (
    <>
      <GlobalStyles styles={{
        /* Placeholder via CSS */
        '.d11n-editor .is-empty::before': {
          content: 'attr(data-placeholder)',
          color: 'rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          float: 'left',
          height: 0,
        },
      }} />

      {/* Slim header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        px: 3,
        py: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'background.paper',
        minHeight: 44,
      }}>
        <Breadcrumbs sx={{ flex: 1, '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}>
          <Typography variant="body2" color="text.secondary"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => router.push('/')}>
            Home
          </Typography>
          <Typography variant="body2" color="text.secondary"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => router.push(`/spaces/${doc.spaceId}`)}>
            {doc.spaceId}
          </Typography>
          <Typography variant="body2" color="text.primary">{title || doc.slug}</Typography>
        </Breadcrumbs>

        <Tooltip title={tocVisible ? 'Hide table of contents' : 'Show table of contents'}>
          <IconButton size="small" onClick={handleTocToggle} color={tocVisible ? 'primary' : 'default'}>
            <TocOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={historyOpen ? 'Hide history' : 'Show history'}>
          <IconButton size="small" onClick={() => setHistoryOpen(v => !v)} color={historyOpen ? 'primary' : 'default'}>
            <HistoryOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {saving && <CircularProgress size={14} sx={{ mr: 0.5 }} />}

        {/* Split save: quick save + dropdown for more options */}
        <Tooltip title={isDirty ? 'Save (⌘S)' : 'Saved'}>
          <span>
            <IconButton
              size="small"
              onClick={() => handleSave()}
              disabled={saving || !isDirty}
              color={isDirty ? 'primary' : 'default'}
            >
              <SaveOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="More save options">
          <span>
            <IconButton
              size="small"
              onClick={e => setSaveMenuAnchor(e.currentTarget)}
              disabled={saving || !isDirty}
              color={isDirty ? 'primary' : 'default'}
              sx={{ ml: -0.75 }}
            >
              <ArrowDropDownIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>

        <Menu
          anchorEl={saveMenuAnchor}
          open={Boolean(saveMenuAnchor)}
          onClose={() => setSaveMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { elevation: 3, sx: { minWidth: 220 } } }}
        >
          <MenuItem
            onClick={() => { setSaveMenuAnchor(null); setSaveDialogOpen(true); }}
            dense
          >
            <ListItemIcon><EditNoteIcon fontSize="small" /></ListItemIcon>
            <ListItemText
              primary="Save with message…"
              secondary="Customize the commit message"
              slotProps={{ secondary: { variant: 'caption' } }}
            />
          </MenuItem>
        </Menu>
      </Box>

      {/* Bubble menu — appears on text selection */}
      {editor && (
        <BubbleMenu
          editor={editor}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: 6,
            padding: '4px 6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <Tooltip title="Bold">
            <ToggleButton value="bold" size="small" selected={fmt('bold')}
              onChange={() => editor.chain().focus().toggleBold().run()} sx={bubbleBtnSx}>
              <FormatBoldIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Italic">
            <ToggleButton value="italic" size="small" selected={fmt('italic')}
              onChange={() => editor.chain().focus().toggleItalic().run()} sx={bubbleBtnSx}>
              <FormatItalicIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Strikethrough">
            <ToggleButton value="strike" size="small" selected={fmt('strike')}
              onChange={() => editor.chain().focus().toggleStrike().run()} sx={bubbleBtnSx}>
              <FormatStrikethroughIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Inline code">
            <ToggleButton value="code" size="small" selected={fmt('code')}
              onChange={() => editor.chain().focus().toggleCode().run()} sx={bubbleBtnSx}>
              <CodeIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
          </Tooltip>
        </BubbleMenu>
      )}

      {/* BlockHandle — drag handle + context menu, appears left of hovered block */}
      {editor && <BlockHandle editor={editor} />}

      {/* TableHandles — per-row and per-column handles with context menu */}
      {editor && <TableHandles editor={editor} />}

      {/* Three-column layout: TOC | content | spacer */}
      <Box sx={{ display: 'flex', width: '100%' }}>

        {/* TOC column — visible only when enabled and viewport is wide enough */}
        {tocVisible && (
          <Box sx={{
            display: { xs: 'none', xl: 'flex' },
            width: 220,
            flexShrink: 0,
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}>
            <Box sx={{ position: 'sticky', top: 44, pt: 5, pr: 2, width: 200 }}>
              <TableOfContents
                items={tocItems}
                activeId={tocActiveId}
                onItemClick={tocScrollTo}
              />
            </Box>
          </Box>
        )}

        {/* Editor content */}
        <Box sx={{ flex: 1, minWidth: 0, px: { xs: 3, md: 8 }, py: 5, maxWidth: 800, mx: 'auto', width: '100%' }}>
        <InputBase
          value={title}
          onChange={e => { setTitle(e.target.value); setIsDirty(true); }}
          placeholder="Untitled"
          fullWidth
          sx={{
            mb: 3,
            '& input': {
              p: 0,
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              color: 'text.primary',
              fontFamily: 'inherit',
            },
          }}
        />

        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>
            {saveError}
          </Alert>
        )}

        <Box
          sx={{
            '& .d11n-editor': {
              outline: 'none',
              minHeight: '60vh',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontSize: '1rem',
              lineHeight: 1.75,
              color: 'text.primary',
            },
            '& .d11n-editor > * + *': { mt: 0.75 },
            '& .d11n-editor h1': { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3, mt: 3, mb: 1 },
            '& .d11n-editor h2': { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3, mt: 3, mb: 1 },
            '& .d11n-editor h3': { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.3, mt: 2, mb: 0.75 },
            '& .d11n-editor p': { my: 0 },
            '& .d11n-editor ul, & .d11n-editor ol': { pl: 3 },
            '& .d11n-editor li + li': { mt: 0.25 },
            '& .d11n-editor code': {
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              bgcolor: '#f3f3f1',
              px: '4px',
              py: '1px',
              borderRadius: '3px',
              fontSize: '0.875em',
            },
            '& .d11n-editor pre': {
              bgcolor: '#f3f3f1',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              '& code': { bgcolor: 'transparent', p: 0, fontSize: '0.875rem' },
            },
            '& .d11n-editor blockquote': {
              borderLeft: '3px solid',
              borderColor: 'divider',
              pl: 2,
              ml: 0,
              color: 'text.secondary',
            },
            '& .d11n-editor hr': {
              border: 'none',
              borderTop: '1px solid',
              borderColor: 'divider',
              my: 3,
            },
            '& .d11n-editor table': {
              borderCollapse: 'collapse',
              width: '100%',
              my: 2,
              outline: '2px solid',
              outlineColor: 'text.primary',
            },
            '& .d11n-editor th, & .d11n-editor td': {
              border: '1px solid',
              borderColor: 'divider',
              px: 1.5,
              py: 0.75,
              verticalAlign: 'top',
              minWidth: 80,
              position: 'relative',
            },
            '& .d11n-editor th': {
              fontWeight: 600,
              textAlign: 'left',
            },
            '& .d11n-editor .selectedCell::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              border: '2px solid',
              borderColor: 'primary.main',
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
        </Box>

        {/* Right spacer — mirrors TOC column to keep content centered */}
        {tocVisible && (
          <Box sx={{ display: { xs: 'none', xl: 'block' }, width: 220, flexShrink: 0 }} />
        )}

      </Box>

      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        spaceId={doc.spaceId}
        slug={doc.slug}
        reloadKey={saveCount}
      />

      <SaveMessageDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={message => { setSaveDialogOpen(false); handleSave(message); }}
        saving={saving}
        defaultMessage={lastCommitMessage || `Update: ${title || doc.slug}`}
      />
    </>
  );
}