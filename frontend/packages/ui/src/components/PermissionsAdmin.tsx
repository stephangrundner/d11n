import type { ComponentType } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { DataGrid, type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { d11nTokens } from "../theme";
import { GroupAddIcon, GroupIcon, PublicIcon, SpaceIcon, FolderIcon, DocumentIcon, CheckIcon, SearchIcon } from "../icons";
import { AvatarStack, type Member } from "./primitives";

export type PermState = "explicit" | "inherited" | "none";
export type ResourceKind = "space" | "folder" | "document";

export interface PermGroup {
  id: string | number;
  name: string;
  memberCount: number;
  kind?: "group" | "public";
}

export interface PermRow {
  id: string | number;
  resource: string;
  kind: ResourceKind;
  depth?: number;
  read: PermState;
  write: PermState;
  manage: PermState;
}

export interface PermissionsAdminProps {
  groups: PermGroup[];
  selectedGroupId: string | number;
  onSelectGroup?: (id: string | number) => void;
  members?: Member[];
  rows: PermRow[];
  onNewGroup?: () => void;
}

const RES_ICON: Record<ResourceKind, ComponentType<SvgIconProps>> = { space: SpaceIcon, folder: FolderIcon, document: DocumentIcon };
const RES_COLOR: Record<ResourceKind, string> = { space: d11nTokens.primary, folder: d11nTokens.folder, document: d11nTokens.primary };

function PermCell({ state }: { state: PermState }) {
  if (state === "none") {
    return <Box sx={{ width: 22, height: 22, borderRadius: "5px", boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.25)" }} />;
  }
  const bg = state === "inherited" ? "#9cc0f4" : d11nTokens.primary;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <Box sx={{ width: 22, height: 22, borderRadius: "5px", bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckIcon sx={{ fontSize: 16, color: "#fff" }} />
      </Box>
      {state === "inherited" && <Typography sx={{ fontSize: 9, color: "rgba(0,0,0,0.4)" }}>geerbt</Typography>}
    </Box>
  );
}

/**
 * Admin view: groups & permissions. A group list plus a MUI X DataGrid of
 * resources with Read/Write/Manage permissions (explicit vs. inherited).
 * Visual/mock screen — not yet backed by an API.
 */
export function PermissionsAdmin({ groups, selectedGroupId, onSelectGroup, members = [], rows, onNewGroup }: PermissionsAdminProps) {
  const columns: GridColDef<PermRow>[] = [
    {
      field: "resource",
      headerName: "Ressource",
      flex: 1,
      sortable: false,
      renderCell: (p: GridRenderCellParams<PermRow>) => {
        const Icon = RES_ICON[p.row.kind];
        return (
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: "10px", pl: `${(p.row.depth ?? 0) * 26}px` }}>
            <Icon sx={{ fontSize: 20, color: RES_COLOR[p.row.kind] }} />
            <span>{p.row.resource}</span>
          </Box>
        );
      },
    },
    { field: "read", headerName: "Lesen", width: 130, sortable: false, align: "center", headerAlign: "center", renderCell: (p) => <PermCell state={p.row.read} /> },
    { field: "write", headerName: "Schreiben", width: 130, sortable: false, align: "center", headerAlign: "center", renderCell: (p) => <PermCell state={p.row.write} /> },
    { field: "manage", headerName: "Verwalten", width: 130, sortable: false, align: "center", headerAlign: "center", renderCell: (p) => <PermCell state={p.row.manage} /> },
  ];

  const selected = groups.find((g) => g.id === selectedGroupId);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 26, fontWeight: 400, color: "#1b1b1f", letterSpacing: "-0.2px" }}>Gruppen &amp; Berechtigungen</Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.55)", mt: "3px" }}>Rollen: Benutzer · Admin — feingranulare Rechte an Gruppen</Typography>
        </Box>
        <Button variant="contained" startIcon={<GroupAddIcon sx={{ fontSize: 20 }} />} onClick={onNewGroup}>
          Neue Gruppe
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: "22px", alignItems: "flex-start", flexWrap: { xs: "wrap", md: "nowrap" } }}>
        {/* group list */}
        <Box sx={{ width: 280, flex: "none", bgcolor: "#fff", borderRadius: "12px", boxShadow: d11nTokens.cardShadow, overflow: "hidden" }}>
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", p: "16px 18px 8px" }}>Gruppen</Typography>
          {groups.map((g) => {
            const active = g.id === selectedGroupId;
            const Icon = g.kind === "public" ? PublicIcon : GroupIcon;
            return (
              <Box
                key={g.id}
                onClick={() => onSelectGroup?.(g.id)}
                sx={{ display: "flex", alignItems: "center", gap: "12px", p: "12px 18px", cursor: "pointer", bgcolor: active ? d11nTokens.primaryContainer : "transparent", borderLeft: `3px solid ${active ? d11nTokens.primary : "transparent"}` }}
              >
                <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: active ? d11nTokens.primaryContainerDark : "#f1f1f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon sx={{ fontSize: 21, color: active ? d11nTokens.primary : "rgba(0,0,0,0.55)" }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: active ? 500 : 400, color: "rgba(0,0,0,0.87)" }} noWrap>{g.name}</Typography>
                  <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.55)" }}>{g.memberCount} Mitglieder</Typography>
                </Box>
              </Box>
            );
          })}
          {members.length > 0 && (
            <Box sx={{ p: "14px 18px", borderTop: "1px solid rgba(0,0,0,0.06)", mt: "6px" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", mb: "10px" }}>Mitglieder</Typography>
              <AvatarStack members={members} size={30} />
            </Box>
          )}
        </Box>

        {/* DataGrid */}
        <Box sx={{ flex: 1, minWidth: 0, bgcolor: "#fff", borderRadius: "12px", boxShadow: d11nTokens.cardShadow, overflow: "hidden" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,0.87)" }}>{selected?.name ?? "Gruppe"} — Berechtigungen</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px", height: 34, px: "12px", borderRadius: "6px", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.14)", fontSize: 13, color: "rgba(0,0,0,0.6)" }}>
              <SearchIcon sx={{ fontSize: 18 }} />
              Ressource filtern
            </Box>
          </Box>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowHeight={() => 56}
            disableRowSelectionOnClick
            disableColumnMenu
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            pageSizeOptions={[5, 10]}
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": { bgcolor: d11nTokens.surfaceAlt },
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: "16px", p: "10px 20px", borderTop: "1px solid rgba(0,0,0,0.1)", bgcolor: d11nTokens.surfaceAlt, fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Box sx={{ width: 14, height: 14, borderRadius: "4px", bgcolor: d11nTokens.primary }} />
              explizit gesetzt
            </Box>
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Box sx={{ width: 14, height: 14, borderRadius: "4px", bgcolor: "#9cc0f4" }} />
              geerbt
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
