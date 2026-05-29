'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import { type Editor } from '@tiptap/react';
import { type Node } from '@tiptap/pm/model';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';

interface HoveredNode {
  node: Node | null;
  pos: number;
}

interface TurnIntoItem {
  label: string;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor, pos: number) => void;
}

const TURN_INTO: TurnIntoItem[] = [
  {
    label: 'Text',
    isActive: e => e.isActive('paragraph'),
    run: e => e.chain().focus().setParagraph().run(),
  },
  {
    label: 'Heading 1',
    isActive: e => e.isActive('heading', { level: 1 }),
    run: e => e.chain().focus().setHeading({ level: 1 }).run(),
  },
  {
    label: 'Heading 2',
    isActive: e => e.isActive('heading', { level: 2 }),
    run: e => e.chain().focus().setHeading({ level: 2 }).run(),
  },
  {
    label: 'Heading 3',
    isActive: e => e.isActive('heading', { level: 3 }),
    run: e => e.chain().focus().setHeading({ level: 3 }).run(),
  },
  {
    label: 'Bullet List',
    isActive: e => e.isActive('bulletList'),
    run: e => e.chain().focus().toggleBulletList().run(),
  },
  {
    label: 'Numbered List',
    isActive: e => e.isActive('orderedList'),
    run: e => e.chain().focus().toggleOrderedList().run(),
  },
  {
    label: 'Code Block',
    isActive: e => e.isActive('codeBlock'),
    run: e => e.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: 'Quote',
    isActive: e => e.isActive('blockquote'),
    run: e => e.chain().focus().toggleBlockquote().run(),
  },
];

interface Props {
  editor: Editor;
}

export function BlockHandle({ editor }: Props) {
  const hoveredRef = useRef<HoveredNode>({ node: null, pos: 0 });
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  // Stable refs prevent DragHandle's useEffect from re-running on every render,
  // which would cause unnecessary plugin unregister/register cycles and flushSync warnings.
  const onNodeChange = useCallback(({ node, pos }: { node: Node | null; pos: number }) => {
    hoveredRef.current = { node, pos };
  }, []);
  const dragPositionConfig = useMemo(() => ({ placement: 'left' as const }), []);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const { pos, node } = hoveredRef.current;
    // Atom nodes (tables, diagrams) have no content — skip cursor placement
    if (node && !node.isAtom) {
      editor.chain().focus().setTextSelection(pos + 1).run();
    }
    setAnchor(e.currentTarget);
  };

  // Find the actual DOM element the plugin manages (className set via DragHandle prop)
  const getHandleEl = () =>
    editor.view.dom.parentElement?.querySelector<HTMLElement>('.d11n-drag-handle') ?? null;

  const lock = () => {
    editor.view.dispatch(editor.view.state.tr.setMeta('lockDragHandle', true));
    // dispatch() runs update() synchronously → plugin sets draggable=false.
    // Re-enable immediately so the user can still drag.
    const el = getHandleEl();
    if (el) el.draggable = true;
  };

  const unlock = () =>
    editor.view.dispatch(editor.view.state.tr.setMeta('lockDragHandle', false));

  // Unlock on mousedown so the plugin's drag machinery takes over unobstructed.
  const handleMouseDown = () => unlock();

  const close = () => { unlock(); setAnchor(null); };

  const deleteBlock = () => {
    const { pos, node } = hoveredRef.current;
    if (node) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .run();
    }
    close();
  };

  return (
    <>
      <DragHandle
        editor={editor}
        className="d11n-drag-handle"
        computePositionConfig={dragPositionConfig}
        onNodeChange={onNodeChange}
      >
        {/*
          No floating-ui offset — instead the element is wider than the visible icon.
          The right portion is a transparent bridge that fills the gap to the block edge,
          so the mouse never leaves wrapper.contains() when travelling from block to icon.
        */}
        <Box
          onClick={handleClick}
          onMouseEnter={lock}
          onMouseLeave={unlock}
          onMouseDown={handleMouseDown}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: 44,
            height: 24,
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '4px',
            color: 'rgba(0,0,0,0.25)',
            flexShrink: 0,
            '&:hover': { color: 'rgba(0,0,0,0.55)', bgcolor: 'rgba(0,0,0,0.06)' },
          }}>
            <DragIndicatorIcon sx={{ fontSize: 18 }} />
          </Box>
        </Box>
      </DragHandle>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        slotProps={{ paper: { elevation: 3, sx: { minWidth: 180, borderRadius: 2 } } }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Typography variant="caption" color="text.disabled" sx={{ px: 2, pb: 0.5, display: 'block' }}>
          Turn into
        </Typography>

        {TURN_INTO.map(item => (
          <MenuItem
            key={item.label}
            selected={item.isActive(editor)}
            dense
            onClick={() => { item.run(editor, hoveredRef.current.pos); close(); }}
          >
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}

        <Divider />

        <MenuItem dense onClick={deleteBlock} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete block</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
