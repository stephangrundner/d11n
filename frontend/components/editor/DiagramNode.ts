import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DiagramView } from './DiagramView';

export const DiagramNode = Node.create({
  name: 'diagram',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: 'diagram' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (el) => {
          const src = (el as HTMLElement).getAttribute('src') ?? '';
          if (!src.endsWith('.drawio.svg')) return false;
          return {
            src,
            alt: (el as HTMLElement).getAttribute('alt') ?? 'diagram',
          };
        },
        priority: 1000,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Strip host from backend URLs so ProseMirror's brief default render
    // uses a relative proxy path instead of hitting the backend directly.
    const src: string = HTMLAttributes.src ?? '';
    const relativeSrc = /^https?:\/\/[^/]+\/api\//.test(src)
      ? src.replace(/^https?:\/\/[^/]+/, '')
      : src;
    return ['img', mergeAttributes({ class: 'd11n-diagram' }, { ...HTMLAttributes, src: relativeSrc })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DiagramView);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: Record<string, unknown> & { write: (s: string) => void; closeBlock: (n: unknown) => void }, node: { attrs: Record<string, string | null> }) {
          state.write(`![${node.attrs.alt ?? 'diagram'}](${node.attrs.src ?? ''})`);
          state.closeBlock(node);
        },
        parse: {},
      },
    };
  },
});
