import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';

export interface TocItem {
  id: string;
  level: number;
  text: string;
}

const HEADER_OFFSET = 60; // px from viewport top considered "active"

export function useTableOfContents(editor: Editor | null) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Extract headings from the editor DOM after every update
  useEffect(() => {
    if (!editor) return;

    const extract = () => {
      const dom = editor.view.dom;
      const els = dom.querySelectorAll('h1,h2,h3,h4,h5,h6');
      const next: TocItem[] = [];
      els.forEach((el, i) => {
        const id = `toc-${i}`;
        el.setAttribute('data-toc-id', id);
        next.push({ id, level: parseInt(el.tagName[1]), text: el.textContent ?? '' });
      });
      setItems(next);
    };

    editor.on('update', extract);
    // Run once on mount (after editor is ready)
    const frame = requestAnimationFrame(extract);
    return () => {
      editor.off('update', extract);
      cancelAnimationFrame(frame);
    };
  }, [editor]);

  // Track active heading based on scroll position
  useEffect(() => {
    if (!editor || items.length === 0) return;
    const container = document.getElementById('main-scroll');
    if (!container) return;

    const onScroll = () => {
      const dom = editor.view.dom;
      const containerTop = container.getBoundingClientRect().top;
      let current: string | null = null;

      dom.querySelectorAll<HTMLElement>('[data-toc-id]').forEach(el => {
        const top = el.getBoundingClientRect().top - containerTop;
        if (top <= HEADER_OFFSET) current = el.getAttribute('data-toc-id');
      });

      setActiveId(current ?? items[0]?.id ?? null);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => container.removeEventListener('scroll', onScroll);
  }, [editor, items]);

  const scrollTo = (id: string) => {
    const el = editor?.view.dom.querySelector<HTMLElement>(`[data-toc-id="${id}"]`);
    if (!el) return;
    const container = document.getElementById('main-scroll');
    if (!container) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }

    const containerTop = container.getBoundingClientRect().top;
    const elTop = el.getBoundingClientRect().top - containerTop;
    container.scrollBy({ top: elTop - HEADER_OFFSET, behavior: 'smooth' });
  };

  return { items, activeId, scrollTo };
}
