import { useEffect, useRef, type ComponentType } from "react";
import {
  useCreateBlockNote,
  createReactInlineContentSpec,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteSchema, defaultInlineContentSpecs, defaultBlockSpecs, filterSuggestionItems } from "@blocknote/core";
import type { BlockNoteEditor } from "@blocknote/core";
import type { DefaultReactSuggestionItem } from "@blocknote/react";
import Box from "@mui/material/Box";
import "@blocknote/mantine/style.css";
import { DiagramBlock } from "./DiagramBlock";

// ── @-Mention inline content ───────────────────────────────────────────────

const Mention = createReactInlineContentSpec(
  {
    type: "mention" as const,
    propSchema: { user: { default: "" } },
    content: "none",
  },
  {
    render: (props) => (
      <span
        style={{
          background: "#bbdefb",
          color: "#1565c0",
          borderRadius: 4,
          padding: "2px 4px",
          fontWeight: 500,
          fontSize: "inherit",
          userSelect: "none",
        }}
      >
        @{props.inlineContent.props.user}
      </span>
    ),
  }
);

const schema = BlockNoteSchema.create({
  blockSpecs: { ...defaultBlockSpecs, diagram: DiagramBlock() },
  inlineContentSpecs: { ...defaultInlineContentSpecs, mention: Mention },
});

/** The BlockNote editor instance created by this component. */
export type D11nEditorInstance = BlockNoteEditor<any, any, any>;

/** A user/group candidate offered in the @-mention menu. */
export interface MentionCandidate {
  label: string;
  value: string;
}

export interface BlockEditorProps {
  /** Initial BlockNote document (top-level blocks). Loaded after mount. */
  initialContent?: unknown[];
  /** Whether the document can be edited. */
  editable: boolean;
  /** Resolves @-mention candidates for the typed query. */
  onMentionSearch?: (query: string) => Promise<MentionCandidate[]>;
  /** Receives the editor instance once ready (e.g. to read editor.document). */
  onEditorReady?: (editor: D11nEditorInstance) => void;
}

// BlockNoteView from @blocknote/mantine wraps BlockNoteViewRaw which accepts children,
// but the TypeScript types lose children through Omit<..., "theme"> + complex generics.
const BNView = BlockNoteView as ComponentType<any>;

/**
 * Presentation-only Block-Editor shell built on BlockNote: the editor view, the
 * custom @-mention inline content, an embedded draw.io diagram block, the schema,
 * and the @-/slash suggestion menus. Persistence (serialization to backend blocks)
 * and the mention data source live in the consuming application.
 * See docs/ui/block-editor.md and docs/ui/diagram-interaction.md.
 */
export function BlockEditor({ initialContent, editable, onMentionSearch, onEditorReady }: BlockEditorProps) {
  // Create the editor without initialContent — content is loaded after mount via
  // replaceBlocks. Passing initialContent causes a constructor-level validation
  // failure for certain stored block formats; programmatic loading lets us catch
  // and recover from those errors.
  const editor = useCreateBlockNote({ schema });
  const contentLoaded = useRef(false);

  useEffect(() => {
    if (contentLoaded.current) return;
    contentLoaded.current = true;
    if (!initialContent || initialContent.length === 0) return;
    try {
      editor.replaceBlocks(editor.document, initialContent as any);
    } catch (err) {
      console.warn("BlockEditor: could not restore stored content, starting with empty editor.", err);
    }
  });

  useEffect(() => {
    onEditorReady?.(editor as unknown as D11nEditorInstance);
  }, [editor, onEditorReady]);

  return (
    <Box
      sx={{
        // Match the page background: no white/dark editor box, light theme only.
        "--bn-colors-editor-background": "transparent",
        "& .bn-editor": { backgroundColor: "transparent", paddingInline: 0 },
      }}
    >
      <BNView editor={editor} editable={editable} theme="light" slashMenu={false}>
        {/* Slash menu: defaults + draw.io diagram */}
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query: string) =>
            filterSuggestionItems(
              [
                ...getDefaultReactSlashMenuItems(editor),
                {
                  title: "draw.io-Diagramm",
                  subtext: "Diagramm einbetten und vollintegriert bearbeiten",
                  aliases: ["diagram", "diagramm", "drawio", "draw.io"],
                  group: "Medien",
                  onItemClick: () => {
                    const current = editor.getTextCursorPosition().block;
                    editor.insertBlocks([{ type: "diagram" } as any], current, "after");
                  },
                } as DefaultReactSuggestionItem,
              ],
              query
            )
          }
        />
        {/* @-mention menu */}
        <SuggestionMenuController
          triggerCharacter="@"
          getItems={async (query: string): Promise<DefaultReactSuggestionItem[]> => {
            if (!query || !onMentionSearch) return [];
            try {
              const results = await onMentionSearch(query);
              return results.map((candidate) => ({
                title: candidate.label,
                onItemClick: () => {
                  editor.insertInlineContent([
                    { type: "mention", props: { user: candidate.value } } as any,
                    { type: "text", text: " ", styles: {} },
                  ]);
                },
              }));
            } catch {
              return [];
            }
          }}
        />
      </BNView>
    </Box>
  );
}
