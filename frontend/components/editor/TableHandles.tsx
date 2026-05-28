'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type Editor } from '@tiptap/react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Gap between table edge and handle, thickness of the handle bar
const GAP = 4;
const THICKNESS = 10;

interface HandlePos { top: number; left: number; width: number; height: number }
interface ContextMenuState { anchor: { top: number; left: number }; kind: 'row' | 'col' }

function colIndexOf(cell: HTMLElement): number {
  let idx = 0, s = cell.previousElementSibling;
  while (s) { idx++; s = s.previousElementSibling; }
  return idx;
}

function firstCellInCol(table: HTMLElement, colIdx: number): HTMLElement | null {
  return (table.querySelector('tr')?.querySelectorAll('td,th')[colIdx] as HTMLElement) ?? null;
}

function focusCell(editor: Editor, cell: HTMLElement) {
  try {
    const pos = editor.view.posAtDOM(cell, 0);
    editor.chain().focus().setTextSelection(pos + 1).run();
  } catch { /* cell removed */ }
}

function probeCell(x: number, y: number, editor: Editor): HTMLElement | null {
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  const cell = el?.closest('td,th') as HTMLElement | null;
  return cell && editor.view.dom.contains(cell) ? cell : null;
}

interface Props { editor: Editor }

export function TableHandles({ editor }: Props) {
  const [rowHandle, setRowHandle] = useState<HandlePos | null>(null);
  const [colHandle, setColHandle] = useState<HandlePos | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const activeCellRef = useRef<HTMLElement | null>(null);
  const activeTableRef = useRef<HTMLElement | null>(null);

  const buildRowHandle = useCallback((cell: HTMLElement): HandlePos | null => {
    const row = cell.closest('tr') as HTMLElement | null;
    if (!row) return null;
    const r = row.getBoundingClientRect();
    return { top: r.top, left: r.left - THICKNESS - GAP, width: THICKNESS, height: r.height };
  }, []);

  const buildColHandle = useCallback((cell: HTMLElement): HandlePos | null => {
    const table = cell.closest('table') as HTMLElement | null;
    if (!table) return null;
    const top = firstCellInCol(table, colIndexOf(cell)) ?? cell;
    const tr = top.getBoundingClientRect();
    const cr = cell.getBoundingClientRect();
    return { top: tr.top - THICKNESS - GAP, left: cr.left, width: cr.width, height: THICKNESS };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (contextMenu) return;
      const { clientX: x, clientY: y } = e;

      // — Direct hit: cursor is over a cell inside the editor
      const direct = probeCell(x, y, editor);
      if (direct) {
        activeCellRef.current = direct;
        activeTableRef.current = direct.closest('table') as HTMLElement | null;
        setRowHandle(buildRowHandle(direct));
        setColHandle(buildColHandle(direct));
        return;
      }

      const table = activeTableRef.current;
      if (!table || !editor.view.dom.contains(table)) {
        setRowHandle(null); setColHandle(null);
        activeCellRef.current = null; activeTableRef.current = null;
        return;
      }

      const tr = table.getBoundingClientRect();

      // — Row-handle zone: left strip beside the table
      const inRowZone =
        x >= tr.left - THICKNESS - GAP && x < tr.left + 2 &&
        y >= tr.top && y <= tr.bottom;

      if (inRowZone) {
        // Probe horizontally into the table to find which row we're beside
        const cell = probeCell(tr.left + 2, y, editor);
        if (cell) {
          activeCellRef.current = cell;
          setRowHandle(buildRowHandle(cell));
          // Keep col handle pointing at same column
          setColHandle(buildColHandle(cell));
        }
        return;
      }

      // — Col-handle zone: top strip above the table
      const inColZone =
        y >= tr.top - THICKNESS - GAP && y < tr.top + 2 &&
        x >= tr.left && x <= tr.right;

      if (inColZone) {
        // Probe downward into the table to find which column we're above
        const cell = probeCell(x, tr.top + 2, editor);
        if (cell) {
          activeCellRef.current = cell;
          setColHandle(buildColHandle(cell));
          setRowHandle(buildRowHandle(cell));
        }
        return;
      }

      // — Outside all zones: hide
      activeCellRef.current = null;
      activeTableRef.current = null;
      setRowHandle(null);
      setColHandle(null);
    };

    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, [editor, buildRowHandle, buildColHandle, contextMenu]);

  // Reposition on scroll / resize
  useEffect(() => {
    const reposition = () => {
      const cell = activeCellRef.current;
      if (cell) { setRowHandle(buildRowHandle(cell)); setColHandle(buildColHandle(cell)); }
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => { window.removeEventListener('scroll', reposition, true); window.removeEventListener('resize', reposition); };
  }, [buildRowHandle, buildColHandle]);

  const openMenu = (kind: 'row' | 'col', x: number, y: number) => {
    const cell = activeCellRef.current;
    if (cell) focusCell(editor, cell);
    setContextMenu({ kind, anchor: { top: y, left: x } });
  };
  const closeMenu = () => setContextMenu(null);
  const run = (cmd: () => void) => { cmd(); closeMenu(); };

  if (typeof document === 'undefined') return null;

  const sx = {
    position: 'fixed' as const,
    zIndex: 9990,
    cursor: 'pointer',
    bgcolor: 'action.selected',
    border: '1px solid',
    borderColor: 'divider',
    transition: 'background-color 80ms',
    '&:hover': { bgcolor: 'primary.main', borderColor: 'primary.main' },
  };

  return createPortal(
    <>
      {rowHandle && (
        <Box sx={{ ...sx, ...rowHandle, borderRadius: '3px 0 0 3px' }}
          onClick={e => openMenu('row', e.clientX, e.clientY)} />
      )}
      {colHandle && (
        <Box sx={{ ...sx, ...colHandle, borderRadius: '3px 3px 0 0' }}
          onClick={e => openMenu('col', e.clientX, e.clientY)} />
      )}

      <Menu open={Boolean(contextMenu)} onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu?.anchor ?? { top: 0, left: 0 }}
        slotProps={{ paper: { elevation: 3, sx: { minWidth: 200, borderRadius: 2 } } }}
      >
        {contextMenu?.kind === 'row' ? [
          <MenuItem key="above" dense onClick={() => run(() => editor.chain().focus().addRowBefore().run())}>
            <ListItemIcon><KeyboardArrowUpIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Insert row above</ListItemText>
          </MenuItem>,
          <MenuItem key="below" dense onClick={() => run(() => editor.chain().focus().addRowAfter().run())}>
            <ListItemIcon><KeyboardArrowDownIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Insert row below</ListItemText>
          </MenuItem>,
          <Divider key="div" />,
          <MenuItem key="del" dense onClick={() => run(() => editor.chain().focus().deleteRow().run())} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'inherit' }}><DeleteIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Delete row</ListItemText>
          </MenuItem>,
        ] : [
          <MenuItem key="before" dense onClick={() => run(() => editor.chain().focus().addColumnBefore().run())}>
            <ListItemIcon><ChevronLeftIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Insert column before</ListItemText>
          </MenuItem>,
          <MenuItem key="after" dense onClick={() => run(() => editor.chain().focus().addColumnAfter().run())}>
            <ListItemIcon><ChevronRightIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Insert column after</ListItemText>
          </MenuItem>,
          <Divider key="div" />,
          <MenuItem key="del" dense onClick={() => run(() => editor.chain().focus().deleteColumn().run())} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'inherit' }}><DeleteIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Delete column</ListItemText>
          </MenuItem>,
        ]}
      </Menu>
    </>,
    document.body,
  );
}
