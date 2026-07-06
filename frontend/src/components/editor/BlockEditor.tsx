"use client";

import { useCallback } from "react";
import { BlockEditor as UiBlockEditor } from "@d11n/ui";
import type { D11nEditorInstance, MentionCandidate } from "@d11n/ui";
import { users as usersApi } from "@/lib/api";
import type { BlockResponse, BlockRequest } from "@/lib/api";

// ── Serialization (app-owned: maps backend blocks <-> BlockNote document) ───

function backendToBlockNote(blocks: BlockResponse[]): unknown[] | null {
  if (!blocks || blocks.length === 0) return null;
  return blocks.map((b) => {
    if (b.type === "HEADING") {
      return {
        type: "heading",
        props: { level: b.headingLevel ?? 1 },
        content: b.content ? [{ type: "text", text: b.content, styles: {} }] : undefined,
      };
    }
    if (b.type === "DIAGRAM") {
      return { type: "diagram", props: { xml: b.diagramXml ?? "", svg: b.svg ?? "" } };
    }
    if (!b.content) return { type: "paragraph" };
    try {
      const parsed = JSON.parse(b.content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { type: "paragraph", content: parsed };
      }
      return { type: "paragraph" };
    } catch {
      return {
        type: "paragraph",
        content: [{ type: "text", text: b.content, styles: {} }],
      };
    }
  });
}

function blockNoteToBackend(blocks: any[]): BlockRequest[] {
  const result: BlockRequest[] = [];
  for (const block of blocks ?? []) {
    if (block.type === "heading") {
      const text = (block.content ?? [])
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text ?? "")
        .join("");
      result.push({ type: "HEADING", content: text, headingLevel: block.props?.level ?? 1 });
    } else if (block.type === "diagram") {
      // First-class DIAGRAM block: rendered SVG + editable mxfile XML.
      result.push({ type: "DIAGRAM", svg: block.props?.svg ?? "", diagramXml: block.props?.xml ?? "" });
    } else {
      result.push({ type: "TEXT", content: JSON.stringify(block.content ?? []) });
    }
    if (block.children?.length) {
      result.push(...blockNoteToBackend(block.children));
    }
  }
  return result;
}

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  blocks: BlockResponse[];
  editable: boolean;
  onEditorReady?: (getBlocks: () => BlockRequest[]) => void;
}

/** App wrapper: binds the presentation Block-Editor to backend persistence and user search. */
export function BlockEditor({ blocks, editable, onEditorReady }: Props) {
  const handleMentionSearch = useCallback(async (query: string): Promise<MentionCandidate[]> => {
    const results = await usersApi.search(query);
    return results.map((u) => ({ label: u.email, value: u.email }));
  }, []);

  const handleEditorReady = useCallback(
    (editor: D11nEditorInstance) => {
      onEditorReady?.(() => blockNoteToBackend(editor.document as any));
    },
    [onEditorReady]
  );

  return (
    <UiBlockEditor
      initialContent={backendToBlockNote(blocks) ?? undefined}
      editable={editable}
      onMentionSearch={handleMentionSearch}
      onEditorReady={handleEditorReady}
    />
  );
}
