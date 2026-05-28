import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageView } from './ImageView';

export const ImageNode = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: 'image' },
    };
  },

  parseHTML() {
    return [{
      tag: 'img[src]',
      getAttrs: (el) => {
        const src = (el as HTMLElement).getAttribute('src') ?? '';
        if (src.endsWith('.drawio.svg')) return false;
        return { src, alt: (el as HTMLElement).getAttribute('alt') ?? 'image' };
      },
    }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes];
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write(`![${node.attrs.alt ?? 'image'}](${node.attrs.src ?? ''})`);
          state.closeBlock(node);
        },
        parse: {},
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});
