'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputBase from '@mui/material/InputBase';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import ToggleButton from '@mui/material/ToggleButton';
import Tooltip from '@mui/material/Tooltip';
import GlobalStyles from '@mui/material/GlobalStyles';
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
import { HistoryPanel } from './HistoryPanel';
import { SaveMessageDialog } from './SaveMessageDialog';
import { useDocumentSetter } from '@/contexts/DocumentContext';
import { useDocumentLock } from '@/hooks/useDocumentLock';
import { useNotify } from '@/contexts/NotificationContext';

interface Props {
  doc: Document;
}

interface Draft {
  title: string;
  content: object;
  savedAt: string;
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
  const [title, setTitle] = useState(doc.title ?? '');
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [lastCommitMessage, setLastCommitMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<Draft | null>(null);
  const [changeCount, setChangeCount] = useState(0);
  const mountedRef = useRef(false);
  useEffect(() => { mountedRef.current = true; }, []);

  // Track the last persisted state so we can restore it on discard
  const lastSavedContentRef = useRef<object | null>(null);
  const lastSavedTitleRef = useRef(doc.title ?? '');

  const notify = useNotify();

  const editingStorageKey = `d11n_editing`;
  const editingStorageValue = `${doc.spaceId}:${doc.slug}`;
  const draftKey = `d11n_draft:${doc.spaceId}:${doc.slug}`;

  const onLockLost = useCallback(() => {
    sessionStorage.removeItem(editingStorageKey);
    localStorage.removeItem(draftKey);
    setIsEditing(false);
    notify('Edit lock was lost — you have been switched to view mode.', 'warning');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notify]);

  const { holding, lockState, acquire, release } = useDocumentLock(doc.spaceId, doc.slug, onLockLost);

  const { meta: initialMeta, body: initialBody } = useMemo(
    () => parseFrontMatter(doc.content ?? ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const frontMetaRef = useRef<FrontMatter>(initialMeta);

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
    editable: false,
    onUpdate: () => { if (mountedRef.current) { setIsDirty(true); setChangeCount(n => n + 1); } },
    editorProps,
  });

  // Capture initial saved state once the editor is ready
  useEffect(() => {
    if (!editor || lastSavedContentRef.current !== null) return;
    lastSavedContentRef.current = editor.getJSON();
  }, [editor]);

  // Sync editor editability with isEditing state
  useEffect(() => {
    editor?.setEditable(isEditing);
  }, [editor, isEditing]);

  const handleEnterEdit = useCallback(async () => {
    const success = await acquire();
    if (success) {
      sessionStorage.setItem(editingStorageKey, editingStorageValue);
      setIsEditing(true);
      const stored = localStorage.getItem(draftKey);
      if (stored) {
        try { setPendingDraft(JSON.parse(stored)); }
        catch { localStorage.removeItem(draftKey); }
      }
    } else {
      notify(
        lockState.lockedBy
          ? `"${doc.title}" is currently being edited by ${lockState.lockedBy}.`
          : 'Could not acquire edit lock. Please try again.',
        'warning',
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acquire, lockState.lockedBy, doc.title, notify]);

  const handleExitEdit = useCallback(() => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
    } else {
      sessionStorage.removeItem(editingStorageKey);
      setIsEditing(false);
      release();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, release]);

  const handleConfirmDiscard = useCallback(() => {
    if (editor && lastSavedContentRef.current) {
      editor.commands.setContent(lastSavedContentRef.current);
    }
    setTitle(lastSavedTitleRef.current);
    setIsDirty(false);
    setIsEditing(false);
    setConfirmDiscardOpen(false);
    sessionStorage.removeItem(editingStorageKey);
    localStorage.removeItem(draftKey);
    release();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, release]);

  const handleRestoreDraft = useCallback(() => {
    if (!pendingDraft || !editor) return;
    editor.commands.setContent(pendingDraft.content);
    setTitle(pendingDraft.title);
    setIsDirty(true);
    setPendingDraft(null);
  }, [pendingDraft, editor]);

  const handleDiscardDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
    setPendingDraft(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced auto-save to localStorage — fires 2s after last content or title change
  useEffect(() => {
    if (!isEditing || !editor) return;
    const timer = setTimeout(() => {
      if (!isDirty) return;
      localStorage.setItem(draftKey, JSON.stringify({
        title,
        content: editor.getJSON(),
        savedAt: new Date().toISOString(),
      } satisfies Draft));
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeCount, title, isEditing]);

  // Re-enter edit mode automatically if this document was being edited before a page reload
  useEffect(() => {
    if (sessionStorage.getItem(editingStorageKey) === editingStorageValue) {
      handleEnterEdit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount

  const handleSave = useCallback(async (commitMessage?: string) => {
    if (!editor || saving) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (editor.storage as any).markdown.getMarkdown() as string;
    const content = serializeFrontMatter(frontMetaRef.current, body);
    setSaving(true);
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
      lastSavedContentRef.current = editor.getJSON();
      lastSavedTitleRef.current = title || doc.slug;
      localStorage.removeItem(draftKey);
      notify('Document saved.', 'success');
    } catch {
      notify('Save failed. Check that the backend is running.', 'error');
    } finally {
      setSaving(false);
    }
  }, [editor, title, doc, saving, notify]);

  // Keyboard shortcut (only active in edit mode)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isEditing) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleSave, isEditing]);

  const updateContext = useDocumentSetter();

  // Push editor state up into the layout-level context so MenuBar can read it.
  useEffect(() => {
    updateContext({
      spaceId: doc.spaceId,
      slug: doc.slug,
      title,
      isDirty,
      saving,
      reloadKey: saveCount,
      isEditing,
      lockedBy: lockState.locked && !holding ? lockState.lockedBy : null,
      onSave: () => handleSave(),
      onOpenHistory: () => setHistoryOpen(true),
      onOpenSaveDialog: () => setSaveDialogOpen(true),
      onEnterEdit: handleEnterEdit,
      onExitEdit: handleExitEdit,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateContext, doc.spaceId, doc.slug, title, isDirty, saving, saveCount,
      isEditing, lockState, holding, handleSave, handleEnterEdit, handleExitEdit]);

  // Clear context when the document unmounts
  useEffect(() => {
    return () => updateContext({ spaceId: null, slug: null, isDirty: false, saving: false, isEditing: false, lockedBy: null });
  }, [updateContext]);

  const fmt = (mark: string) => editor?.isActive(mark) ?? false;

  return (
    <>
      <GlobalStyles styles={{
        '.d11n-editor .is-empty::before': {
          content: 'attr(data-placeholder)',
          color: 'rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          float: 'left',
          height: 0,
        },
      }} />

      {/* Bubble menu — appears on text selection in edit mode */}
      {editor && isEditing && (
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

      {editor && isEditing && <BlockHandle editor={editor} />}
      {editor && isEditing && <TableHandles editor={editor} />}

      {/* Content — centered, white, full height */}
      <Box sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: '80px',
        pb: 16,
      }}>
        <Box sx={{
          maxWidth: 720,
          mx: 'auto',
          px: { xs: 3, sm: 5, md: 8 },
        }}>
          {/* Breadcrumb */}
          {(() => {
            const slugParts = doc.slug.split('/');
            const folderParts = slugParts.slice(0, -1);
            return (
              <Breadcrumbs sx={{ mb: 4 }}>
                <MuiLink component={NextLink} href={`/spaces/${doc.spaceId}`} underline="hover" color="text.disabled" variant="caption" sx={{ fontWeight: 500 }}>
                  {doc.spaceId}
                </MuiLink>
                {folderParts.map((part, i) => (
                  <MuiLink
                    key={i}
                    component={NextLink}
                    href={`/spaces/${doc.spaceId}/${slugParts.slice(0, i + 1).join('/')}`}
                    underline="hover"
                    color="text.disabled"
                    variant="caption"
                  >
                    {part}
                  </MuiLink>
                ))}
                <Typography variant="caption" color="text.secondary">
                  {title || slugParts[slugParts.length - 1]}
                </Typography>
              </Breadcrumbs>
            );
          })()}

          {/* Title */}
          <InputBase
            value={title}
            onChange={e => { setTitle(e.target.value); setIsDirty(true); }}
            placeholder="Untitled"
            fullWidth
            readOnly={!isEditing}
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
                cursor: isEditing ? 'text' : 'default',
              },
            }}
          />

          {/* Editor */}
          <Box sx={{
            '& .d11n-editor': {
              outline: 'none',
              minHeight: '60vh',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontSize: '1rem',
              lineHeight: 1.75,
              color: 'text.primary',
              cursor: isEditing ? 'text' : 'default',
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
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : '#f3f3f1',
              px: '4px',
              py: '1px',
              borderRadius: '3px',
              fontSize: '0.875em',
            },
            '& .d11n-editor pre': {
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : '#f3f3f1',
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
            '& .d11n-editor th': { fontWeight: 600, textAlign: 'left' },
            '& .d11n-editor .selectedCell::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              border: '2px solid',
              borderColor: 'primary.main',
            },
          }}>
            <EditorContent editor={editor} />
          </Box>
        </Box>
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

      {/* Draft restore dialog */}
      <Dialog open={!!pendingDraft} onClose={handleDiscardDraft} maxWidth="xs" fullWidth>
        <DialogTitle>Unsaved draft found</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDraft && (() => {
              const d = new Date(pendingDraft.savedAt);
              const isToday = d.toDateString() === new Date().toDateString();
              const time = isToday
                ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : d.toLocaleDateString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
              return `You have unsaved changes from ${time}. Would you like to restore them?`;
            })()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDiscardDraft}>Start fresh</Button>
          <Button onClick={handleRestoreDraft} variant="contained" disableElevation>
            Restore draft
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDiscardOpen} onClose={() => setConfirmDiscardOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Discard unsaved changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your changes have not been saved. If you continue, they will be lost and the last saved version will be restored.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDiscardOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDiscard} color="error" variant="contained" disableElevation>
            Discard changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
