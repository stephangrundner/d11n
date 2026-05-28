import { Extension } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import { SlashMenu, type SlashCommandItem, type SlashMenuHandle } from './SlashMenu';

const ALL_COMMANDS: SlashCommandItem[] = [
  {
    title: 'Text',
    description: 'Plain paragraph',
    icon: '¶',
    command: ({ editor, range }) =>
      (editor as any).chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: 'H1',
    command: ({ editor, range }) =>
      (editor as any).chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    command: ({ editor, range }) =>
      (editor as any).chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: 'H3',
    command: ({ editor, range }) =>
      (editor as any).chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: 'Bullet List',
    description: 'Unordered list',
    icon: '•',
    command: ({ editor, range }) =>
      (editor as any).chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    description: 'Ordered list',
    icon: '1.',
    command: ({ editor, range }) =>
      (editor as any).chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: 'Code Block',
    description: 'Code with syntax highlighting',
    icon: '<>',
    command: ({ editor, range }) =>
      (editor as any).chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: 'Quote',
    description: 'Blockquote',
    icon: '"',
    command: ({ editor, range }) =>
      (editor as any).chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: 'Divider',
    description: 'Horizontal rule',
    icon: '—',
    command: ({ editor, range }) =>
      (editor as any).chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: 'Table',
    description: '3×3 table with header',
    icon: '⊞',
    command: ({ editor, range }) =>
      (editor as any).chain().focus().deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    title: 'Image',
    description: 'Bild per URL, Upload oder Zwischenablage',
    icon: '🖼',
    command: ({ editor, range }) =>
      (editor as any).chain().focus().deleteRange(range)
        .insertContent({ type: 'image', attrs: { src: null, alt: 'image' } }).run(),
  },
  {
    title: 'Diagram',
    description: 'draw.io diagram (saved as .drawio.svg)',
    icon: '◇',
    command: ({ editor, range }) =>
      (editor as any).chain().focus().deleteRange(range)
        .insertContent({ type: 'diagram', attrs: { src: null, alt: 'diagram' } }).run(),
  },
];

export const slashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashCommandItem>({
        editor: this.editor,
        char: '/',
        command: ({ editor, range, props }) => props.command({ editor, range }),
        items: ({ query }) => {
          const q = query.toLowerCase().trim();
          return q === ''
            ? ALL_COMMANDS
            : ALL_COMMANDS.filter(c => c.title.toLowerCase().includes(q));
        },
        render: () => {
          let renderer: ReactRenderer<SlashMenuHandle, any> | undefined;
          let popupEl: HTMLDivElement | undefined;

          const updatePosition = (view: any, from: number) => {
            if (!popupEl) return;
            const coords = view.coordsAtPos(from);
            popupEl.style.left = `${Math.min(coords.left, window.innerWidth - 280)}px`;
            popupEl.style.top = `${coords.bottom + 6}px`;
          };

          return {
            onStart(props) {
              renderer = new ReactRenderer(SlashMenu as any, {
                props: {
                  items: props.items,
                  command: (item: SlashCommandItem) => props.command(item),
                },
                editor: props.editor,
              });

              popupEl = document.createElement('div');
              popupEl.style.cssText =
                'position:fixed;z-index:9999;pointer-events:auto;';
              popupEl.appendChild(renderer.element);
              document.body.appendChild(popupEl);

              updatePosition(props.editor.view, props.range.from);
            },

            onUpdate(props) {
              renderer?.updateProps({
                items: props.items,
                command: (item: SlashCommandItem) => props.command(item),
              });
              updatePosition(props.editor.view, props.range.from);
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                if (popupEl) popupEl.style.display = 'none';
                return true;
              }
              return renderer?.ref?.onKeyDown(props) ?? false;
            },

            onExit() {
              renderer?.destroy();
              popupEl?.remove();
              renderer = undefined;
              popupEl = undefined;
            },
          };
        },
      }),
    ];
  },
});