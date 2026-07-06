// ─────────────────────────────────────────────────────────────────────────────
// MOCK / DESIGN-ONLY DATA
//
// The current backend/API does not yet expose tags, visibility, space icons,
// folder counts, members, search, groups or permissions. To match the Claude
// Design mockup, these placeholder values are merged with real API data here.
// Everything in this file is deterministic (seeded by id) and clearly isolated
// so it can be removed once the backend provides the real fields.
// ─────────────────────────────────────────────────────────────────────────────
import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { icons, type Visibility, type Member } from "@d11n/ui";
import type { SearchResultGroup, PermGroup, PermRow } from "@d11n/ui";

export interface SpaceVisual {
  icon: ComponentType<SvgIconProps>;
  color: string;
  containerColor: string;
}

const SPACE_VISUALS: SpaceVisual[] = [
  { icon: icons.ArchitectureIcon, color: "#1F5FC4", containerColor: "#E8EFFB" },
  { icon: icons.DiagramIcon, color: "#2E7D32", containerColor: "#E6F4EA" },
  { icon: icons.EventNoteIcon, color: "#C62828", containerColor: "#FDECEA" },
  { icon: icons.SpaceIcon, color: "#7E57C2", containerColor: "#EDE7F6" },
];

const TAG_POOL = [
  ["Architektur", "Planer"],
  ["Zonen", "Logik"],
  ["Termine"],
  ["Doku"],
  ["Konzept", "Entwurf"],
];

const VIS_POOL: Visibility[] = ["private", "group", "private", "inherited"];

const MEMBER_POOL: Member[][] = [
  [{ initials: "MW", color: "#7E57C2" }],
  [{ initials: "MW", color: "#7E57C2" }, { initials: "JS", color: "#0288D1" }],
  [{ initials: "MW", color: "#7E57C2" }, { initials: "JS", color: "#0288D1" }, { initials: "AK", color: "#2E7D32" }],
];

function seed(id: number, mod: number): number {
  return Math.abs(id) % mod;
}

/** Deterministic icon + colors for a space, by id. */
export function spaceVisual(id: number): SpaceVisual {
  return SPACE_VISUALS[seed(id, SPACE_VISUALS.length)];
}

/** Deterministic demo tags for an item, by id. */
export function demoTags(id: number): string[] {
  return TAG_POOL[seed(id, TAG_POOL.length)];
}

/** Deterministic demo visibility for an item, by id. */
export function demoVisibility(id: number): Visibility {
  return VIS_POOL[seed(id, VIS_POOL.length)];
}

/** Deterministic demo members for a space, by id. */
export function demoMembers(id: number): Member[] {
  return MEMBER_POOL[seed(id, MEMBER_POOL.length)];
}

/** Mock grouped search results, filtered loosely by query. */
export function mockSearchResults(query: string): SearchResultGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all: SearchResultGroup[] = [
    {
      label: "Architektur Möbelplaner",
      items: [
        { id: 1, type: "document", title: "Dokumentation Zonenlogik", snippet: "… die Zonenlogik zerlegt einen Grundriss in funktionale Bereiche …" },
        { id: 2, type: "folder", title: "Zonenlogik", snippet: "Ordner · 4 Dokumente" },
      ],
    },
    {
      label: "Treffer über Tags",
      items: [{ id: 3, type: "document", title: "Aufbau-Anleitung", tagHit: "Zonen" }],
    },
  ];
  return all
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (it) => it.title.toLowerCase().includes(q) || (it.snippet ?? "").toLowerCase().includes(q) || (it.tagHit ?? "").toLowerCase().includes(q)
      ),
    }))
    .filter((g) => g.items.length > 0);
}

/** Mock groups for the admin permissions screen. */
export const mockGroups: PermGroup[] = [
  { id: "arch", name: "Team Architektur", memberCount: 6 },
  { id: "plan", name: "Planung & Termine", memberCount: 3 },
  { id: "ext", name: "Externe Gäste", memberCount: 2, kind: "public" },
];

export const mockGroupMembers: Member[] = [
  { initials: "MW", color: "#7E57C2" },
  { initials: "JS", color: "#0288D1" },
  { initials: "AK", color: "#2E7D32" },
  { initials: "+3", color: "#f1f1f3" },
];

export const mockPermRows: PermRow[] = [
  { id: 1, resource: "Space · Architektur Möbelplaner", kind: "space", depth: 0, read: "explicit", write: "explicit", manage: "none" },
  { id: 2, resource: "Ordner · Zonenlogik", kind: "folder", depth: 1, read: "inherited", write: "inherited", manage: "none" },
  { id: 3, resource: "Dok. · Aufbau-Anleitung", kind: "document", depth: 2, read: "explicit", write: "none", manage: "none" },
  { id: 4, resource: "Ordner · Möbel-Katalog", kind: "folder", depth: 1, read: "explicit", write: "none", manage: "none" },
];
